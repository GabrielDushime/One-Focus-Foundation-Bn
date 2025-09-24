import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { JoinUsApplication } from './join-us.entity';
import { CreateJoinUsApplicationDto, UpdateJoinUsApplicationDto } from './join-us.dto';

@Injectable()
export class JoinUsService {
  constructor(
    @InjectRepository(JoinUsApplication)
    private readonly joinUsRepository: Repository<JoinUsApplication>,
  ) {}

  async createApplication(createJoinUsApplicationDto: CreateJoinUsApplicationDto): Promise<JoinUsApplication> {
   
    const existingApplication = await this.joinUsRepository.findOne({
      where: { email: createJoinUsApplicationDto.email }
    });

    if (existingApplication) {
      throw new ConflictException('An application with this email already exists');
    }

    const application = this.joinUsRepository.create(createJoinUsApplicationDto);
    return await this.joinUsRepository.save(application);
  }

  async findAllApplications(
    page: number = 1, 
    limit: number = 10, 
    status?: string
  ): Promise<{ applications: JoinUsApplication[]; total: number; totalPages: number }> {
    const options: FindManyOptions<JoinUsApplication> = {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    if (status) {
      options.where = { applicationStatus: status };
    }

    const [applications, total] = await this.joinUsRepository.findAndCount(options);
    
    return {
      applications,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findApplicationById(id: string): Promise<JoinUsApplication> {
    const application = await this.joinUsRepository.findOne({ where: { id } });
    
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async findApplicationByEmail(email: string): Promise<JoinUsApplication> {
    const application = await this.joinUsRepository.findOne({ where: { email } });
    
    if (!application) {
      throw new NotFoundException(`Application with email ${email} not found`);
    }

    return application;
  }

  async updateApplication(id: string, updateJoinUsApplicationDto: UpdateJoinUsApplicationDto): Promise<JoinUsApplication> {
    const application = await this.findApplicationById(id);
    
    Object.assign(application, updateJoinUsApplicationDto);
    
    return await this.joinUsRepository.save(application);
  }

  async deleteApplication(id: string): Promise<void> {
    const application = await this.findApplicationById(id);
    await this.joinUsRepository.remove(application);
  }

  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byEducationLevel: Record<string, number>;
    byCountry: Record<string, number>;
    bySessionType: Record<string, number>;
  }> {
    const total = await this.joinUsRepository.count();
    const pending = await this.joinUsRepository.count({ where: { applicationStatus: 'pending' } });
    const approved = await this.joinUsRepository.count({ where: { applicationStatus: 'approved' } });
    const rejected = await this.joinUsRepository.count({ where: { applicationStatus: 'rejected' } });

    // Get statistics by education level
    const educationStats = await this.joinUsRepository
      .createQueryBuilder('app')
      .select('app.educationLevel', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.educationLevel')
      .getRawMany();

    const byEducationLevel = educationStats.reduce((acc, stat) => {
      acc[stat.level] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by country
    const countryStats = await this.joinUsRepository
      .createQueryBuilder('app')
      .select('app.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.country')
      .getRawMany();

    const byCountry = countryStats.reduce((acc, stat) => {
      acc[stat.country] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by session type
    const sessionStats = await this.joinUsRepository
      .createQueryBuilder('app')
      .select('app.sessionAvailability', 'session')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.sessionAvailability')
      .getRawMany();

    const bySessionType = sessionStats.reduce((acc, stat) => {
      acc[stat.session] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      total,
      pending,
      approved,
      rejected,
      byEducationLevel,
      byCountry,
      bySessionType
    };
  }
}