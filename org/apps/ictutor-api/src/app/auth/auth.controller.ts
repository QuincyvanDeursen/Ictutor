import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    UseGuards
  } from '@nestjs/common';
  import { AuthGuard } from './auth.guard';
  import { AuthService } from './auth.service';
import { SignInDto } from '../dto/signIn.dto';
import { HasRoles } from './roles.decorator';
import { Role, User } from '@org/domain';
import { RolesGuard } from './roles.guard';
  
  @Controller('auth')
  export class AuthController {
    constructor(private authService: AuthService) {}


  
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: SignInDto) {
      return this.authService.signIn(signInDto.username, signInDto.password);
    }

    @Post('register')
    async register(@Body() user: User) {
      try {
        const newUser: User = await this.authService.register(user);
        return { message: 'User created successfully', data: newUser };
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  
    @HasRoles(Role.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    @Get('profile')
    getProfile(@Request() req) {
      return req.user;
    }
  }