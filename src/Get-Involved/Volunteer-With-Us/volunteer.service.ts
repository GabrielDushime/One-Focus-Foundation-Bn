// src/volunteer/volunteer.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Volunteer, ApplicationStatus } from './entities/volunteer.entity';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerStatusDto } from './dto/update-volunteer-status.dto';
import { VolunteerQueryDto } from './dto/volunteer-query.dto';

@Injectable()
export class VolunteerService {
  constructor(
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
  ) {}

  async create(createVolunteerDto: CreateVolunteerDto): Promise<Volunteer> {
    // Check if volunteer with this email already exists
    const existingVolunteer = await this.volunteerRepository.findOne({
      where: { emailAddress: createVolunteerDto.emailAddress },
    });

    if (existingVolunteer) {
      throw new ConflictException(
        'A volunteer application with this email already exists',
      );
    }

    // Validate agreements
    if (!createVolunteerDto.missionAgreement || !createVolunteerDto.onboardingAgreement) {
      throw new BadRequestException(
        'Both mission and onboarding agreements must be accepted',
      );
    }

    // Convert dateOfBirth string to Date object
    const dateOfBirth = new Date(createVolunteerDto.dateOfBirth);
    
    // Validate age (must be at least 16 years old)
    const minAge = 16;
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (age < minAge || (age === minAge && monthDiff < 0)) {
      throw new BadRequestException('Volunteers must be at least 16 years old');
    }

    const volunteer = this.volunteerRepository.create({
      ...createVolunteerDto,
      dateOfBirth,
      status: ApplicationStatus.PENDING,
    });

    return await this.volunteerRepository.save(volunteer);
  }

  async findAll(query: VolunteerQueryDto): Promise<{
    volunteers: Volunteer[];
    total: number;
  }> {
    const queryBuilder = this.volunteerRepository.createQueryBuilder('volunteer');

    // Filter by status
    if (query.status) {
      queryBuilder.andWhere('volunteer.status = :status', {
        status: query.status,
      });
    }

    // Filter by role
    if (query.role) {
      queryBuilder.andWhere(':role = ANY(volunteer.volunteer_roles)', {
        role: query.role,
      });
    }

    // Search by name or email
    if (query.search) {
      queryBuilder.andWhere(
        '(volunteer.full_name ILIKE :search OR volunteer.email_address ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Order by creation date (newest first)
    queryBuilder.orderBy('volunteer.created_at', 'DESC');

    const [volunteers, total] = await queryBuilder.getManyAndCount();

    return { volunteers, total };
  }

  async findOne(id: string): Promise<Volunteer> {
    const volunteer = await this.volunteerRepository.findOne({
      where: { id },
    });

    if (!volunteer) {
      throw new NotFoundException(`Volunteer with ID ${id} not found`);
    }

    return volunteer;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateVolunteerStatusDto,
  ): Promise<Volunteer> {
    const volunteer = await this.findOne(id);

    if (updateStatusDto.status) {
      volunteer.status = updateStatusDto.status;
    }

    if (updateStatusDto.adminNotes !== undefined) {
      volunteer.adminNotes = updateStatusDto.adminNotes;
    }

    return await this.volunteerRepository.save(volunteer);
  }

  async remove(id: string): Promise<void> {
    const volunteer = await this.findOne(id);
    await this.volunteerRepository.remove(volunteer);
  }

  async getStatistics(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    onboarding: number;
    active: number;
    roleDistribution: Record<string, number>;
  }> {
    const total = await this.volunteerRepository.count();

    const statusCounts = await this.volunteerRepository
      .createQueryBuilder('volunteer')
      .select('volunteer.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('volunteer.status')
      .getRawMany();

    const stats = {
      total,
      pending: 0,
      approved: 0,
      rejected: 0,
      onboarding: 0,
      active: 0,
      roleDistribution: {},
    };

    statusCounts.forEach((item) => {
      stats[item.status] = parseInt(item.count);
    });

    // Get role distribution
    const volunteers = await this.volunteerRepository.find({
      select: ['volunteerRoles'],
    });

    volunteers.forEach((volunteer) => {
      volunteer.volunteerRoles.forEach((role) => {
        stats.roleDistribution[role] = (stats.roleDistribution[role] || 0) + 1;
      });
    });

    return stats;
  }

  async findByEmail(email: string): Promise<Volunteer | null> {
    return await this.volunteerRepository.findOne({
      where: { emailAddress: email },
    });
  }

  async findByStatus(status: ApplicationStatus): Promise<Volunteer[]> {
    return await this.volunteerRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }
}