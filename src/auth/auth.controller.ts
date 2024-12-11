import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  @Post('/sign-up')
  @ApiOperation({ summary: 'Sign Up' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: 'Created.' })
  async create(@Body() signUpDto: SignUpDto): Promise<any> {
    return { message: 'Sign Up' };
  }
}
