import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartCodingController } from './startcoding.controller';
import { StartCodingApplication } from './startcoding.entity';
import { StartCodingService } from './startcoding.service';

@Module({
  imports: [TypeOrmModule.forFeature([StartCodingApplication])],
  controllers: [StartCodingController],
  providers: [StartCodingService],
  exports: [StartCodingService],
})
export class StartCodingModule {}