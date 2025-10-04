// src/Sponsors/Corporate/corporate-sponsor.service.ts

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { CorporateSponsor, SponsorStatus } from './corporate-sponsor.entity';
import { CreateCorporateSponsorDto, UpdateCorporateSponsorDto } from './corporate-sponsor.dto';

@Injectable()
export class CorporateSponsorService {
  constructor(
    @InjectRepository(CorporateSponsor)
    private readonly sponsorRepository: Repository<CorporateSponsor>,
  ) {}

  async createSponsor(createDto: CreateCorporateSponsorDto): Promise<CorporateSponsor> {
    // Validate consent agreements
    if (!createDto.confirmAccuracy || !createDto.agreeToTerms) {
      throw new ConflictException('All consent agreements must be accepted');
    }

    // Check if sponsor with email already exists
    const existingSponsor = await this.sponsorRepository.findOne({ 
      where: { email: createDto.email } 
    });

    if (existingSponsor) {
      throw new ConflictException('A corporate sponsor with this email already exists');
    }

    const sponsor = this.sponsorRepository.create(createDto);
    return await this.sponsorRepository.save(sponsor);
  }

  async findAllSponsors(
    page: number = 1, 
    limit: number = 10, 
    status?: SponsorStatus
  ): Promise<{ sponsors: CorporateSponsor[]; total: number; totalPages: number }> {
    const options: FindManyOptions<CorporateSponsor> = {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    if (status) {
      options.where = { sponsorStatus: status };
    }

    const [sponsors, total] = await this.sponsorRepository.findAndCount(options);
    
    return {
      sponsors,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findSponsorById(id: string): Promise<CorporateSponsor> {
    const sponsor = await this.sponsorRepository.findOne({ where: { id } });
    
    if (!sponsor) {
      throw new NotFoundException(`Corporate sponsor with ID ${id} not found`);
    }

    return sponsor;
  }

  async findSponsorsByEmail(email: string): Promise<CorporateSponsor[]> {
    return this.sponsorRepository.find({ 
      where: { email },
      order: { createdAt: 'DESC' }
    });
  }

  async updateSponsor(id: string, updateDto: UpdateCorporateSponsorDto): Promise<CorporateSponsor> {
    const sponsor = await this.findSponsorById(id);
    Object.assign(sponsor, updateDto);
    return await this.sponsorRepository.save(sponsor);
  }

  async deleteSponsor(id: string): Promise<void> {
    const sponsor = await this.findSponsorById(id);
    await this.sponsorRepository.remove(sponsor);
  }

  async getSponsorStats(): Promise<any> {
    const totalSponsors = await this.sponsorRepository.count();
    const pendingSponsors = await this.sponsorRepository.count({ where: { sponsorStatus: SponsorStatus.PENDING } });
    const approvedSponsors = await this.sponsorRepository.count({ where: { sponsorStatus: SponsorStatus.APPROVED } });
    const activeSponsors = await this.sponsorRepository.count({ where: { sponsorStatus: SponsorStatus.ACTIVE } });
    const inactiveSponsors = await this.sponsorRepository.count({ where: { sponsorStatus: SponsorStatus.INACTIVE } });
    const rejectedSponsors = await this.sponsorRepository.count({ where: { sponsorStatus: SponsorStatus.REJECTED } });

    // Get statistics by organization size
    const orgSizeStats = await this.sponsorRepository
      .createQueryBuilder('sponsor')
      .select('sponsor.organizationSize', 'size')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sponsor.organizationSize')
      .getRawMany();

    const byOrganizationSize = orgSizeStats.reduce((acc, stat) => {
      acc[stat.size] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by sponsorship package
    const packageStats = await this.sponsorRepository
      .createQueryBuilder('sponsor')
      .select('sponsor.sponsorshipPackage', 'package')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sponsor.sponsorshipPackage')
      .getRawMany();

    const bySponsorshipPackage = packageStats.reduce((acc, stat) => {
      acc[stat.package] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by payment method
    const paymentStats = await this.sponsorRepository
      .createQueryBuilder('sponsor')
      .select('sponsor.paymentMethod', 'method')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sponsor.paymentMethod')
      .getRawMany();

    const byPaymentMethod = paymentStats.reduce((acc, stat) => {
      acc[stat.method] = parseInt(stat.count);
      return acc;
    }, {});

    // Sponsorship focus stats (requires special handling for arrays)
    const allSponsors = await this.sponsorRepository.find();
    const bySponsorshipFocus = {};
    allSponsors.forEach(sponsor => {
      sponsor.sponsorshipFocus.forEach(focus => {
        bySponsorshipFocus[focus] = (bySponsorshipFocus[focus] || 0) + 1;
      });
    });

    // Get monthly registrations for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyStats = await this.sponsorRepository
      .createQueryBuilder('sponsor')
      .select('DATE_TRUNC(\'month\', sponsor.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('sponsor.createdAt >= :startDate', { startDate: twelveMonthsAgo })
      .groupBy('DATE_TRUNC(\'month\', sponsor.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthlyRegistrations = monthlyStats.map(stat => ({
      month: new Date(stat.month).toISOString().substring(0, 7),
      count: parseInt(stat.count)
    }));

    return {
      totalSponsors,
      pendingSponsors,
      approvedSponsors,
      activeSponsors,
      inactiveSponsors,
      rejectedSponsors,
      byOrganizationSize,
      bySponsorshipPackage,
      bySponsorshipFocus,
      byPaymentMethod,
      monthlyRegistrations
    };
  }

  async approveSponsor(id: string, adminNotes?: string): Promise<CorporateSponsor> {
    return this.updateSponsor(id, { 
      sponsorStatus: SponsorStatus.APPROVED,
      adminNotes 
    });
  }

  async rejectSponsor(id: string, adminNotes?: string): Promise<CorporateSponsor> {
    return this.updateSponsor(id, { 
      sponsorStatus: SponsorStatus.REJECTED,
      adminNotes 
    });
  }

  async activateSponsor(id: string): Promise<CorporateSponsor> {
    return this.updateSponsor(id, { sponsorStatus: SponsorStatus.ACTIVE });
  }

  async deactivateSponsor(id: string): Promise<CorporateSponsor> {
    return this.updateSponsor(id, { sponsorStatus: SponsorStatus.INACTIVE });
  }
}