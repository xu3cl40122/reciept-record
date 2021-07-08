import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
export enum UserStatus { INITIAL, ENABLED, DISABLED }
export enum UserRoles { ADMIN, NORMAL_USER }
export enum RegisterByEnum { FACEBOOK, EMAIL }

@Entity()
export class User {

	@PrimaryGeneratedColumn("uuid")
	@ApiProperty()
	user_id: string;

	@Column({
		type: "varchar",
		length: 150,
	})
	@ApiProperty()
	profile_name: string;

	@Column({
		type: "varchar",
		length: 150,
		unique: true,
	})
	@ApiProperty()
	email: string;

	@Column({
		type: "varchar",
		length: 150,
		nullable: true
	})
	@ApiProperty()
	phone: string;

	@Column({
		type: "varchar",
		length: 50,
		nullable: true
	})
	@ApiProperty()
	gender: string;

	@Column({
		type: "varchar",
		length: 150,
		// 預設不會被 select 出來
		select: false,
	})
	@ApiProperty()
	password: string;

	@Column({
		type: "varchar",
		enum: UserStatus,
		default: "INITIAL",
		length: 50,
	})
	@ApiProperty({ enum: UserStatus, default: 'INITIAL' })
	user_status: string;

	@Column({
		type: "varchar",
		enum: RegisterByEnum,
		default: "EMAIL",
		length: 50,
	})
	@ApiProperty({ enum: RegisterByEnum, default: 'EMAIL' })
	register_by: string;

	@Column({
		type: "varchar",
		enum: UserRoles,
		default: "NORMAL_USER",
		length: 50,
	})
	@ApiProperty({ enum: UserRoles, default: 'NORMAL_USER' })
	user_role: string;

	@Column({
		type: "varchar",
		nullable: true
	})
	@ApiProperty({ description: '用來存第三方登入的 id' })
	external_id: string;

	@Column({
		type: "varchar",
		nullable: true
	})
	@ApiProperty()
	description: string;

	@Column({
		type: "jsonb",
		default: {}
	})
	@ApiProperty()
	meta: object;

	@CreateDateColumn()
	@ApiProperty()
	created_at: Date;

	@UpdateDateColumn()
	@ApiProperty()
	updated_at: Date;


}
