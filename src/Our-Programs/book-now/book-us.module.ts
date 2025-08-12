import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookUsService } from './book-us.service';
import { BookUsController } from './book-us.controller';
import { BookUsApplication } from './book-us.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookUsApplication])],
  controllers: [BookUsController],
  providers: [BookUsService],
  exports: [BookUsService],
})
export class BookUsModule {}