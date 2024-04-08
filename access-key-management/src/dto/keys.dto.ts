import { IsNumber, IsString } from 'class-validator';

export class KeysDTO {
  @IsNumber()
  ttl: number;
  @IsNumber()
  limit: number;
  @IsString()
  accessTokenExpire: string;
}
