import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkshopService } from './workshop.service';
import { WorkshopController } from './workshop.controller';
import { WorkshopRegistration } from './workshop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkshopRegistration])],
  controllers: [WorkshopController],
  providers: [WorkshopService],
  exports: [WorkshopService],
})
export class WorkshopModule {}