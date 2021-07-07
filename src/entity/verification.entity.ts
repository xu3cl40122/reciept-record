import {
  Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  Column, ManyToOne, JoinColumn
} from "typeorm";
import { User } from './user.entity'
import { ApiProperty } from '@nestjs/swagger';

export enum VerificationType { ENABLE_ACCOUNT, FORGOT_PASSWORD }

@Entity()
export class Verification {
  constructor(params: { user_id, verification_code, verification_type, expires_at }) {
    let { user_id, verification_code, verification_type, expires_at } = params || {}
    this.user_id = user_id
    this.verification_code = verification_code
    this.verification_type = verification_type
    this.expires_at = expires_at
  }

  @PrimaryGeneratedColumn("uuid")
  @ApiProperty()
  verification_id: string;

  @Column({
    type: 'varchar',
  })
  @ApiProperty()
  user_id: string

  @ManyToOne(() => User, user => user.user_id)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty()
  user_detail: User;

  @Column({
    type: 'varchar',
    length: '50'
  })
  @ApiProperty()
  verification_code: string

  @Column({
    type: 'varchar',
    length: '50',
    enum: VerificationType
  })
  @ApiProperty()
  verification_type: string

  @Column({
    type: 'boolean',
    default: false
  })
  @ApiProperty()
  is_used: boolean

  @Column({
    type: 'timestamp',
  })
  @ApiProperty()
  expires_at: Date

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;

}
