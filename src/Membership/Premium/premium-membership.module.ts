// src/Membership/Premium/premium-membership.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PremiumMembershipController } from './premium-membership.controller';
import { PremiumMembershipService } from './premium-membership.service';
import { PremiumMembership } from './premium-membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PremiumMembership])],
  controllers: [PremiumMembershipController],
  providers: [PremiumMembershipService],
  exports: [PremiumMembershipService],
})
export class PremiumMembershipModule {}