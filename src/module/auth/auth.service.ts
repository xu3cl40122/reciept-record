import { Injectable, HttpService } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../entity/user.entity';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) { }

  signAccessToken(user: User) {
    const payload = { email: user.email, user_id: user.user_id, user_role: user.user_role };
    return this.jwtService.sign(payload)
  }

  async verifyFbToken(input_token: string) {
    let apiUrl = 'https://graph.facebook.com/debug_token'
    let res = await this.httpService.get(apiUrl, {
      params: {
        input_token,
        access_token: process.env.FB_ACCESS_TOKEN
      }
    }).toPromise()
    let { is_valid, expires_at } = res.data.data
    
    // 驗證合格且未過期
    return is_valid && expires_at * 1000 > new Date().getTime()
  }

}