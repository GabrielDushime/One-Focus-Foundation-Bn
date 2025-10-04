// src/Membership/Basic/basic-membership.service.ts

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { BasicMembership, MembershipStatus } from './basic-membership.entity';
import { CreateBasicMembershipDto, UpdateBasicMembershipDto } from './basic-membership.dto';

@Injectable()
export class BasicMembershipService {
  constructor(
    @InjectRepository(BasicMembership)
    private readonly membershipRepository: Repository<BasicMembership>,
  ) {}

  async createMembership(createDto: CreateBasicMembershipDto): Promise<BasicMembership> {
    // Validate consent agreements
    if (!createDto.confirmAccuracy || !createDto.agreeToTerms) {
      throw new ConflictException('All consent agreements must be accepted');
    }

    // Check if member with email already exists
    const existingMember = await this.membershipRepository.findOne({ 
      where: { email: createDto.email } 
    });

    if (existingMember) {
      throw new ConflictException('A member with this email already exists');
    }

    const membership = this.membershipRepository.create(createDto);
    return await this.membershipRepository.save(membership);
  }

  async findAllMemberships(
    page: number = 1, 
    limit: number = 10, 
    status?: MembershipStatus
  ): Promise<{ memberships: BasicMembership[]; total: number; totalPages: number }> {
    const options: FindManyOptions<BasicMembership> = {
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

  async findMembershipById(id: string): Promise<BasicMembership> {
    const membership = await this.membershipRepository.findOne({ where: { id } });
    
    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }

    return membership;
  }

  async findMembershipsByEmail(email: string): Promise<BasicMembership[]> {
    return this.membershipRepository.find({ 
      where: { email },
      order: { createdAt: 'DESC' }
    });
  }

  async updateMembership(id: string, updateDto: UpdateBasicMembershipDto): Promise<BasicMembership> {
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
    const pendingMembers = await this.membershipRepository.count({ where: { membershipStatus: MembershipStatus.PENDING } });
    const approvedMembers = await this.membershipRepository.count({ where: { membershipStatus: MembershipStatus.APPROVED } });
    const activeMembers = await this.membershipRepository.count({ where: { membershipStatus: MembershipStatus.ACTIVE } });
    const inactiveMembers = await this.membershipRepository.count({ where: { membershipStatus: MembershipStatus.INACTIVE } });
    const rejectedMembers = await this.membershipRepository.count({ where: { membershipStatus: MembershipStatus.REJECTED } });

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
      monthlyRegistrations
    };
  }

  async approveMembership(id: string, adminNotes?: string): Promise<BasicMembership> {
    return this.updateMembership(id, { 
      membershipStatus: MembershipStatus.APPROVED,
      adminNotes 
    });
  }

  async rejectMembership(id: string, adminNotes?: string): Promise<BasicMembership> {
    return this.updateMembership(id, { 
      membershipStatus: MembershipStatus.REJECTED,
      adminNotes 
    });
  }

  async activateMembership(id: string): Promise<BasicMembership> {
    return this.updateMembership(id, { membershipStatus: MembershipStatus.ACTIVE });
  }

  async deactivateMembership(id: string): Promise<BasicMembership> {
    return this.updateMembership(id, { membershipStatus: MembershipStatus.INACTIVE });
  }
}