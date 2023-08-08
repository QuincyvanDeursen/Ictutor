import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User as UserClassFromSchema,
  UserSchema,
} from '../schemas/user.schema';
import { environment } from '../../environment/environment';


@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: UserClassFromSchema.name, schema: UserSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: environment.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}