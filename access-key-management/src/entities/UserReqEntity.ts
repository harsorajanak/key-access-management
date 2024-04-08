import { InMemoryDBEntity } from '@nestjs-addons/in-memory-db';

export interface UserReqEntity extends InMemoryDBEntity {
  id: string;
  userId: string;
  reqCount: number;
  timeStamp: number;
}
