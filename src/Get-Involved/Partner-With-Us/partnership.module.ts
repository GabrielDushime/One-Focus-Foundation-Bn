import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partnership } from './partnership.entity';
import { PartnershipController } from './partnership.controller';
import { PartnershipService } from './partnership.service';

@Module({
  imports: [TypeOrmModule.forFeature([Partnership])],
  controllers: [PartnershipController],
  providers: [PartnershipService],
  exports: [PartnershipService],
})
export class PartnershipModule {}