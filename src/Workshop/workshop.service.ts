import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between } from 'typeorm';
import { 
  WorkshopRegistration, 
  RegistrationStatus, 
  WorkshopCategory, 
  ParticipantType,
  WorkshopFormat,
  ExperienceLevel 
} from './workshop.entity';
import { CreateWorkshopRegistrationDto, UpdateWorkshopRegistrationDto } from './workshop.dto';

@Injectable()
export class WorkshopService {
  constructor(
    @InjectRepository(WorkshopRegistration)
    private readonly workshopRepository: Repository<WorkshopRegistration>,
  ) {}

  async createRegistration(createRegistrationDto: CreateWorkshopRegistrationDto): Promise<WorkshopRegistration> {
    
    const existingRegistration = await this.workshopRepository.findOne({
      where: { 
        email: createRegistrationDto.email,
        workshopTitle: createRegistrationDto.workshopTitle
      }
    });

    if (existingRegistration) {
      throw new ConflictException('You have already registered for this workshop');
    }

    if (!createRegistrationDto.consentToParticipate || 
        !createRegistrationDto.agreeToTerms || 
        !createRegistrationDto.agreeToReceiveUpdates) {
      throw new ConflictException('All consent agreements must be accepted');
    }

 
    if (createRegistrationDto.isGroupRegistration) {
      if (!createRegistrationDto.groupSize || !createRegistrationDto.groupName) {
        throw new ConflictException('Group size and name are required for group registrations');
      }
    }

    
    if (createRegistrationDto.hasSpecialRequirements && !createRegistrationDto.specialRequirements) {
      throw new ConflictException('Special requirements details must be provided when indicated');
    }

    const registration = this.workshopRepository.create(createRegistrationDto);
    return await this.workshopRepository.save(registration);
  }

  async findAllRegistrations(
    page: number = 1, 
    limit: number = 10, 
    status?: RegistrationStatus,
    category?: WorkshopCategory,
    format?: WorkshopFormat,
    participantType?: ParticipantType
  ): Promise<{ registrations: WorkshopRegistration[]; total: number; totalPages: number }> {
    const options: FindManyOptions<WorkshopRegistration> = {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const whereClause: any = {};
    if (status) {
      whereClause.registrationStatus = status;
    }
    if (category) {
      whereClause.workshopCategory = category;
    }
    if (format) {
      whereClause.workshopFormat = format;
    }
    if (participantType) {
      whereClause.participantType = participantType;
    }

    if (Object.keys(whereClause).length > 0) {
      options.where = whereClause;
    }

    const [registrations, total] = await this.workshopRepository.findAndCount(options);
    
    return {
      registrations,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findRegistrationById(id: string): Promise<WorkshopRegistration> {
    const registration = await this.workshopRepository.findOne({ where: { id } });
    
    if (!registration) {
      throw new NotFoundException(`Workshop registration with ID ${id} not found`);
    }

    return registration;
  }

  async findRegistrationByEmail(email: string): Promise<WorkshopRegistration[]> {
    const registrations = await this.workshopRepository.find({ 
      where: { email },
      order: { createdAt: 'DESC' }
    });
    
    if (registrations.length === 0) {
      throw new NotFoundException(`No workshop registrations found for email ${email}`);
    }

    return registrations;
  }

  async updateRegistration(id: string, updateRegistrationDto: UpdateWorkshopRegistrationDto): Promise<WorkshopRegistration> {
    const registration = await this.findRegistrationById(id);
    
    // Convert dates if provided
    if (updateRegistrationDto.confirmedDate) {
      updateRegistrationDto.confirmedDate = new Date(updateRegistrationDto.confirmedDate) as any;
    }

    // Set cancelled date if status changed to cancelled
    if (updateRegistrationDto.registrationStatus === RegistrationStatus.CANCELLED && 
        registration.registrationStatus !== RegistrationStatus.CANCELLED) {
      registration.cancelledDate = new Date();
    }

    Object.assign(registration, updateRegistrationDto);
    
    return await this.workshopRepository.save(registration);
  }

  async deleteRegistration(id: string): Promise<void> {
    const registration = await this.findRegistrationById(id);
    await this.workshopRepository.remove(registration);
  }

  async getRegistrationStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    waitlisted: number;
    cancelled: number;
    attended: number;
    noShow: number;
    byCategory: Record<string, number>;
    byFormat: Record<string, number>;
    byParticipantType: Record<string, number>;
    byExperienceLevel: Record<string, number>;
    byLearningGoals: Record<string, number>;
    groupRegistrations: { total: number; totalParticipants: number };
    certificateStats: { requested: number; issued: number };
    paymentStats: { paid: number; unpaid: number; waived: number; totalRevenue: number };
  }> {
    const total = await this.workshopRepository.count();
    const pending = await this.workshopRepository.count({ where: { registrationStatus: RegistrationStatus.PENDING } });
    const confirmed = await this.workshopRepository.count({ where: { registrationStatus: RegistrationStatus.CONFIRMED } });
    const waitlisted = await this.workshopRepository.count({ where: { registrationStatus: RegistrationStatus.WAITLISTED } });
    const cancelled = await this.workshopRepository.count({ where: { registrationStatus: RegistrationStatus.CANCELLED } });
    const attended = await this.workshopRepository.count({ where: { registrationStatus: RegistrationStatus.ATTENDED } });
    const noShow = await this.workshopRepository.count({ where: { registrationStatus: RegistrationStatus.NO_SHOW } });

    // Statistics by category
    const categoryStats = await this.workshopRepository
      .createQueryBuilder('reg')
      .select('reg.workshopCategory', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('reg.workshopCategory')
      .getRawMany();

    const byCategory = categoryStats.reduce((acc, stat) => {
      acc[stat.category] = parseInt(stat.count);
      return acc;
    }, {});

    // Statistics by format
    const formatStats = await this.workshopRepository
      .createQueryBuilder('reg')
      .select('reg.workshopFormat', 'format')
      .addSelect('COUNT(*)', 'count')
      .groupBy('reg.workshopFormat')
      .getRawMany();

    const byFormat = formatStats.reduce((acc, stat) => {
      acc[stat.format] = parseInt(stat.count);
      return acc;
    }, {});

    // Statistics by participant type
    const participantStats = await this.workshopRepository
      .createQueryBuilder('reg')
      .select('reg.participantType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('reg.participantType')
      .getRawMany();

    const byParticipantType = participantStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    // Statistics by experience level
    const experienceStats = await this.workshopRepository
      .createQueryBuilder('reg')
      .select('reg.experienceLevel', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('reg.experienceLevel')
      .getRawMany();

    const byExperienceLevel = experienceStats.reduce((acc, stat) => {
      acc[stat.level] = parseInt(stat.count);
      return acc;
    }, {});

    // Statistics by learning goals
    const allRegistrations = await this.workshopRepository.find({ select: ['learningGoals', 'isGroupRegistration', 'groupSize'] });
    const byLearningGoals = {};
    allRegistrations.forEach(reg => {
      reg.learningGoals.forEach(goal => {
        byLearningGoals[goal] = (byLearningGoals[goal] || 0) + 1;
      });
    });

    // Group registration statistics
    const groupRegs = allRegistrations.filter(reg => reg.isGroupRegistration);
    const totalGroupParticipants = groupRegs.reduce((sum, reg) => sum + (reg.groupSize || 0), 0);
    const groupRegistrations = {
      total: groupRegs.length,
      totalParticipants: totalGroupParticipants
    };

    // Certificate statistics
    const certificateRequested = await this.workshopRepository.count({ where: { certificateRequested: true } });
    const certificateIssued = await this.workshopRepository.count({ where: { certificateIssued: true } });
    const certificateStats = {
      requested: certificateRequested,
      issued: certificateIssued
    };

    // Payment statistics
    const paidCount = await this.workshopRepository.count({ where: { paymentStatus: 'paid' } });
    const unpaidCount = await this.workshopRepository.count({ where: { paymentStatus: 'unpaid' } });
    const waivedCount = await this.workshopRepository.count({ where: { paymentStatus: 'waived' } });
    
    const paidRegistrations = await this.workshopRepository.find({ 
      where: { paymentStatus: 'paid' },
      select: ['workshopFee']
    });
    const totalRevenue = paidRegistrations.reduce((sum, reg) => sum + (reg.workshopFee || 0), 0);

    const paymentStats = {
      paid: paidCount,
      unpaid: unpaidCount,
      waived: waivedCount,
      totalRevenue
    };

    return {
      total,
      pending,
      confirmed,
      waitlisted,
      cancelled,
      attended,
      noShow,
      byCategory,
      byFormat,
      byParticipantType,
      byExperienceLevel,
      byLearningGoals,
      groupRegistrations,
      certificateStats,
      paymentStats
    };
  }

  async getUpcomingWorkshops(limit: number = 5): Promise<WorkshopRegistration[]> {
    return this.workshopRepository
      .createQueryBuilder('reg')
      .where('reg.registrationStatus IN (:...statuses)', { 
        statuses: [RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING] 
      })
      .andWhere('reg.confirmedDate IS NOT NULL')
      .andWhere('reg.confirmedDate > :now', { now: new Date() })
      .orderBy('reg.confirmedDate', 'ASC')
      .take(limit)
      .getMany();
  }

  async getRegistrationsByDateRange(startDate?: string, endDate?: string): Promise<WorkshopRegistration[]> {
    const query = this.workshopRepository
      .createQueryBuilder('reg')
      .where('reg.confirmedDate IS NOT NULL');

    if (startDate && endDate) {
      query.andWhere('reg.confirmedDate BETWEEN :startDate AND :endDate', { 
        startDate, 
        endDate 
      });
    } else if (startDate) {
      query.andWhere('reg.confirmedDate >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('reg.confirmedDate <= :endDate', { endDate });
    }

    return query.orderBy('reg.confirmedDate', 'ASC').getMany();
  }

  async getRegistrationsByWorkshop(workshopTitle: string): Promise<WorkshopRegistration[]> {
    return this.workshopRepository.find({
      where: { workshopTitle },
      order: { createdAt: 'DESC' }
    });
  }

  async getGroupRegistrations(): Promise<WorkshopRegistration[]> {
    return this.workshopRepository.find({
      where: { isGroupRegistration: true },
      order: { createdAt: 'DESC' }
    });
  }

  async getCertificateEligibleParticipants(): Promise<WorkshopRegistration[]> {
    return this.workshopRepository
      .createQueryBuilder('reg')
      .where('reg.certificateRequested = :requested', { requested: true })
      .andWhere('reg.registrationStatus = :status', { status: RegistrationStatus.ATTENDED })
      .andWhere('reg.attendancePercentage >= :minAttendance', { minAttendance: 75 })
      .andWhere('reg.certificateIssued = :issued', { issued: false })
      .orderBy('reg.createdAt', 'DESC')
      .getMany();
  }

  async getRegistrationsByPaymentStatus(paymentStatus: string): Promise<WorkshopRegistration[]> {
    return this.workshopRepository.find({
      where: { paymentStatus },
      order: { createdAt: 'DESC' }
    });
  }

  async cancelRegistration(id: string, reason?: string): Promise<WorkshopRegistration> {
    const registration = await this.findRegistrationById(id);
    
    registration.registrationStatus = RegistrationStatus.CANCELLED;
    registration.cancelledDate = new Date();
    if (reason) {
      registration.cancellationReason = reason;
    }
    
    return await this.workshopRepository.save(registration);
  }

  async confirmRegistration(id: string, confirmedDate: Date, workshopFee?: number): Promise<WorkshopRegistration> {
    const registration = await this.findRegistrationById(id);
    
    registration.registrationStatus = RegistrationStatus.CONFIRMED;
    registration.confirmedDate = confirmedDate;
    if (workshopFee !== undefined) {
      registration.workshopFee = workshopFee;
    }
    
    return await this.workshopRepository.save(registration);
  }

  async issueCertificate(id: string): Promise<WorkshopRegistration> {
    const registration = await this.findRegistrationById(id);
    
    if (!registration.certificateRequested) {
      throw new ConflictException('Participant did not request a certificate');
    }
    
    if (registration.registrationStatus !== RegistrationStatus.ATTENDED) {
      throw new ConflictException('Certificate can only be issued to participants who attended');
    }
    
    if (!registration.attendancePercentage || registration.attendancePercentage < 75) {
      throw new ConflictException('Participant must have at least 75% attendance to receive certificate');
    }
    
    registration.certificateIssued = true;
    
    return await this.workshopRepository.save(registration);
  }
}