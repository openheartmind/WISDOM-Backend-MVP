import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
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
import { AuthErrorCode } from './auth.error-codes';
import { AuthError, AuthApiError } from '@supabase/supabase-js';
import { ProfileUpdateDto } from './dto/profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private databaseService: DatabaseService,
    private mailerService: MailerService,
    private config: ConfigService<EnvironmentVariables>,
  ) { }

  async signIn(signInDto: SignInDto): Promise<SignInResponseDto> {
    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInDto.email,
        password: signInDto.password,
      });

      // Check for Supabase authentication errors first
      if (error) {
        let errorCode = AuthErrorCode.AUTH_ERROR;
        let errorDetails = 'An authentication error occurred. Please try again.';

        // Map Supabase error codes to our stable error codes
        if (error.code) {
          switch (error.code) {
            case 'invalid_credentials':
              errorCode = AuthErrorCode.INVALID_CREDENTIALS;
              errorDetails = 'The email or password provided is incorrect. Please check your credentials and try again.';
              break;
            case 'email_not_confirmed':
              errorCode = AuthErrorCode.EMAIL_NOT_VERIFIED;
              errorDetails = 'Please check your email and click the verification link before signing in. If you haven\'t received the email, please check your spam folder or request a new verification email.';
              break;
            case 'over_request_rate_limit':
              errorCode = AuthErrorCode.RATE_LIMITED;
              errorDetails = 'You have exceeded the maximum number of sign-in attempts. Please wait a few minutes before trying again.';
              break;
            default:
              errorCode = AuthErrorCode.AUTH_ERROR;
              errorDetails = 'An authentication error occurred. Please try again or contact support if the problem persists.';
          }
        } else if (error instanceof AuthApiError || error instanceof AuthError) {
          // Use built-in Supabase error type checking
          errorCode = AuthErrorCode.AUTH_ERROR;
          errorDetails = 'An authentication error occurred. Please try again or contact support if the problem persists.';
        }

        throw new UnauthorizedException({
          message: 'Authentication failed',
          details: errorDetails,
          code: errorCode,
          status: HttpStatus.UNAUTHORIZED,
          timestamp: new Date().toISOString(),
        });
      }

      // Check if authentication was successful but no session was created
      if (!data?.session?.access_token) {
        throw new UnauthorizedException({
          message: 'Authentication failed',
          details: 'Your credentials were accepted but no session was created. This may be due to account restrictions or system issues. Please try again or contact support.',
          code: AuthErrorCode.AUTH_ERROR,
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
          message: 'Authentication failed',
          details: 'Your authentication was successful, but your account is not properly configured in our system. This may happen if your account was created but not fully set up. Please contact support for assistance.',
          code: AuthErrorCode.AUTH_ERROR,
          status: HttpStatus.UNAUTHORIZED,
          timestamp: new Date().toISOString(),
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
      
      throw new BadRequestException({
        message: 'Authentication failed',
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
          message: 'Sign-up failed',
          details: 'An account with this email address already exists. Please try signing in instead, or use a different email address.',
          code: AuthErrorCode.AUTH_ERROR,
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
        let errorCode = AuthErrorCode.AUTH_ERROR;
        let errorDetails = 'A sign-up error occurred. Please try again.';

        // Map Supabase error codes to our stable error codes
        if (authError.code) {
          switch (authError.code) {
            case 'user_already_exists':
              errorCode = AuthErrorCode.AUTH_ERROR;
              errorDetails = 'An account with this email address already exists. Please try signing in instead, or use a different email address.';
              break;
            case 'weak_password':
              errorCode = AuthErrorCode.AUTH_ERROR;
              errorDetails = 'The password provided is too weak. Please use a stronger password.';
              break;
            case 'email_address_invalid':
              errorCode = AuthErrorCode.AUTH_ERROR;
              errorDetails = 'The email address provided is invalid. Please use a valid email address.';
              break;
            case 'signup_disabled':
              errorCode = AuthErrorCode.AUTH_ERROR;
              errorDetails = 'Sign-up is currently disabled. Please try again later or contact support if the problem persists.';
              break;
            case 'too_many_requests':
            case 'rate_limit_exceeded':
              errorCode = AuthErrorCode.RATE_LIMITED;
              errorDetails = 'You have exceeded the maximum number of sign-up attempts. Please wait a few minutes before trying again.';
              break;
            default:
              errorCode = AuthErrorCode.AUTH_ERROR;
          }
        } else if (authError instanceof AuthApiError || authError instanceof AuthError) {
          // Use built-in Supabase error type checking
          errorCode = AuthErrorCode.AUTH_ERROR;
          errorDetails = 'An authentication error occurred. Please try again or contact support if the problem persists.';
        }

        throw new BadRequestException({
          message: 'Sign-up failed',
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
          fullName: signUpDto.fullName,
          phone: signUpDto.phone,
          country: signUpDto.country,
        })
        .where(eq(users.email, signUpDto.email));
    } else {
      await this.databaseService.db.insert(users).values({
        email: signUpDto.email,
        displayName: signUpDto.displayName,
        fullName: signUpDto.fullName,
        phone: signUpDto.phone,
        country: signUpDto.country,
        authId: authData.user.id,
      });
    }

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
    confirmURL.search = `token=${hashed_token}`;

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

  async updateUserProfile(userId: string, payload: ProfileUpdateDto) {
    try {
      const result = await this.databaseService.db
        .update(users)
        .set(payload)
        .where(eq(users.id, userId))
        .returning();
      return result[0]
    } catch (error) {
      console.error(error);
      throw new UnprocessableEntityException('Unable to update user profile')
    }
  }

  async updatePassword(authId: string, password: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { error } = await supabase.auth.admin.updateUserById(authId, { password });
    if (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
    return {
      success: true
    }
  }

  async sendPasswordRecoveryToken(email: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      email,
      type: 'recovery',
    });
    if (error) {
      throw new BadRequestException({
        message: 'Failed to initiate password recovery',
        details: error.message,
        status: error.status,
      });
    }

    const { email_otp } = data.properties
    const msgInfo = await this.mailerService.send({
      template: join(__dirname, 'email', 'recovery'),
      message: {
        to: email,
      },
      locals: {
        token: email_otp,
      },
    });

    const { rejected, rejectedErrors } = msgInfo;

    if (rejected.length > 0) {
      console.error(rejectedErrors?.at(0))
      throw new UnprocessableEntityException(
        'Email sending failed',
        rejectedErrors?.at(0)?.message
      )
    }
  }

  async recoverAccount(email: string, token: string) {
    const supabase = this.supabaseService.getClient();
    const {
      data: { user, session },
      error,
    } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });

    if (error) {
      throw new ForbiddenException(error);
    }
    if (!user || !session) {
      // this should not occur if no error above
      throw new ForbiddenException('Failed to obtain an auth session')
    }

    // same response as successful signIn
    return { user, accessToken: session.access_token, success: true };
  }

  async updateUserProfile(userId: string, payload: ProfileUpdateDto) {
    try {
      const result = await this.databaseService.db
        .update(users)
        .set(payload)
        .where(eq(users.id, userId))
        .returning();
      return result[0]
    } catch (error) {
      console.error(error);
      throw new UnprocessableEntityException('Unable to update user profile')
    }
  }

  async updatePassword(authId: string, password: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { error } = await supabase.auth.admin.updateUserById(authId, { password });
    if (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
    return {
      success: true
    }
  }

  async sendPasswordRecoveryToken(email: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      email,
      type: 'recovery',
    });
    if (error) {
      throw new BadRequestException({
        message: 'Failed to initiate password recovery',
        details: error.message,
        status: error.status,
      });
    }

    const { email_otp } = data.properties
    const msgInfo = await this.mailerService.send({
      template: join(__dirname, 'email', 'recovery'),
      message: {
        to: email,
      },
      locals: {
        token: email_otp,
      },
    });

    const { rejected, rejectedErrors } = msgInfo;

    if (rejected.length > 0) {
      console.error(rejectedErrors?.at(0))
      throw new UnprocessableEntityException(
        'Email sending failed',
        rejectedErrors?.at(0)?.message
      )
    }
  }

  async recoverAccount(email: string, token: string) {
    const supabase = this.supabaseService.getClient();
    const {
      data: { user, session },
      error,
    } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });

    if (error) {
      throw new ForbiddenException(error);
    }
    if (!user || !session) {
      // this should not occur if no error above
      throw new ForbiddenException('Failed to obtain an auth session')
    }

    // same response as successful signIn
    return { user, accessToken: session.access_token, success: true };
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