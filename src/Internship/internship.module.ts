import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternshipApplicationController } from './internship.controller';
import { InternshipApplication } from './internship.entity';
import { InternshipApplicationService } from './internship.service';

@Module({
  imports: [TypeOrmModule.forFeature([InternshipApplication])],
  controllers: [InternshipApplicationController],
  providers: [InternshipApplicationService],
  exports: [InternshipApplicationService],
})
export class InternshipApplicationModule {}