
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscribeController } from './subscribe.controller';
import { SubscribeService } from './subscribe.service';
import { Subscriber } from './subscribe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber])],
  controllers: [SubscribeController],
  providers: [SubscribeService],
  exports: [SubscribeService],
})
export class SubscribeModule {}