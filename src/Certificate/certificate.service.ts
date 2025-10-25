import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateRequest, CertificateStatus, ProgramType } from './certificate.entity';
import { CreateCertificateRequestDto, UpdateCertificateRequestDto } from './certificate.dto';

@Injectable()
export class CertificateRequestService {
  constructor(
    @InjectRepository(CertificateRequest)
    private readonly certificateRequestRepository: Repository<CertificateRequest>,
  ) {}

  async createRequest(
    createDto: CreateCertificateRequestDto,
  ): Promise<CertificateRequest> {
    const request = this.certificateRequestRepository.create(createDto);
    return await this.certificateRequestRepository.save(request);
  }

  async findAllRequests(
    page: number = 1,
    limit: number = 10,
    status?: CertificateStatus,
    program?: ProgramType,
  ): Promise<{ requests: CertificateRequest[]; total: number }> {
    const queryBuilder = this.certificateRequestRepository.createQueryBuilder('request');

    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    if (program) {
      queryBuilder.andWhere('request.program_completed = :program', { program });
    }

    queryBuilder
      .orderBy('request.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [requests, total] = await queryBuilder.getManyAndCount();

    return { requests, total };
  }

  async findRequestsByEmail(email: string): Promise<CertificateRequest[]> {
    return await this.certificateRequestRepository.find({
      where: { email: email.toLowerCase() },
      order: { createdAt: 'DESC' },
    });
  }

  async findRequestById(id: string): Promise<CertificateRequest> {
    const request = await this.certificateRequestRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Certificate request with ID ${id} not found`);
    }

    return request;
  }

  async findRequestByCertificateNumber(
    certificateNumber: string,
  ): Promise<CertificateRequest> {
    const request = await this.certificateRequestRepository.findOne({
      where: { certificateNumber },
    });

    if (!request) {
      throw new NotFoundException(
        `Certificate with number ${certificateNumber} not found`,
      );
    }

    return request;
  }

  async updateRequest(
    id: string,
    updateDto: UpdateCertificateRequestDto,
  ): Promise<CertificateRequest> {
    const request = await this.findRequestById(id);

    // If certificate number is being set, check uniqueness
    if (updateDto.certificateNumber && updateDto.certificateNumber !== request.certificateNumber) {
      const existing = await this.certificateRequestRepository.findOne({
        where: { certificateNumber: updateDto.certificateNumber },
      });
      if (existing) {
        throw new BadRequestException('Certificate number already exists');
      }
    }

    Object.assign(request, updateDto);
    return await this.certificateRequestRepository.save(request);
  }

  async issueRequest(id: string, certificateUrl: string): Promise<CertificateRequest> {
    const request = await this.findRequestById(id);

    // Generate certificate number if not exists
    if (!request.certificateNumber) {
      request.certificateNumber = await this.generateCertificateNumber();
    }

    request.certificateUrl = certificateUrl;
    request.status = CertificateStatus.ISSUED;
    request.issuedDate = new Date();

    return await this.certificateRequestRepository.save(request);
  }

  async deleteRequest(id: string): Promise<void> {
    const request = await this.findRequestById(id);
    await this.certificateRequestRepository.remove(request);
  }

  async getStatistics(program?: ProgramType): Promise<any> {
    const queryBuilder = this.certificateRequestRepository.createQueryBuilder('request');

    if (program) {
      queryBuilder.where('request.program_completed = :program', { program });
    }

    const total = await queryBuilder.getCount();

    const statusCounts = await queryBuilder
      .select('request.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('request.status')
      .getRawMany();

    const programCounts = await this.certificateRequestRepository
      .createQueryBuilder('request')
      .select('request.program_completed', 'program')
      .addSelect('COUNT(*)', 'count')
      .groupBy('request.program_completed')
      .getRawMany();

    return {
      total,
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      byProgram: programCounts.reduce((acc, item) => {
        acc[item.program] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  private async generateCertificateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.certificateRequestRepository.count();
    const number = (count + 1).toString().padStart(6, '0');
    return `CERT-${year}-${number}`;
  }
}