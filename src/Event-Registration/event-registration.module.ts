
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRegistrationController } from './event-registration.controller';
import { EventRegistrationService } from './event-registration.service';
import { EventRegistration } from './event-registration.entity';
import { Event } from '../Event-creation/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventRegistration, Event])],
  controllers: [EventRegistrationController],
  providers: [EventRegistrationService],
  exports: [EventRegistrationService],
})
export class EventRegistrationModule {}
  