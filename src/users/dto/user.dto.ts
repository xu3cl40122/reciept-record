import { IsEmail, IsNotEmpty, IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RegisterByEnum } from '../entity/user.entity'

export class UserDto {

	@IsUUID()
	@IsOptional()
	user_id?: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	profile_name: string;

	@IsEmail()
	@ApiProperty()
	email: string;

	@IsString()
	@IsOptional()
	@ApiProperty()
	gender?: string;

	@IsString()
	@IsOptional()
	@ApiProperty()
	phone?: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	password: string;

	@IsString()
	@IsOptional()
	@ApiProperty()
	description?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({ default: 'EMAIL', enum: RegisterByEnum })
	register_by?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({ description: '用來存第三方登入的 id' })
	external_id?: string;

	@IsOptional()
	@ApiProperty()
	meta?: object;

}

export class PasswordDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	password: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	new_password: string;
}
