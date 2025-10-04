// src/Membership/Basic/basic-membership.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasicMembershipController } from './basic-membership.controller';
import { BasicMembershipService } from './basic-membership.service';
import { BasicMembership } from './basic-membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BasicMembership])],
  controllers: [BasicMembershipController],
  providers: [BasicMembershipService],
  exports: [BasicMembershipService],
})
export class BasicMembershipModule {}