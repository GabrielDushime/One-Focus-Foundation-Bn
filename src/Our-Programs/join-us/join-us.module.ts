import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinUsService } from './join-us.service';
import { JoinUsController } from './join-us.controller';
import { JoinUsApplication } from './join-us.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JoinUsApplication])],
  controllers: [JoinUsController],
  providers: [JoinUsService],
  exports: [JoinUsService],
})
export class JoinUsModule {}