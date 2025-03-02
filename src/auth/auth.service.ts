import { BadRequestException, ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import {
  AuthenticateDto,
  AuthenticateResponseDto,
} from './dto/authenticate.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { DatabaseService } from 'src/database/database.service';
import { eq } from 'drizzle-orm';
import { users } from 'src/database/schema';
import { SignUpDto, SignUpResponseDto } from './dto/sign-up.dto';
import { SignInDto, SignInResponseDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private databaseService: DatabaseService,
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

    const { data: emailData, error: emailError } = await supabase.auth.admin.generateLink({
      email: signUpDto.email,
      type: 'magiclink',
      options: {
        // redirectTo: 'link to verification endpoint'
      }
    })

    if (emailError) {
      throw new BadRequestException({
        message: 'Failed to create sign up email',
        details: emailError.message,
        status: emailError.status,
      });
    }

    console.log('[sign up email payload]: ', emailData.properties);
    // [sign up email payload]: {
    //   action_link: 'http://127.0.0.1:54321/auth/v1/verify?token=fded9f0eb794898996fc4b17a52e88a66515b30f78a1d7b13d10f7b9&type=magiclink&redirect_to=http://127.0.0.1:3000',
    //   email_otp: '368543',
    //   hashed_token: 'fded9f0eb794898996fc4b17a52e88a66515b30f78a1d7b13d10f7b9',
    //   redirect_to: 'http://127.0.0.1:3000',
    //   verification_type: 'magiclink'
    // }
    // TODO: send email with link to backend confirm endpoint: <base URL>/sign-up/confirm?hashed_token=<the hashed token>

    // now that authUser has been created and an email has been sent, create our users entry
    await this.databaseService.db.insert(users).values({
      email: signUpDto.email,
      displayName: signUpDto.displayName,
       
      authId: authData.user.id,
    })

    return {
      success: true
    }
  }
  async verifyEmailWithMagicLink(
    signInDto: AuthenticateDto,
  ): Promise<AuthenticateResponseDto> {

    return {
      success: true,
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

    // we can obtain a session for the user directly if no error
    console.log('[confirmSignUp session]:', session)

    // TODO: instead, we should send a redirect to frontend
    // how would we send the token to frontend in that case?
    // or do we redirect to frontend and require user to sign in afresh?
    return {
      success: true
    };
  }
}
