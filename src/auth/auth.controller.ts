import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Query,
  UnprocessableEntityException,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthenticateResponseDto } from './dto/authenticate.dto';
import { AuthService } from './auth.service';
import { SignUpDto, SignUpResponseDto, SignUpConfirmDto } from './dto/sign-up.dto';
import { SignInDto, SignInResponseDto } from './dto/sign-in.dto';
import { SuccessDto } from 'src/dto/success.dto';
import { GetUser } from './decorator/get-user.decorator';
import { User } from 'src/database/schema';
import { AuthGuard } from './auth.guard';
import { DecodeInviteResponseDto } from './dto/decode-invite.dto';
import { ProfileUpdateDto } from './dto/profile.dto';
import { InitRecoverPasswordDto, PasswordDto, RecoveryTokenAuthDto } from './dto/password.dto';
import { ProfileUpdateDto } from './dto/profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/sign-up')
  @ApiOperation({ summary: 'Sign up user using email and password' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticateResponseDto })
  @ApiBody({ type: SignUpDto })
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    return await this.authService.signUp(signUpDto);
  }

  @Post('/sign-up/confirm')
  @ApiOperation({ summary: 'Confirm new user email and sign in user' })
  @ApiBody({ type: SignUpConfirmDto })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({ status: HttpStatus.OK, type: SuccessDto })
  async confirmSignUp(@Body() payload: SignUpConfirmDto) {
    return await this.authService.confirmSignUp(payload.hashedToken);
  }

  @Post('/sign-in')
  @ApiOperation({ summary: 'Sign in user using email and password' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticateResponseDto })
  @ApiBody({ type: SignInDto })
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return await this.authService.signIn(signInDto);
  }

  @Get('/me')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async me(@GetUser() user: User) {
    return user;
  }

  @Post('/profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user\'s profile data' })
  async updateProfile(@Body() payload: ProfileUpdateDto, @GetUser() { id }: User) {
    return await this.authService.updateUserProfile(id, payload)
  }

  @Get('/invite/decode')
  @ApiOperation({ summary: 'Decode and verify an invite token' })
  @ApiQuery({
    name: 'token',
    description: 'JWT invite token containing the invited user\'s email',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token successfully decoded',
    type: DecodeInviteResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired token'
  })
  decodeInviteToken(@Query('token') token: string): DecodeInviteResponseDto {
    return this.authService.verifyInviteToken(token);
  }

  @Post('/password')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update password for current user' })
  @ApiResponse({ status: HttpStatus.OK, type: SuccessDto, description: 'Password was updated successfuly' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Authentication required' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Another error occurred' })
  async updatePassword(@Body() { password }: PasswordDto, @GetUser() { authId }: User) {
    if (!authId) {
      // this should not occur so long as we have `AuthGuard`
      throw new UnprocessableEntityException('Authenticated user has no `authId`');
    }

    return await this.authService.updatePassword(authId, password);
  }

  @Post('/forgot-password')
  @HttpCode(204)
  @ApiOperation({ summary: 'Initiate password recovery for a user with the supplied email' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Password recovery email was sent' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'An error occurred' })
  async forgotPassword(@Body() { email }: InitRecoverPasswordDto) {
    return await this.authService.sendPasswordRecoveryToken(email);
  }

  @Post('/recover')
  @ApiOperation({ summary: 'Authorize a user given their email and a password recovery token' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticateResponseDto })
  async recoverAccount(@Body() { email, token }: RecoveryTokenAuthDto) {
    return await this.authService.recoverAccount(email, token)
  }
}
