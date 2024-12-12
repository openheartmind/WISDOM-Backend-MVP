import { Body, Controller, Post } from '@nestjs/common';
import { ServiceRoleSupabaseService } from 'src/supabase/service-role-supabase.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly serviceRole: ServiceRoleSupabaseService,
  ) {}

  @Post('login')
  async login(@Body() { email, password }: LoginDto) {
    const client = this.supabase.getClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  @Post('signup')
  async signUp(@Body() { email, password }: SignUpDto) {
    const client = this.serviceRole.getClient();
    const { error: createUserError } = await client.auth.admin.createUser({
      email,
      password,
    });

    if (createUserError) {
      console.error('unable to create a user', createUserError);
      throw createUserError;
    }

    // since we created the user with auth admin client, we should create and
    // send an email confirmation message manually
    const { data, error: magicLinkError } =
      await client.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          data: {
            // any additional data to store with the user (user metadata)
          },
          // redirectTo: 'link to which the new user should be redirected'
        },
      });

    if (magicLinkError) {
      console.error('unable to generate magic link', magicLinkError);
      throw magicLinkError;
    }

    // instead of data, we should send an email and return some success message
    return data;
  }
}
