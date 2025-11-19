import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

interface UserPayload {
  _id?: string;
  userId?: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await user.comparePassword(pass))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: password, ...result } = user.toJSON();
      return result as any;
    }
    return null;
  }

  login(user: UserPayload) {
    const payload = {
      email: user.email,
      sub: (user.userId || user._id) as string,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
