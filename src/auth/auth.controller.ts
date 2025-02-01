import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AuthenticateDto,
  AuthenticateResponseDto,
} from './dto/authenticate.dto';
import { AuthService } from './auth.service';
import { VerifyOtpDto, VerifyOtpResponseDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-in')
  @ApiOperation({
    summary: 'Sign In and if user does not exist, create a new user',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticateResponseDto })
  @ApiBody({ type: AuthenticateDto })
  async authenticate(
    @Body() signUpDto: AuthenticateDto,
  ): Promise<AuthenticateResponseDto> {
    return await this.authService.signInWithEmailOtp(signUpDto);
  }

  @Post('/verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: HttpStatus.OK, type: VerifyOtpResponseDto })
  @ApiBody({ type: VerifyOtpDto })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<VerifyOtpResponseDto> {
    return await this.authService.verifyEmailOtp(verifyOtpDto);
  }
}
