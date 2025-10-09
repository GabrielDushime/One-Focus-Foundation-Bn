
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeGuestController } from './be-guest.controller';
import { BeGuestService } from './be-guest.service';
import { GuestRequest } from './be-guest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuestRequest])],
  controllers: [BeGuestController],
  providers: [BeGuestService],
  exports: [BeGuestService],
})
export class BeGuestModule {}
