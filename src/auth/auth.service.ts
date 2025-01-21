import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  async signUp(signUpDto: SignUpDto) {
    // TODO: Implement actual signup logic with Supabase
    return { message: 'Sign Up successful' };
  }
} 