import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialMediaSupportController } from './media.controller';
import { SocialMediaSupportRequest } from './media.entity';
import { SocialMediaSupportService } from './media.service';

@Module({
  imports: [TypeOrmModule.forFeature([SocialMediaSupportRequest])],
  controllers: [SocialMediaSupportController],
  providers: [SocialMediaSupportService],
  exports: [SocialMediaSupportService],
})
export class SocialMediaSupportModule {}