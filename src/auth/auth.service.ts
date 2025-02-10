import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  AuthenticateDto,
  AuthenticateResponseDto,
} from './dto/authenticate.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { DatabaseService } from 'src/database/database.service';
import { eq } from 'drizzle-orm';
import { users } from 'src/database/schema';
import { VerifyOtpDto, VerifyOtpResponseDto } from './dto/verify-otp.dto';
import { SignUpDto, SignUpResponseDto } from './dto/sign-up.dto';
import { SignInDto, SignInResponseDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private databaseService: DatabaseService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<SignInResponseDto> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInDto.email,
      password: signInDto.password,
    });
  
    
    if(!data?.session?.access_token){
      throw new BadRequestException({
        message: 'Failed to sign in',
        details: 'Invalid credentials',
        status: HttpStatus.UNAUTHORIZED,
      })
    }

    if (error ) {
      throw new BadRequestException({
        message: 'Failed to sign in',
        details: error.message,
        status: error.status,
      });
    }
    const user = await this.databaseService.db.query.users.findFirst({
      where:eq(users.authId,data.user.id)
    })
    if(!user){
      throw new BadRequestException({
        message: 'Failed to sign in',
        details: 'User not found',
        status: HttpStatus.UNAUTHORIZED,
      })
    }
    return {
      success: true,
      accessToken: data.session.access_token,
      user:user
    };
  }
  async signUp(signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    const supabase = this.supabaseService.getClient();

    
    
    const { data, error } = await supabase.auth.signUp({
      email: signUpDto.email,
      password: signUpDto.password,
    });
    if(data?.user?.id){
      await this.databaseService.db.insert(users).values({
        email: signUpDto.email,
        username: signUpDto.username,
        name: signUpDto.fullName,
        authId: data.user?.id,
      })
    }
   
    if (error) {
      throw new BadRequestException({
        message: 'Failed to sign up',
        details: error.message,
        status: error.status,
      });
    }

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
}
