import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookShootController } from './bookshoot.controller';
import { BookShootApplication } from './bookshoot.entity';
import { BookShootService } from './bookshoot.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookShootApplication])],
  controllers: [BookShootController],
  providers: [BookShootService],
  exports: [BookShootService],
})
export class BookShootModule {}