import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterNowService } from './register-now.service';
import { RegisterNowController } from './register-now.controller';
import { ConferenceRegistration } from './register-now.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConferenceRegistration])],
  controllers: [RegisterNowController],
  providers: [RegisterNowService],
  exports: [RegisterNowService],
})
export class RegisterNowModule {}