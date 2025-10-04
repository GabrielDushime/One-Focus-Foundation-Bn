// src/Membership/Premium/premium-membership.service.ts

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { PremiumMembership, PremiumMembershipStatus } from './premium-membership.entity';
import { CreatePremiumMembershipDto, UpdatePremiumMembershipDto } from './premium-membership.dto';

@Injectable()
export class PremiumMembershipService {
  constructor(
    @InjectRepository(PremiumMembership)
    private readonly membershipRepository: Repository<PremiumMembership>,
  ) {}

  async createMembership(createDto: CreatePremiumMembershipDto): Promise<PremiumMembership> {
    // Validate consent agreements
    if (!createDto.confirmAccuracy || !createDto.agreeToTerms) {
      throw new ConflictException('All consent agreements must be accepted');
    }

    // Check if member with email already exists
    const existingMember = await this.membershipRepository.findOne({ 
      where: { email: createDto.email } 
    });

    if (existingMember) {
      throw new ConflictException('A premium member with this email already exists');
    }

    const membership = this.membershipRepository.create(createDto);
    return await this.membershipRepository.save(membership);
  }

  async findAllMemberships(
    page: number = 1, 
    limit: number = 10, 
    status?: PremiumMembershipStatus
  ): Promise<{ memberships: PremiumMembership[]; total: number; totalPages: number }> {
    const options: FindManyOptions<PremiumMembership> = {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    if (status) {
      options.where = { membershipStatus: status };
    }

    const [memberships, total] = await this.membershipRepository.findAndCount(options);
    
    return {
      memberships,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findMembershipById(id: string): Promise<PremiumMembership> {
    const membership = await this.membershipRepository.findOne({ where: { id } });
    
    if (!membership) {
      throw new NotFoundException(`Premium membership with ID ${id} not found`);
    }

    return membership;
  }

  async findMembershipsByEmail(email: string): Promise<PremiumMembership[]> {
    return this.membershipRepository.find({ 
      where: { email },
      order: { createdAt: 'DESC' }
    });
  }

  async updateMembership(id: string, updateDto: UpdatePremiumMembershipDto): Promise<PremiumMembership> {
    const membership = await this.findMembershipById(id);
    Object.assign(membership, updateDto);
    return await this.membershipRepository.save(membership);
  }

  async deleteMembership(id: string): Promise<void> {
    const membership = await this.findMembershipById(id);
    await this.membershipRepository.remove(membership);
  }

  async getMembershipStats(): Promise<any> {
    const totalMembers = await this.membershipRepository.count();
    const pendingMembers = await this.membershipRepository.count({ where: { membershipStatus: PremiumMembershipStatus.PENDING } });
    const approvedMembers = await this.membershipRepository.count({ where: { membershipStatus: PremiumMembershipStatus.APPROVED } });
    const activeMembers = await this.membershipRepository.count({ where: { membershipStatus: PremiumMembershipStatus.ACTIVE } });
    const inactiveMembers = await this.membershipRepository.count({ where: { membershipStatus: PremiumMembershipStatus.INACTIVE } });
    const rejectedMembers = await this.membershipRepository.count({ where: { membershipStatus: PremiumMembershipStatus.REJECTED } });

    // Get statistics by career growth area
    const careerAreaStats = await this.membershipRepository
      .createQueryBuilder('membership')
      .select('membership.careerGrowthArea', 'area')
      .addSelect('COUNT(*)', 'count')
      .groupBy('membership.careerGrowthArea')
      .getRawMany();

    const byCareerGrowthArea = careerAreaStats.reduce((acc, stat) => {
      acc[stat.area] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by contribution amount
    const contributionStats = await this.membershipRepository
      .createQueryBuilder('membership')
      .select('membership.monthlyContribution', 'contribution')
      .addSelect('COUNT(*)', 'count')
      .groupBy('membership.monthlyContribution')
      .getRawMany();

    const byContribution = contributionStats.reduce((acc, stat) => {
      acc[stat.contribution] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by payment method
    const paymentStats = await this.membershipRepository
      .createQueryBuilder('membership')
      .select('membership.paymentMethod', 'method')
      .addSelect('COUNT(*)', 'count')
      .groupBy('membership.paymentMethod')
      .getRawMany();

    const byPaymentMethod = paymentStats.reduce((acc, stat) => {
      acc[stat.method] = parseInt(stat.count);
      return acc;
    }, {});

    // Get monthly registrations for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyStats = await this.membershipRepository
      .createQueryBuilder('membership')
      .select('DATE_TRUNC(\'month\', membership.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('membership.createdAt >= :startDate', { startDate: twelveMonthsAgo })
      .groupBy('DATE_TRUNC(\'month\', membership.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthlyRegistrations = monthlyStats.map(stat => ({
      month: new Date(stat.month).toISOString().substring(0, 7),
      count: parseInt(stat.count)
    }));

    return {
      totalMembers,
      pendingMembers,
      approvedMembers,
      activeMembers,
      inactiveMembers,
      rejectedMembers,
      byCareerGrowthArea,
      byContribution,
      byPaymentMethod,
      monthlyRegistrations
    };
  }

  async approveMembership(id: string, adminNotes?: string): Promise<PremiumMembership> {
    return this.updateMembership(id, { 
      membershipStatus: PremiumMembershipStatus.APPROVED,
      adminNotes 
    });
  }

  async rejectMembership(id: string, adminNotes?: string): Promise<PremiumMembership> {
    return this.updateMembership(id, { 
      membershipStatus: PremiumMembershipStatus.REJECTED,
      adminNotes 
    });
  }

  async activateMembership(id: string): Promise<PremiumMembership> {
    return this.updateMembership(id, { membershipStatus: PremiumMembershipStatus.ACTIVE });
  }

  async deactivateMembership(id: string): Promise<PremiumMembership> {
    return this.updateMembership(id, { membershipStatus: PremiumMembershipStatus.INACTIVE });
  }
}