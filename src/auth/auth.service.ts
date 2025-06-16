import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
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
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInDto.email,
      password: signInDto.password,
    });

    if (!data?.session?.access_token) {
      throw new BadRequestException({
        message: 'Failed to sign in',
        details: 'Invalid credentials',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    if (error) {
      throw new BadRequestException({
        message: 'Failed to sign in',
        details: error.message,
        status: error.status,
      });
    }

    const user = await this.databaseService.db.query.users.findFirst({
      where: eq(users.authId, data.user.id),
    });
    if (!user) {
      throw new BadRequestException({
        message: 'Failed to sign in',
        details: 'User not found',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    return {
      success: true,
      accessToken: data.session.access_token,
      user: user,
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    //Check to see if the user email is already in the database and awaiting signup
    const user = await this.databaseService.db.query.users.findFirst({
      where: eq(users.email, signUpDto.email),
    });

    if (user && user.authId != null) {
      throw new BadRequestException({
        message: 'User already exists',
        details: 'User already exists',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const supabase = this.supabaseService.getServiceClient();

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: signUpDto.email,
        password: signUpDto.password,
      });
    if (authError) {
      throw new BadRequestException({
        message: 'Failed to sign up',
        details: authError.message,
        status: authError.status,
      });
    }

    //If the user is missing their authID, continue with sign up
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
        throw new Error(`Email "${rejected[0]}" was rejected`, {
          cause: rejectedErrors,
        });
      }
    } catch (error) {
      console.error('email error', error);
    }

    return {
      success: true,
    };
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
