import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Query,
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/sign-up')
  @ApiOperation({ summary: 'Sign up user using email and password' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticateResponseDto, description: 'Successfully signed up' })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Sign-up failed - account already exists, invalid email, weak password, or rate limited',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Account already exists' },
        details: { type: 'string', example: 'An account with this email address already exists. Please try signing in instead, or use a different email address.' },
        code: { type: 'string', example: 'USER_ALREADY_EXISTS' },
        status: { type: 'number', example: 400 },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
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
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticateResponseDto, description: 'Successfully signed in' })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Authentication failed - invalid credentials, email not verified, account disabled, or rate limited',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid credentials' },
        details: { type: 'string', example: 'The email or password provided is incorrect. Please check your credentials and try again.' },
        code: { type: 'string', example: 'INVALID_CREDENTIALS' },
        status: { type: 'number', example: 401 },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
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
  async decodeInviteToken(@Query('token') token: string): Promise<DecodeInviteResponseDto> {
    return await this.authService.verifyInviteToken(token);
  }
}
