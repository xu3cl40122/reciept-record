import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { RegisterByEnum } from '../entity/user.entity'
export class LoginDto {
  @IsEmail()
  @ApiProperty()
  email: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string

}

export class AuthLoginDto {
  @IsEmail()
  @ApiProperty()
  email: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  external_id: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  profile_name: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  accessToken: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'FACEBOOK', enum: RegisterByEnum })
  register_by: string

  @IsOptional()
  @ApiProperty()
  meta?: object

}


