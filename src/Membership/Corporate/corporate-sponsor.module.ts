// src/Membership/Basic/basic-membership.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorporateSponsorController } from './corporate-sponsor.controller';
import { CorporateSponsorService } from './corporate-sponsor.service';
import { CorporateSponsor } from './corporate-sponsor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CorporateSponsor])],
  controllers: [CorporateSponsorController],
  providers: [CorporateSponsorService],
  exports: [CorporateSponsorService],
})
export class CorporateSponsorModule {}