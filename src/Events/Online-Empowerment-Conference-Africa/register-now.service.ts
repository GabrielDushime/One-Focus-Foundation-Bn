import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { ConferenceRegistration, RegistrationStatus, AgeGroup, EngagementDetails, ConferenceType } from './register-now.entity';
import { CreateConferenceRegistrationDto, UpdateConferenceRegistrationDto } from './register-now.dto';

@Injectable()
export class RegisterNowService {
  constructor(
    @InjectRepository(ConferenceRegistration)
    private readonly registrationRepository: Repository<ConferenceRegistration>,
  ) {}

  async createRegistration(createRegistrationDto: CreateConferenceRegistrationDto): Promise<ConferenceRegistration> {
    // Check if user already registered with this email
    const existingRegistration = await this.registrationRepository.findOne({
      where: { email: createRegistrationDto.email }
    });

    if (existingRegistration) {
      throw new ConflictException('A registration with this email already exists');
    }

    // Validate consent agreements
    if (!createRegistrationDto.consentToParticipate || !createRegistrationDto.agreeToReceiveUpdates || !createRegistrationDto.agreeToGuidelines) {
      throw new ConflictException('All consent agreements must be accepted');
    }
    
    // Set default conference type if not provided
    if (!createRegistrationDto.conferenceType) {
      createRegistrationDto.conferenceType = ConferenceType.VIRTUAL;
    }

    const registration = this.registrationRepository.create(createRegistrationDto);
    return await this.registrationRepository.save(registration);
  }

  async findAllRegistrations(
    page: number = 1, 
    limit: number = 10, 
    status?: RegistrationStatus,
    ageGroup?: AgeGroup,
    engagementDetails?: EngagementDetails
  ): Promise<{ registrations: ConferenceRegistration[]; total: number; totalPages: number }> {
    const options: FindManyOptions<ConferenceRegistration> = {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const whereClause: any = {};
    if (status) {
      whereClause.registrationStatus = status;
    }
    if (ageGroup) {
      whereClause.ageGroup = ageGroup;
    }
    if (engagementDetails) {
      whereClause.engagementDetails = engagementDetails;
    }

    if (Object.keys(whereClause).length > 0) {
      options.where = whereClause;
    }

    const [registrations, total] = await this.registrationRepository.findAndCount(options);
    
    return {
      registrations,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findRegistrationById(id: string): Promise<ConferenceRegistration> {
    const registration = await this.registrationRepository.findOne({ where: { id } });
    
    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    return registration;
  }

  async findRegistrationByEmail(email: string): Promise<ConferenceRegistration> {
    const registration = await this.registrationRepository.findOne({ where: { email } });
    
    if (!registration) {
      throw new NotFoundException(`Registration with email ${email} not found`);
    }

    return registration;
  }

  async updateRegistration(id: string, updateRegistrationDto: UpdateConferenceRegistrationDto): Promise<ConferenceRegistration> {
    const registration = await this.findRegistrationById(id);
    
    // Convert conference date string to Date object if provided
    if (updateRegistrationDto.conferenceDate) {
      updateRegistrationDto.conferenceDate = new Date(updateRegistrationDto.conferenceDate) as any;
    }

    Object.assign(registration, updateRegistrationDto);
    
    return await this.registrationRepository.save(registration);
  }

  async deleteRegistration(id: string): Promise<void> {
    const registration = await this.findRegistrationById(id);
    await this.registrationRepository.remove(registration);
  }

  async getRegistrationStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    attended: number;
    byAgeGroup: Record<string, number>;
    byEngagementDetails: Record<string, number>;
    byAreasOfInterest: Record<string, number>;
    byConferenceType: Record<string, number>;
    talentShowcase: { interested: number; notInterested: number };
  }> {
    const total = await this.registrationRepository.count();
    const pending = await this.registrationRepository.count({ where: { registrationStatus: RegistrationStatus.PENDING } });
    const confirmed = await this.registrationRepository.count({ where: { registrationStatus: RegistrationStatus.CONFIRMED } });
    const cancelled = await this.registrationRepository.count({ where: { registrationStatus: RegistrationStatus.CANCELLED } });
    const attended = await this.registrationRepository.count({ where: { registrationStatus: RegistrationStatus.ATTENDED } });

    // Get statistics by age group
    const ageGroupStats = await this.registrationRepository
      .createQueryBuilder('reg')
      .select('reg.ageGroup', 'ageGroup')
      .addSelect('COUNT(*)', 'count')
      .groupBy('reg.ageGroup')
      .getRawMany();

    const byAgeGroup = ageGroupStats.reduce((acc, stat) => {
      acc[stat.ageGroup] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by engagement details
    const engagementStats = await this.registrationRepository
      .createQueryBuilder('reg')
      .select('reg.engagementDetails', 'engagement')
      .addSelect('COUNT(*)', 'count')
      .groupBy('reg.engagementDetails')
      .getRawMany();

    const byEngagementDetails = engagementStats.reduce((acc, stat) => {
      acc[stat.engagement] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by conference type
    const conferenceTypeStats = await this.registrationRepository
      .createQueryBuilder('reg')
      .select('reg.conferenceType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('reg.conferenceType')
      .getRawMany();

    const byConferenceType = conferenceTypeStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    // Get areas of interest statistics (since it's JSON array, we need to aggregate differently)
    const allRegistrations = await this.registrationRepository.find({ select: ['areasOfInterest'] });
    const byAreasOfInterest = {};
    allRegistrations.forEach(reg => {
      reg.areasOfInterest.forEach(area => {
        byAreasOfInterest[area] = (byAreasOfInterest[area] || 0) + 1;
      });
    });

    // Get talent showcase statistics
    const interested = await this.registrationRepository.count({ where: { wantsToShowcaseTalent: true } });
    const notInterested = await this.registrationRepository.count({ where: { wantsToShowcaseTalent: false } });

    return {
      total,
      pending,
      confirmed,
      cancelled,
      attended,
      byAgeGroup,
      byEngagementDetails,
      byAreasOfInterest,
      byConferenceType,
      talentShowcase: { interested, notInterested }
    };
  }

  async getUpcomingConferences(limit: number = 5): Promise<ConferenceRegistration[]> {
    return this.registrationRepository
      .createQueryBuilder('reg')
      .where('reg.registrationStatus IN (:...statuses)', { statuses: [RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING] })
      .andWhere('reg.conferenceDate IS NOT NULL')
      .andWhere('reg.conferenceDate > :now', { now: new Date() })
      .orderBy('reg.conferenceDate', 'ASC')
      .take(limit)
      .getMany();
  }

  async getRegistrationsByConferenceDate(startDate?: string, endDate?: string): Promise<ConferenceRegistration[]> {
    const query = this.registrationRepository
      .createQueryBuilder('reg')
      .where('reg.registrationStatus = :status', { status: RegistrationStatus.CONFIRMED })
      .andWhere('reg.conferenceDate IS NOT NULL');

    if (startDate) {
      query.andWhere('reg.conferenceDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('reg.conferenceDate <= :endDate', { endDate });
    }

    return query.orderBy('reg.conferenceDate', 'ASC').getMany();
  }

  async getTalentShowcaseParticipants(): Promise<ConferenceRegistration[]> {
    return this.registrationRepository.find({
      where: { 
        wantsToShowcaseTalent: true,
        registrationStatus: RegistrationStatus.CONFIRMED
      },
      order: { createdAt: 'DESC' }
    });
  }
}