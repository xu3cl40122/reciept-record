import {
  Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  Column, ManyToOne, JoinColumn
} from "typeorm";
import { User } from './user.entity'
import { ApiProperty } from '@nestjs/swagger';


@Entity()
export class Receipt {
  constructor() {

  }

  @PrimaryGeneratedColumn("uuid")
  @ApiProperty()
  receipt_id: string;

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
  })
  @ApiProperty({ description: '外部編號(發票上的編號)' })
  external_id: string

  @Column({
    type: 'varchar',
    nullable: true
  })
  @ApiProperty({ description: '商家營業編號之類的' })
  gst_registration: string

  @Column({
    type: 'timestamp',
  })
  @ApiProperty({description: '實體發票被產生的時間'})
  consumed_at:Date

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;

}
