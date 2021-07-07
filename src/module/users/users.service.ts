import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { Verification } from '../../entity/verification.entity';
import { generateVerificationCode } from '../../methods/'
import { UserDto } from '../../dto/user.dto'
import { MessageService } from '../message/message.service'
import * as dayjs from 'dayjs'
import * as bcrypt from 'bcrypt'
import { PageQueryDto } from '../../dto/query.dto'


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Verification) private verificationRepository: Repository<Verification>,
    private messageService: MessageService,
  ) { }
  saltRound = 10

  async addUser(userData: UserDto, user_status = 'INITIAL'): Promise<User> {
    const user = new User();
    let columns = [
      'profile_name',
      'email',
      'phone',
      'gender',
      'description',
      'register_by',
      'external_id',
      'meta',
    ]
    columns.forEach(key => user[key] = userData[key])
    let hashedPwd = await bcrypt.hash(userData.password, this.saltRound)
    user.password = hashedPwd
    user.user_status = user_status
    return await this.usersRepository.save(user);
  }

  async changePassword(user: User, new_password: string): Promise<Object> {
    let hashedPwd = await bcrypt.hash(new_password, this.saltRound)
    return await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ password: hashedPwd })
      .where({ user_id: user.user_id })
      .execute();
  }

  async sendVerification(user: User, verification_type: string, expireMinute = 5) {
    let { email, user_id } = user
    let verification_code = generateVerificationCode()
    let expires_at = dayjs().add(expireMinute, 'minute')
    let verifaction = new Verification({ user_id, verification_type, verification_code, expires_at })
    await this.verificationRepository.save(verifaction)
    return await this.messageService.sendMessage({
      ToAddresses: [email],
      template: 'VERIFY_EMAIL',
      args: { verification_code, verification_type }
    })

  }

  async enableUser(user_id: string) {
    return await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ user_status: 'ENABLED' })
      .where({ user_id })
      .returning('*')
      .execute();
  }

  async editUser(user_id: string, userData: User): Promise<any> {
    let columns = [
      'profile_name',
      'phone',
      'gender',
      'description',
      'meta',
    ]
    let changedPart = {}
    columns.forEach(key => userData[key] != null ? changedPart[key] = userData[key] : null)
    let { raw } = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set(changedPart)
      .where("user_id = :user_id", { user_id })
      .returning('*')
      .execute();

    raw.forEach(user => delete user.password)
    return raw?.[0]
  }

  async queryUsers(reqQuery: PageQueryDto): Promise<Object> {
    let [page, size] = [Number(reqQuery.page ?? 0), Number(reqQuery.size ?? 10)]
    let [content, total] = await this.usersRepository.findAndCount({
      take: size,
      skip: page * size,
      order: {
        created_at: "DESC"
      }
    })

    let totalPage = Math.ceil(total / size)
    return { content, page, size, total, totalPage }
  }

  async findUser(query: { email?: string, user_id?: string }) {
    return await this.usersRepository.findOne(query)
  }

  async findUserWithPwd(query: { email?, user_id?}) {
    let { email, user_id } = query
    let conditon: any = {}
    if (email)
      conditon.email = email
    if (user_id)
      conditon.user_id = user_id

    return await this.usersRepository
      .createQueryBuilder('user')
      .where(conditon)
      .addSelect("user.password")
      .getOne();
  }

  async deleteUser(user_id) {
    let { raw } = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ user_status: 'DISABLED' })
      .where("user_id = :user_id", { user_id })
      .returning('*')
      .execute();

    return raw
  }

  async findVerification(query: { user_id?: string, verification_id?: string, verification_type?: string, is_used?: boolean }) {
    return await this.verificationRepository.findOne({
      where: query,
      order: { created_at: 'DESC' }
    })
  }

  async updateVerification(verifaction: Verification) {
    return await this.verificationRepository.update(verifaction.verification_id, verifaction)
  }

}