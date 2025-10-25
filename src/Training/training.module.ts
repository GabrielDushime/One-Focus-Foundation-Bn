import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingEnrollmentController } from './training.contoller';
import { TrainingEnrollment } from './training.entity';
import { TrainingEnrollmentService } from './training.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingEnrollment])],
  controllers: [TrainingEnrollmentController],
  providers: [TrainingEnrollmentService],
  exports: [TrainingEnrollmentService],
})
export class TrainingEnrollmentModule {}