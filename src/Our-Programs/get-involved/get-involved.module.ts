import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetInvolvedController } from './get-involved.controller';
import { GetInvolvedService } from './get-involved.service';
import { GetInvolved } from './get-involved.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GetInvolved])],
  controllers: [GetInvolvedController],
  providers: [GetInvolvedService],
  exports: [GetInvolvedService],
})
export class GetInvolvedModule {}