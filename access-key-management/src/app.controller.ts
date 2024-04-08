import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { KeysDTO } from './dto/keys.dto';
import { Response } from 'express';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

@Controller('/key')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // create access key for the user
  @Get('/create')
  async create(@Res() res: Response) {
    try {
      res.status(HttpStatus.CREATED).json({
        status: true,
        data: await this.appService.createKey(),
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  // delete access key by id
  @Delete('/delete/:id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      res.status(HttpStatus.ACCEPTED).json({
        status: await this.appService.deleteKey(id),
        message: 'key deleted successfully',
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  // update access key by ttl, limit and expiration time
  @Put('/update/:id')
  async update(
    @Param('id') id: string,
    @Body() keysDTO: KeysDTO,
    @Res() res: Response,
  ) {
    try {
      res.status(HttpStatus.ACCEPTED).json({
        status: true,
        data: await this.appService.updateKey(id, keysDTO),
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
  // get access token grpc method
  @GrpcMethod('KeyManagementService', 'GetAccessToken')
  GetAccessToken(data) {
    try {
      return this.appService.getAccessToken(data);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: error,
      });
    }
  }

  // Authorise and rate limit grpc method
  @GrpcMethod('KeyManagementService', 'Authorise')
  async authorise(data) {
    try {
      return await this.appService.authorise(data);
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
