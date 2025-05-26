import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Get,
  Query,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthenticateResponseDto } from './dto/authenticate.dto';
import { AuthService } from './auth.service';
import { SignUpDto, SignUpResponseDto } from './dto/sign-up.dto';
import { SignInDto, SignInResponseDto } from './dto/sign-in.dto';
import { GetUser } from './decorator/get-user.decorator';
import { User } from 'src/database/schema';
import { AuthGuard } from './auth.guard';
import { ProfileDto, ProfileUpdateResponseDto } from './dto/profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  @ApiOperation({ summary: 'Sign up user using email and password' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticateResponseDto })
  @ApiBody({ type: SignUpDto })
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    return await this.authService.signUp(signUpDto);
  }

  @Post('/profile-update')
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticateResponseDto })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: ProfileDto })
  async profileUpdate(
    @Body() profileDto: ProfileDto,
    @GetUser() user: User,
  ): Promise<ProfileUpdateResponseDto> {
    return await this.authService.profileUpdate(profileDto, user.authId);
  }

  // This is a HTTP GET because we expect the user to click on a link to get here
  @Get('/sign-up/confirm')
  @ApiOperation({ summary: 'Confirm new user email and sign in user' })
  @ApiQuery({
    name: 'hashed_token',
    description: 'Email confirmation token hash',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticateResponseDto })
  async confirmSignUp(@Query('hashed_token') hash: string) {
    return await this.authService.confirmSignUp(hash);
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
}
