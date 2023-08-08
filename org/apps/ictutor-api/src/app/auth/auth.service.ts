import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '@org/domain';
import { InjectModel } from '@nestjs/mongoose';
import {
  User as UserClassFromSchema,
  UserDocument,
} from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectModel(UserClassFromSchema.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  //this method signs in a user
  async signIn(email, pass) {
    try {
      //get the user for the given email
      const user = await this.userService.findUserByEmail(email);
      //compare the password with the hashed password stored in the database
      const isPasswordMatch = await bcrypt.compare(pass, user.password);
      if (!isPasswordMatch) {
        throw new UnauthorizedException();
      }
      //Payload is the data that will be encrypted in the JWT
      const payload = {
        _id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      console.log(
        'Error | signIn() | API | auth.service.ts | message: ' + error.message
      );
      throw error.message;
    }
  }
  

  //this method creates a new user
  async register(user: User): Promise<any> {
    try {
      // lowercase all relevant fields for consistency
      user.email = user.email.toLowerCase();
      user.firstName = user.firstName.toLowerCase();
      user.lastName = user.lastName.toLowerCase();

      // Saving user to DB
      const newUser = new this.userModel(user);
      const savedUser = await newUser.save();

      // Exclude password field from the returned user object
      const { password, ...userWithoutPassword } = savedUser.toObject();
      return userWithoutPassword;
    } catch (error) {
      console.log(
        'Error | Register() | API | auth.service.ts | message: ' + error
      );
      if (error.code === 11000) {
        throw new HttpException(
          'Email already in use.',
          HttpStatus.BAD_REQUEST
        );
      }
      throw new HttpException(`Registration failed: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}