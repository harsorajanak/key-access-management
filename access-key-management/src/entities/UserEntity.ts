import { InMemoryDBEntity } from '@nestjs-addons/in-memory-db';

export interface UserEntity extends InMemoryDBEntity {
  accessKey: string;
  accessToken: string;
  ttl: number; // second
  limit: number; // per request
  accessTokenExpire: string;
  createdAt: number;
  isActive: boolean;
}
