import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignineDto } from './dto/signin';
import { SignupDto } from './dto/signup';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signin(@Body() signineDto: SignineDto) {
    return this.authService.signin(signineDto);
  }

  @Post('signup')
  create(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }
}
