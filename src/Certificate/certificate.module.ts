import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateRequest } from './certificate.entity';
import { CertificateRequestService } from './certificate.service';
import { CertificateRequestController } from './certificate.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CertificateRequest])],
  controllers: [CertificateRequestController],
  providers: [CertificateRequestService],
  exports: [CertificateRequestService],
})
export class CertificateRequestModule {}