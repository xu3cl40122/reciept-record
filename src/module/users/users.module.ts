import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entity/user.entity';
import { Verification } from '../../entity/verification.entity';
import { MessageModule } from '../message/message.module'

@Module({
  // 要把要用到 Repository import 進來
  imports: [
    TypeOrmModule.forFeature([User, Verification]),
    MessageModule,
  ],
  controllers: [UserController],
  providers: [UsersService],
  // 開放給其他人用
  exports: [UsersService]
})
export class UsersModule { }