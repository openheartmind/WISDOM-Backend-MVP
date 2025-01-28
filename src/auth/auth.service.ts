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

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private databaseService: DatabaseService,
  ) {}
  async signInWithEmailOtp(
    signInDto: AuthenticateDto,
  ): Promise<AuthenticateResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithOtp({
      email: signInDto.email,
    });

    if (error) {
      throw new BadRequestException({
        message: 'Failed to send OTP',
        details: error.message,
        status: error.status,
      });
    }
    return {
      success: true,
    };
  }
  async verifyEmailOtp({
    token,
    email,
  }: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email',
    });
    if (error) {
      throw new BadRequestException({
        message: 'Failed to verify OTP',
        details: error.message,
        status: error.status,
      });
    }
    let user = await this.databaseService.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) {
      user = await this.databaseService.db
        .insert(users)
        .values({
          email: email,
        })
        .returning().execute()[0];
      if(!user){
        throw new BadRequestException({
          message: 'Failed to create user',
          details: 'Failed to create user',
          status: HttpStatus.BAD_REQUEST
        });
      }
    }
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: user,
    };
  }
}
