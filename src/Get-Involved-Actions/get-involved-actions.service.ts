
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import {
  GetInvolvedAction,
  InterestArea,
  ApplicationStatus,
} from './get-involved-actions.entity';
import {
  CreateGetInvolvedActionDto,
  UpdateGetInvolvedActionDto,
  GetInvolvedActionsStatsDto,
} from './get-involved-actions.dto';

@Injectable()
export class GetInvolvedActionsService {
  constructor(
    @InjectRepository(GetInvolvedAction)
    private readonly applicationRepository: Repository<GetInvolvedAction>,
  ) {}

  /**
   * Create a new application
   */
  async createApplication(
    createDto: CreateGetInvolvedActionDto,
  ): Promise<GetInvolvedAction> {
    // Check for duplicate email within the same interest area
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        email: createDto.email,
        interestArea: createDto.interestArea,
        status: ApplicationStatus.PENDING,
      },
    });

    if (existingApplication) {
      throw new ConflictException(
        'You have already submitted an application for this interest area. Please wait for our response.',
      );
    }

    const application = this.applicationRepository.create(createDto);
    return await this.applicationRepository.save(application);
  }

  /**
   * Find all applications with filtering and pagination
   */
  async findAllApplications(
    page: number = 1,
    limit: number = 10,
    status?: ApplicationStatus,
    interestArea?: InterestArea,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder =
      this.applicationRepository.createQueryBuilder('application');

    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    if (interestArea) {
      queryBuilder.andWhere('application.interestArea = :interestArea', {
        interestArea,
      });
    }

    queryBuilder
      .orderBy('application.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [applications, total] = await queryBuilder.getManyAndCount();

    return {
      applications,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all pending applications
   */
  async findPendingApplications(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] =
      await this.applicationRepository.findAndCount({
        where: { status: ApplicationStatus.PENDING },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    return {
      applications,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find applications by interest area
   */
  async findByInterestArea(
    interestArea: InterestArea,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [applications, total] =
      await this.applicationRepository.findAndCount({
        where: { interestArea },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    return {
      applications,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find application by ID
   */
  async findApplicationById(id: string): Promise<GetInvolvedAction> {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  /**
   * Search applications by name, email, or phone
   */
  async searchApplications(searchTerm: string): Promise<GetInvolvedAction[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new BadRequestException('Search term cannot be empty');
    }

    const term = `%${searchTerm.trim()}%`;

    const applications = await this.applicationRepository
      .createQueryBuilder('application')
      .where('application.name ILIKE :term', { term })
      .orWhere('application.email ILIKE :term', { term })
      .orWhere('application.phoneNumber ILIKE :term', { term })
      .orderBy('application.createdAt', 'DESC')
      .getMany();

    return applications;
  }

  /**
   * Update an application
   */
  async updateApplication(
    id: string,
    updateDto: UpdateGetInvolvedActionDto,
  ): Promise<GetInvolvedAction> {
    const application = await this.findApplicationById(id);

    Object.assign(application, updateDto);
    return await this.applicationRepository.save(application);
  }

  /**
   * Approve an application
   */
  async approveApplication(id: string): Promise<GetInvolvedAction> {
    const application = await this.findApplicationById(id);

    if (application.status === ApplicationStatus.APPROVED) {
      throw new ConflictException('Application is already approved');
    }

    application.status = ApplicationStatus.APPROVED;
    return await this.applicationRepository.save(application);
  }

  /**
   * Reject an application
   */
  async rejectApplication(id: string): Promise<GetInvolvedAction> {
    const application = await this.findApplicationById(id);

    if (application.status === ApplicationStatus.REJECTED) {
      throw new ConflictException('Application is already rejected');
    }

    application.status = ApplicationStatus.REJECTED;
    return await this.applicationRepository.save(application);
  }

  /**
   * Mark application as contacted
   */
  async markAsContacted(id: string): Promise<GetInvolvedAction> {
    const application = await this.findApplicationById(id);

    application.status = ApplicationStatus.CONTACTED;
    application.contactedAt = new Date();

    return await this.applicationRepository.save(application);
  }

  /**
   * Delete an application
   */
  async deleteApplication(id: string): Promise<void> {
    const application = await this.findApplicationById(id);
    await this.applicationRepository.remove(application);
  }

  /**
   * Get application statistics
   */
  async getStats(): Promise<GetInvolvedActionsStatsDto> {
    const totalApplications = await this.applicationRepository.count();

    const pendingApplications = await this.applicationRepository.count({
      where: { status: ApplicationStatus.PENDING },
    });

    const reviewedApplications = await this.applicationRepository.count({
      where: { status: ApplicationStatus.REVIEWED },
    });

    const approvedApplications = await this.applicationRepository.count({
      where: { status: ApplicationStatus.APPROVED },
    });

    const rejectedApplications = await this.applicationRepository.count({
      where: { status: ApplicationStatus.REJECTED },
    });

    // Applications by interest area
    const byInterestArea: Record<string, number> = {};
    for (const area of Object.values(InterestArea)) {
      const count = await this.applicationRepository.count({
        where: { interestArea: area },
      });
      byInterestArea[area] = count;
    }

    // Recent applications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApplications = await this.applicationRepository.count({
      where: {
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    // WhatsApp vs regular phone
    const whatsappCount = await this.applicationRepository.count({
      where: { isWhatsapp: true },
    });

    const regularCount = totalApplications - whatsappCount;

    return {
      totalApplications,
      pendingApplications,
      reviewedApplications,
      approvedApplications,
      rejectedApplications,
      byInterestArea,
      recentApplications,
      communicationPreference: {
        whatsapp: whatsappCount,
        regular: regularCount,
      },
    };
  }
}
