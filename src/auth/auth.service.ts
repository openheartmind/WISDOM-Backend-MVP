import { BadRequestException, ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { DatabaseService } from 'src/database/database.service';
import { eq } from 'drizzle-orm';
import { users } from 'src/database/schema';
import { SignUpDto, SignUpResponseDto } from './dto/sign-up.dto';
import { SignInDto, SignInResponseDto } from './dto/sign-in.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { join } from 'path';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private databaseService: DatabaseService,
    private mailerService: MailerService,
  ) { }

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
      })
    }

    if (error) {
      throw new BadRequestException({
        message: 'Failed to sign in',
        details: error.message,
        status: error.status,
      });
    }

    const user = await this.databaseService.db.query.users.findFirst({
      where: eq(users.authId, data.user.id)
    })
    if (!user) {
      throw new BadRequestException({
        message: 'Failed to sign in',
        details: 'User not found',
        status: HttpStatus.UNAUTHORIZED,
      })
    }

    return {
      success: true,
      accessToken: data.session.access_token,
      user: user
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    const supabase = this.supabaseService.getServiceClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
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

    await this.databaseService.db.insert(users).values({
      email: signUpDto.email,
      displayName: signUpDto.displayName,

      authId: authData.user.id,
    });

    try {
      await this.emailSignUpConfirmation(signUpDto.email, signUpDto.displayName);
    } catch (error) {
      console.error('email error', error);
    }

    return {
      success: true
    };
  }

  async confirmSignUp(token_hash: string) {
    const supabase = this.supabaseService.getClient()
    const {
      data: { session },
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
      success: true
    };
  }

  private async emailSignUpConfirmation(email: string, displayName?: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      email,
      type: 'magiclink'
    });

    if (error) {
      throw new BadRequestException({
        message: 'Failed to create sign up email',
        details: error.message,
        status: error.status,
      });
    }

    const { hashed_token } = data.properties;
    const msgInfo = await this.mailerService.send({
      template: join(__dirname, 'email', 'confirm'),
      message: {
        to: email
      },
      locals: {
        displayName,
        hashed_token,
        baseURL: 'http://localhost:3000'
      }
    })

    return msgInfo;
  }
}
