import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorController } from './mentor.controller';
import { MentorService } from './mentor.service';
import { Mentor } from './mentor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mentor])],
  controllers: [MentorController],
  providers: [MentorService],
  exports: [MentorService],
})
export class MentorModule {}