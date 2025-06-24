import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { DatabaseService } from 'src/database/database.service';
import { eq } from 'drizzle-orm';
import { instances, users } from 'src/database/schema';
import { SignUpDto, SignUpResponseDto } from './dto/sign-up.dto';
import { SignInDto, SignInResponseDto } from './dto/sign-in.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/app-config';
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private databaseService: DatabaseService,
    private mailerService: MailerService,
    private config: ConfigService<EnvironmentVariables>,
  ) {}

  async signIn(signInDto: SignInDto): Promise<SignInResponseDto> {
    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInDto.email,
        password: signInDto.password,
      });

      // Check for Supabase authentication errors first
      if (error) {
        let errorMessage = 'Authentication failed';
        let errorDetails = 'Unable to authenticate with the provided credentials';
        let errorCode = 'AUTH_ERROR';

        // Provide more specific error messages based on Supabase error types
        switch (error.message) {
          case 'Invalid login credentials':
            // Keep this vague to prevent DoS attacks
            errorMessage = 'Invalid credentials';
            errorDetails = 'The email or password provided is incorrect. Please check your credentials and try again.';
            errorCode = 'INVALID_CREDENTIALS';
            break;
          case 'Email not confirmed':
            errorMessage = 'Email verification required';
            errorDetails = 'Please check your email and click the verification link before signing in. If you haven\'t received the email, please check your spam folder or request a new verification email.';
            errorCode = 'EMAIL_NOT_VERIFIED';
            break;
          case 'Too many requests':
            errorMessage = 'Too many sign-in attempts';
            errorDetails = 'You have exceeded the maximum number of sign-in attempts. Please wait a few minutes before trying again.';
            errorCode = 'RATE_LIMITED';
            break;
          case 'User not found':
            // Keep this vague to prevent user enumeration
            errorMessage = 'Invalid credentials';
            errorDetails = 'The email or password provided is incorrect. Please check your credentials and try again.';
            errorCode = 'INVALID_CREDENTIALS';
            break;
          case 'User is disabled':
            errorMessage = 'Account disabled';
            errorDetails = 'Your account has been disabled. Please contact support for assistance.';
            errorCode = 'ACCOUNT_DISABLED';
            break;
          default:
            errorDetails = `Authentication error: ${error.message}`;
        }

        throw new UnauthorizedException({
          message: errorMessage,
          details: errorDetails,
          code: errorCode,
          status: HttpStatus.UNAUTHORIZED,
          timestamp: new Date().toISOString(),
        });
      }

      // Check if authentication was successful but no session was created
      if (!data?.session?.access_token) {
        throw new UnauthorizedException({
          message: 'Authentication incomplete',
          details: 'Your credentials were accepted but no session was created. This may be due to account restrictions or system issues. Please try again or contact support.',
          code: 'NO_SESSION',
          status: HttpStatus.UNAUTHORIZED,
          timestamp: new Date().toISOString(),
        });
      }

      // Verify user exists in our database
      const user = await this.databaseService.db.query.users.findFirst({
        where: eq(users.authId, data.user.id),
      });
      
      if (!user) {
        throw new UnauthorizedException({
          message: 'Account not properly configured',
          details: 'Your authentication was successful, but your account is not properly configured in our system. This may happen if your account was created but not fully set up. Please contact support for assistance.',
          code: 'USER_NOT_CONFIGURED',
          status: HttpStatus.UNAUTHORIZED,
          timestamp: new Date().toISOString(),
          authId: data.user.id, // Include auth ID for debugging
        });
      }

      return {
        success: true,
        accessToken: data.session.access_token,
        user: user,
      };
    } catch (error) {
      // If it's already a BadRequestException or UnauthorizedException, re-throw it
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle unexpected errors
      console.error('Unexpected error during sign-in:', error);
      
      throw new BadRequestException({
        message: 'Sign-in failed',
        details: 'An unexpected error occurred during sign-in. Please try again later or contact support if the problem persists.',
        code: 'INTERNAL_ERROR',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    try {
      // Check to see if the user email is already in the database and awaiting signup
      const user = await this.databaseService.db.query.users.findFirst({
        where: eq(users.email, signUpDto.email),
      });

      if (user && user.authId != null) {
        throw new BadRequestException({
          message: 'Account already exists',
          details: 'An account with this email address already exists. Please try signing in instead, or use a different email address.',
          code: 'USER_ALREADY_EXISTS',
          status: HttpStatus.BAD_REQUEST,
          timestamp: new Date().toISOString(),
        });
      }

      const supabase = this.supabaseService.getServiceClient();

      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: signUpDto.email,
          password: signUpDto.password,
        });

      if (authError) {
        let errorMessage = 'Sign-up failed';
        let errorDetails = 'Unable to create your account. Please try again.';
        let errorCode = 'SIGNUP_ERROR';

        // Provide specific error messages for common sign-up issues
        switch (authError.message) {
          case 'User already registered':
            errorMessage = 'Account already exists';
            errorDetails = 'An account with this email address already exists. Please try signing in instead, or use a different email address.';
            errorCode = 'USER_ALREADY_EXISTS';
            break;
          case 'Password should be at least 6 characters':
            errorMessage = 'Password too short';
            errorDetails = 'Your password must be at least 6 characters long. Please choose a stronger password.';
            errorCode = 'WEAK_PASSWORD';
            break;
          case 'Invalid email':
            errorMessage = 'Invalid email address';
            errorDetails = 'Please provide a valid email address.';
            errorCode = 'INVALID_EMAIL';
            break;
          case 'Signup disabled':
            errorMessage = 'Sign-up disabled';
            errorDetails = 'New account creation is currently disabled. Please contact support for assistance.';
            errorCode = 'SIGNUP_DISABLED';
            break;
          case 'Too many requests':
            errorMessage = 'Too many sign-up attempts';
            errorDetails = 'You have exceeded the maximum number of sign-up attempts. Please wait a few minutes before trying again.';
            errorCode = 'RATE_LIMITED';
            break;
          default:
            errorDetails = `Sign-up error: ${authError.message}`;
        }

        throw new BadRequestException({
          message: errorMessage,
          details: errorDetails,
          code: errorCode,
          status: authError.status || HttpStatus.BAD_REQUEST,
          timestamp: new Date().toISOString(),
        });
      }

      // If the user is missing their authID, continue with sign up
      if (user && !user.authId) {
        await this.databaseService.db
          .update(users)
          .set({
            authId: authData.user.id,
            displayName: signUpDto.displayName,
            ...(signUpDto.fullName && { fullName: signUpDto.fullName }),
            ...(signUpDto.phone && { phone: signUpDto.phone }),
            ...(signUpDto.country && { country: signUpDto.country }),
          })
          .where(eq(users.email, signUpDto.email));
      } else {
        await this.databaseService.db.insert(users).values({
          email: signUpDto.email,
          displayName: signUpDto.displayName,
          
          ...(signUpDto.fullName && { fullName: signUpDto.fullName }),
          ...(signUpDto.phone && { phone: signUpDto.phone }),
          ...(signUpDto.country && { country: signUpDto.country }),

          authId: authData.user.id,
        });
      }

      try {
        const { rejected, rejectedErrors } = await this.emailSignUpConfirmation(
          signUpDto.email,
          signUpDto.displayName,
        );

        if (rejected.length > 0) {
          console.error('Email confirmation failed:', rejected, rejectedErrors);
          // Don't fail the sign-up if email fails, just log it
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        // Don't fail the sign-up if email fails, just log it
      }

      return {
        success: true,
      };
    } catch (error) {
      // If it's already a BadRequestException, re-throw it
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle unexpected errors
      console.error('Unexpected error during sign-up:', error);
      
      throw new BadRequestException({
        message: 'Sign-up failed',
        details: 'An unexpected error occurred during sign-up. Please try again later or contact support if the problem persists.',
        code: 'INTERNAL_ERROR',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async confirmSignUp(token_hash: string) {
    const supabase = this.supabaseService.getClient();
    const {
      // data: { session },
      error,
    } = await supabase.auth.verifyOtp({ token_hash, type: 'magiclink' });

    if (error) {
      // TODO: lazy! process/customize response
      throw new ForbiddenException(error);
    }

    // TODO: instead, we should send a redirect to frontend
    // how would we send the token to frontend in that case?
    // or do we redirect to frontend and require user to sign in afresh?
    return {
      success: true,
    };
  }

  private async emailSignUpConfirmation(email: string, displayName?: string) {
    const confirmBaseURL = this.config.getOrThrow<string>(
      'SIGNUP_CONFIRM_BASE_URL',
    );
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      email,
      type: 'magiclink',
    });

    if (error) {
      throw new BadRequestException({
        message: 'Failed to create sign up email',
        details: error.message,
        status: error.status,
      });
    }

    const { hashed_token } = data.properties;
    const confirmURL = new URL(confirmBaseURL);
    confirmURL.search = `hashed_token=${hashed_token}`;

    const msgInfo = await this.mailerService.send({
      template: join(__dirname, 'email', 'confirm'),
      message: {
        to: email,
      },
      locals: {
        displayName,
        confirmURL: confirmURL.toString(),
      },
    });

    return msgInfo;
  }

  /**
   * Invite a user to join an instance
   * @param email The email of the user to invite
   * @param instanceId The id of the instance to invite the user to
   */
  async inviteUser(email: string, instanceId?: string, inviterName?: string) {
    const supabase = this.supabaseService.getServiceClient();
    const signupURL = this.config.getOrThrow<string>('SIGNUP_URL');

    //Create the user in the database, and send an email to the user to begin sign up.
    //Generate a random display name for now
    const shortName: string = uniqueNamesGenerator({
      dictionaries: [colors, adjectives, animals],
    });

    await this.databaseService.db.insert(users).values({
      email: email,
      displayName: shortName,
    });

    const instance = await this.databaseService.db.query.instances.findFirst({
      where: eq(instances.id, instanceId || ''),
    });

    //send email via mailerService
    const msgInfo = await this.mailerService.send({
      template: join(__dirname, 'email', 'invite'),
      message: {
        to: email,
      },
      locals: {
        instanceName: instance?.title ?? 'Wisdom',
        inviterName: inviterName ?? 'Wisdom',
        signUpURL: this.generateInviteLink(email),
      },
    });
  }

  private generateInviteLink(email: string) {
    const token = this.generateInviteToken(email);
    const inviteURL = new URL(this.config.getOrThrow<string>('SIGNUP_URL'));
    inviteURL.search = `token=${token}`;
    return inviteURL.toString();
  }

  private generateInviteToken(email: string) {
    const payload = { email };
    return jwt.sign(payload, this.config.getOrThrow<string>('INVITE_SECRET'), {
      expiresIn: '7d',
    });
  }

  public verifyInviteToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.config.getOrThrow<string>('INVITE_SECRET')) as { email: string; iat: number; exp: number };
      return {
        email: decoded.email,
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Invalid or expired invite token',
        details: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
}