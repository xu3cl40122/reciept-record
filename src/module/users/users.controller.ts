import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserDto, PasswordDto } from '../../dto/user.dto'
import { VerificationDto, SendEmailDto, ResetPasswordDto } from '../../dto/verification.dto'
import { User } from '../../entity/user.entity';
import { ApiOkResponse, ApiCreatedResponse, ApiHeader, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { getManyResponseFor } from '../../methods/spec'
import { PageQueryDto } from '../../dto/query.dto'
import * as dayjs from 'dayjs'
import * as bcrypt from 'bcrypt'

@ApiTags('users')
@Controller()
export class UserController {
  resendMinute: number
  expireMinute: number
  constructor(
    private readonly userService: UsersService,
  ) {
    this.resendMinute = 3
    this.expireMinute = 5
  }

  // admin create user (省略驗證 email)
  @Post('admin/users')
  @ApiOperation({ summary: 'Admin 建立使用者(省略 email 驗證)' })
  @UseGuards(JwtAuthGuard)
  @ApiHeader({ name: 'Authorization', description: 'JWT' })
  @ApiCreatedResponse({ type: User })
  async adminAddUser(@Req() req, @Body() body: UserDto): Promise<User> {
    if (req.payload.user_role !== 'ADMIN')
      throw new HttpException('permission denied', HttpStatus.FORBIDDEN)
    return this.userService.addUser(body, 'ENABLED')
      .catch(error => {
        console.log(error)
        if (error.code === '23505')
          throw new HttpException('duplicate email', HttpStatus.BAD_REQUEST)
        throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR)
      })
  }

  @Put('admin/users/:user_id')
  @ApiOperation({ summary: 'Admin 修改使用者' })
  @UseGuards(JwtAuthGuard)
  @ApiHeader({ name: 'Authorization', description: 'JWT' })
  @ApiOkResponse({ type: User })
  async adminUpdateUser(@Req() req, @Param('user_id') id: string, @Body() userData): Promise<Object> {
    if (req.payload.user_role !== 'ADMIN')
      throw new HttpException('permission denied', HttpStatus.FORBIDDEN)
    let user = await this.userService.editUser(id, userData);
    if (!user) throw new HttpException('user_id not found', HttpStatus.BAD_REQUEST)

    return user
  }

  @Delete('admin/users/:user_id')
  @ApiOperation({ summary: 'admin 停用帳號' })
  @UseGuards(JwtAuthGuard)
  @ApiHeader({ name: 'Authorization', description: 'JWT' })
  @ApiOkResponse({ type: User })
  async adminDisableUser(@Req() req, @Param('user_id') user_id) {
    if (req.payload.user_role !== 'ADMIN')
      throw new HttpException('permission denied', HttpStatus.FORBIDDEN)
    return this.userService.deleteUser(user_id)
  }

  @Post('register')
  @ApiOperation({ summary: '註冊帳號(產生的 user entity 需透過 email 驗證才能啟用)' })
  @ApiCreatedResponse({ type: User })
  async register(@Body() body: UserDto): Promise<User> {
    return this.userService.addUser(body)
      .catch(error => {
        if (error.code === '23505')
          throw new HttpException('duplicate email', HttpStatus.BAD_REQUEST)
        throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR)
      })
  }

  @Put('users/verification')
  @ApiOperation({ summary: '發送啟用帳號驗證信' })
  async sendVerification(@Body() body: SendEmailDto) {
    let { email } = body
    let verification_type = 'ENABLE_ACCOUNT'
    let user = await this.userService.findUser({ email })
    if (!user)
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST)
    if (user.user_status !== 'INITIAL')
      throw new HttpException('not initial user', HttpStatus.BAD_REQUEST)

    let { user_id } = user
    let lastVerification = await this.userService.findVerification({ user_id, verification_type, is_used: false })
    if (lastVerification && !dayjs(lastVerification.created_at).add(this.resendMinute, 'minute').isBefore(dayjs()))
      throw new HttpException('request later', HttpStatus.NOT_ACCEPTABLE)

    return this.userService.sendVerification(user, verification_type, this.expireMinute)
  }

  @Put('users/enable')
  @ApiOperation({ summary: '用驗證碼啟用帳號' })
  async enableUser(@Req() req, @Body() body: VerificationDto) {
    let { verification_code, email } = body
    let user = await this.userService.findUser({ email })
    if (!user)
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST)
    let { user_id } = user
    let verification_type = 'ENABLE_ACCOUNT'
    let verification = await this.userService.findVerification({ user_id, verification_type, is_used: false })

    if (dayjs(verification.expires_at).isBefore(dayjs()))
      throw new HttpException('code expired', HttpStatus.NOT_ACCEPTABLE)
    if (verification.verification_code !== verification_code)
      throw new HttpException('wrong verification code', HttpStatus.BAD_REQUEST)

    verification.is_used = true
    this.userService.updateVerification(verification)
    return this.userService.enableUser(user_id)
  }

  @Put('users/password')
  @ApiOperation({ summary: '變更密碼' })
  @UseGuards(JwtAuthGuard)
  @ApiHeader({ name: 'Authorization', description: 'JWT' })
  async changePassword(@Req() req, @Body() body: PasswordDto) {
    let user = await this.userService.findUserWithPwd({ user_id: req.payload.user_id })
    let pass = await bcrypt.compare(body.password, user.password)
    if (!pass) throw new HttpException('wrong password', HttpStatus.UNAUTHORIZED)
    if (body.new_password.length < 8) throw new HttpException('invalid password formate', HttpStatus.BAD_REQUEST)

    return this.userService.changePassword(user, body.new_password)
  }

  // 發 email 驗證碼
  @Put('forgot/verification')
  @ApiOperation({ summary: '發忘記密碼驗證碼' })
  async forgotPassword(@Body() body: SendEmailDto) {
    let { email } = body
    let verification_type = 'FORGOT_PASSWORD'
    let user = await this.userService.findUser({ email })
    if (!user)
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST)

    let { user_id } = user
    let lastVerification = await this.userService.findVerification({ user_id, verification_type, is_used: false })
    if (lastVerification && !dayjs(lastVerification.created_at).add(this.resendMinute, 'minute').isBefore(dayjs()))
      throw new HttpException('request later', HttpStatus.NOT_ACCEPTABLE)

    return this.userService.sendVerification(user, verification_type)
  }

  // 發 email 驗證碼
  @Put('forgot/reset_password')
  @ApiOperation({ summary: '用驗證碼重設密碼' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    let { verification_code, email, password } = body
    let user = await this.userService.findUser({ email })
    if (!user)
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST)
    let { user_id } = user
    let verification_type = 'FORGOT_PASSWORD'
    let verification = await this.userService.findVerification({ user_id, verification_type, is_used: false })

    if (dayjs(verification.expires_at).isBefore(dayjs()))
      throw new HttpException('code expired', HttpStatus.NOT_ACCEPTABLE)
    if (verification.verification_code !== verification_code)
      throw new HttpException('wrong verification code', HttpStatus.BAD_REQUEST)

    verification.is_used = true
    this.userService.updateVerification(verification)
    return this.userService.changePassword(user, password)
  }

  @Get('profile')
  @ApiOperation({ summary: '取得登入帳號 profile' })
  @UseGuards(JwtAuthGuard)
  @ApiHeader({ name: 'Authorization', description: 'JWT' })
  @ApiOkResponse({ type: User })
  async getSelfProfile(@Req() req): Promise<User> {
    let user = await this.userService.findUser({ user_id: req.payload.user_id })
    if (!user)
      throw new HttpException('user_id not found', HttpStatus.NOT_FOUND)
    return user
  }

  @Put('profile')
  @ApiOperation({ summary: '修改登入帳號 profile' })
  @UseGuards(JwtAuthGuard)
  @ApiHeader({ name: 'Authorization', description: 'JWT' })
  @ApiOkResponse({ type: User })
  async updateSelfProfile(@Req() req, @Body() userData): Promise<Object> {
    let res = await this.userService.editUser(req.payload.user_id, userData);
    if (!res)
      throw new HttpException('user_id not found', HttpStatus.BAD_REQUEST)
    return res
  }

  @Get('users')
  @ApiOperation({ summary: '查詢所有使用者' })
  @UseGuards(JwtAuthGuard)
  @ApiHeader({ name: 'Authorization', description: 'JWT' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'size', type: Number, required: false })
  @ApiOkResponse({ type: getManyResponseFor(User) })
  async queryUsers(@Query() reqQuery: PageQueryDto): Promise<Object> {
    return this.userService.queryUsers(reqQuery);
  }

  @Get('users/:user_id')
  @ApiOperation({ summary: '用 user_id 取回使用者' })
  @UseGuards(JwtAuthGuard)
  @ApiHeader({ name: 'Authorization', description: 'JWT' })
  @ApiOkResponse({ type: User })
  async user(@Param('user_id') user_id: string): Promise<Object> {
    return this.userService.findUser({ user_id })
  }

  @Delete('users')
  @ApiOperation({ summary: '停用自己的帳號' })
  @UseGuards(JwtAuthGuard)
  @ApiHeader({ name: 'Authorization', description: 'JWT' })
  @ApiOkResponse({ type: User })
  async disableSelfUser(@Req() req) {
    let sender_id = req.payload.user_id
    return this.userService.deleteUser(sender_id)
  }
}