
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetInvolvedActionsController } from './get-involved-actions.controller';
import { GetInvolvedActionsService } from './get-involved-actions.service';
import { GetInvolvedAction } from './get-involved-actions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GetInvolvedAction])],
  controllers: [GetInvolvedActionsController],
  providers: [GetInvolvedActionsService],
  exports: [GetInvolvedActionsService],
})
export class GetInvolvedActionsModule {}