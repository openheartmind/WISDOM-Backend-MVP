import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AuthenticateDto,
  AuthenticateResponseDto,
} from './dto/authenticate.dto';
import { AuthService } from './auth.service';
import { VerifyOtpDto, VerifyOtpResponseDto } from './dto/verify-otp.dto';
import { SignUpDto, SignUpResponseDto } from './dto/sign-up.dto';
import { SignInDto, SignInResponseDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

    @Post('/sign-up')
    @ApiOperation({ summary: 'Sign up user using email and password' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({ status: HttpStatus.OK,type: AuthenticateResponseDto})
    @ApiBody({ type: SignUpDto })
    async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
       return await this.authService.signUp(signUpDto);
    }


    @Post('/sign-in')
    @ApiOperation({ summary: 'Sign in user using email and password' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({ status: HttpStatus.OK,type: AuthenticateResponseDto})
    @ApiBody({ type: SignInDto })
    async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
       return await this.authService.signIn(signInDto);
    }
}
