import { InMemoryDBService } from '@nestjs-addons/in-memory-db';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from './entities/UserEntity';
import { JwtService } from '@nestjs/jwt';
import { generateKeySync } from 'crypto';
import { ACCESS_KEY_LEN, JWT_DEFAULT_EXP, SECRET_KEY } from './constant';
import { KeysDTO } from './dto/keys.dto';
import { UserReqEntity } from './entities/UserReqEntity';

@Injectable()
export class AppService {
  constructor(
    private readonly userService: InMemoryDBService<UserEntity>,
    private readonly userReqService: InMemoryDBService<UserReqEntity>,
    private jwtService: JwtService,
  ) {}

  async createKey() {
    const payload = {
      accessKey: generateKeySync('hmac', { length: ACCESS_KEY_LEN })
        .export()
        .toString('hex'),
      accessToken: '',
      ttl: 60,
      limit: 5,
      accessTokenExpire: JWT_DEFAULT_EXP,
      createdAt: new Date().getTime(),
      isActive: true,
    };
    payload.accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: JWT_DEFAULT_EXP,
    });
    const user = this.userService.create(payload);
    return {
      id: user.id,
      accessKey: user.accessKey,
      ttl: user.ttl,
      limit: user.limit,
      accessTokenExpire: user.accessTokenExpire,
    };
  }

  async deleteKey(id: string) {
    const user = this.userService.get(id);
    user.isActive = false;
    this.userService.update(user);
    return true;
  }

  async updateKey(id: string, payload: KeysDTO) {
    const user = this.userService.query(
      (record) => record.id === id && record.isActive === true,
    );

    if (user.length <= 0) {
      throw new HttpException('Key not found', HttpStatus.NOT_FOUND);
    }
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: payload.accessTokenExpire,
    });
    user[0].ttl = payload.ttl;
    user[0].limit = payload.limit;
    user[0].accessTokenExpire = payload.accessTokenExpire;
    user[0].accessToken = accessToken;
    this.userService.update(user[0]);
    return {
      id: user[0].id,
      accessKey: user[0].accessKey,
      ttl: user[0].ttl,
      limit: user[0].limit,
      accessTokenExpire: user[0].accessTokenExpire,
      accessToken: accessToken,
    };
  }

  getAccessToken(data) {
    const user = this.userService.query(
      (record) => record.accessKey === data.accessKey,
    );

    if (user.length <= 0) {
      throw new HttpException('access key not found', HttpStatus.NOT_FOUND);
    }

    return {
      accessToken: user[0]?.accessToken,
    };
  }

  async authorise(data) {
    try {
      // validate user
      const user = this.userService.query(
        (record) =>
          record.accessToken === data.accessToken && record.isActive === true,
      );
      if (user.length <= 0)
        throw new UnauthorizedException('Access token is expired');
      // validate access token
      await this.jwtService.verifyAsync(data?.accessToken, {
        secret: SECRET_KEY,
      });

      const userReq = this.userReqService.query(
        (record) => record.userId === user[0].id,
      );

      const currT = new Date().getTime() / 1000;
      // rate limiter
      if (userReq.length > 0) {
        const seconds = currT - userReq[0].timeStamp;
        if (seconds > user[0].ttl) {
          userReq[0].reqCount = 1;
          userReq[0].timeStamp = currT;
          this.userReqService.update(userReq[0]);
        } else if (
          seconds < user[0].ttl &&
          userReq[0].reqCount <= user[0].limit
        ) {
          userReq[0].reqCount = userReq[0].reqCount + 1;
          this.userReqService.update(userReq[0]);
        } else if (
          seconds < user[0].ttl &&
          userReq[0].reqCount > user[0].limit
        ) {
          throw new UnauthorizedException(
            'Too many request: please upgrade your plan',
          );
        }
      } else {
        this.userReqService.create({
          userId: user[0].id,
          reqCount: 1,
          timeStamp: currT,
        });
      }
      return {
        status: true,
        message: 'Authorized success',
      };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
