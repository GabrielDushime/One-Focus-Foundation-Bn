import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { 
  Mentor, 
  MentorStatus, 
  ProfessionalStatus,
  MentorshipArea,
  YearsOfExperience,
  EducationLevel
} from './mentor.entity';
import { CreateMentorDto, UpdateMentorDto } from './mentor.dto';

@Injectable()
export class MentorService {
  constructor(
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
  ) {}

  async createMentor(createMentorDto: CreateMentorDto): Promise<Mentor> {
    // Validate consent agreements
    if (!createMentorDto.agreeToMentorResponsibly || !createMentorDto.consentToGuidelines) {
      throw new ConflictException('All consent agreements must be accepted');
    }

    // Check if mentor with email already exists
    const existingMentor = await this.mentorRepository.findOne({ 
      where: { email: createMentorDto.email } 
    });

    if (existingMentor) {
      throw new ConflictException('A mentor with this email already exists');
    }

    const mentor = this.mentorRepository.create(createMentorDto);
    return await this.mentorRepository.save(mentor);
  }

  async findAllMentors(
    page: number = 1, 
    limit: number = 10, 
    status?: MentorStatus,
    professionalStatus?: ProfessionalStatus,
    mentorshipArea?: MentorshipArea
  ): Promise<{ mentors: Mentor[]; total: number; totalPages: number }> {
    const options: FindManyOptions<Mentor> = {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const whereClause: any = {};
    if (status) {
      whereClause.mentorStatus = status;
    }
    if (professionalStatus) {
      whereClause.professionalStatus = professionalStatus;
    }
    if (mentorshipArea) {
      whereClause.mentorshipArea = mentorshipArea;
    }

    if (Object.keys(whereClause).length > 0) {
      options.where = whereClause;
    }

    const [mentors, total] = await this.mentorRepository.findAndCount(options);
    
    return {
      mentors,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findMentorById(id: string): Promise<Mentor> {
    const mentor = await this.mentorRepository.findOne({ where: { id } });
    
    if (!mentor) {
      throw new NotFoundException(`Mentor with ID ${id} not found`);
    }

    return mentor;
  }

  async findMentorsByEmail(email: string): Promise<Mentor[]> {
    return this.mentorRepository.find({ 
      where: { email },
      order: { createdAt: 'DESC' }
    });
  }

  async updateMentor(id: string, updateMentorDto: UpdateMentorDto): Promise<Mentor> {
    const mentor = await this.findMentorById(id);
    
    Object.assign(mentor, updateMentorDto);
    
    return await this.mentorRepository.save(mentor);
  }

  async deleteMentor(id: string): Promise<void> {
    const mentor = await this.findMentorById(id);
    await this.mentorRepository.remove(mentor);
  }

  async getMentorStats(): Promise<{
    totalMentors: number;
    pendingMentors: number;
    approvedMentors: number;
    activeMentors: number;
    inactiveMentors: number;
    rejectedMentors: number;
    byProfessionalStatus: Record<string, number>;
    byMentorshipArea: Record<string, number>;
    byExperience: Record<string, number>;
    byEducationLevel: Record<string, number>;
    monthlyRegistrations: Array<{ month: string; count: number }>;
  }> {
    const totalMentors = await this.mentorRepository.count();
    const pendingMentors = await this.mentorRepository.count({ where: { mentorStatus: MentorStatus.PENDING } });
    const approvedMentors = await this.mentorRepository.count({ where: { mentorStatus: MentorStatus.APPROVED } });
    const activeMentors = await this.mentorRepository.count({ where: { mentorStatus: MentorStatus.ACTIVE } });
    const inactiveMentors = await this.mentorRepository.count({ where: { mentorStatus: MentorStatus.INACTIVE } });
    const rejectedMentors = await this.mentorRepository.count({ where: { mentorStatus: MentorStatus.REJECTED } });

    // Get statistics by professional status
    const professionalStatusStats = await this.mentorRepository
      .createQueryBuilder('mentor')
      .select('mentor.professionalStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('mentor.professionalStatus')
      .getRawMany();

    const byProfessionalStatus = professionalStatusStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by mentorship area
    const mentorshipAreaStats = await this.mentorRepository
      .createQueryBuilder('mentor')
      .select('mentor.mentorshipArea', 'area')
      .addSelect('COUNT(*)', 'count')
      .groupBy('mentor.mentorshipArea')
      .getRawMany();

    const byMentorshipArea = mentorshipAreaStats.reduce((acc, stat) => {
      acc[stat.area] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by experience
    const experienceStats = await this.mentorRepository
      .createQueryBuilder('mentor')
      .select('mentor.yearsOfExperience', 'experience')
      .addSelect('COUNT(*)', 'count')
      .groupBy('mentor.yearsOfExperience')
      .getRawMany();

    const byExperience = experienceStats.reduce((acc, stat) => {
      acc[stat.experience] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by education level
    const educationStats = await this.mentorRepository
      .createQueryBuilder('mentor')
      .select('mentor.educationLevel', 'education')
      .addSelect('COUNT(*)', 'count')
      .groupBy('mentor.educationLevel')
      .getRawMany();

    const byEducationLevel = educationStats.reduce((acc, stat) => {
      acc[stat.education] = parseInt(stat.count);
      return acc;
    }, {});

    // Get monthly registrations for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyStats = await this.mentorRepository
      .createQueryBuilder('mentor')
      .select('DATE_TRUNC(\'month\', mentor.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('mentor.createdAt >= :startDate', { startDate: twelveMonthsAgo })
      .groupBy('DATE_TRUNC(\'month\', mentor.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthlyRegistrations = monthlyStats.map(stat => ({
      month: new Date(stat.month).toISOString().substring(0, 7), // YYYY-MM format
      count: parseInt(stat.count)
    }));

    return {
      totalMentors,
      pendingMentors,
      approvedMentors,
      activeMentors,
      inactiveMentors,
      rejectedMentors,
      byProfessionalStatus,
      byMentorshipArea,
      byExperience,
      byEducationLevel,
      monthlyRegistrations
    };
  }

  async getMentorsByStatus(status: MentorStatus): Promise<Mentor[]> {
    return this.mentorRepository.find({
      where: { mentorStatus: status },
      order: { createdAt: 'DESC' }
    });
  }

  async getMentorsByArea(area: MentorshipArea): Promise<Mentor[]> {
    return this.mentorRepository.find({
      where: { mentorshipArea: area },
      order: { createdAt: 'DESC' }
    });
  }

  async getMentorsByDateRange(startDate?: string, endDate?: string): Promise<Mentor[]> {
    const query = this.mentorRepository.createQueryBuilder('mentor');

    if (startDate && endDate) {
      query.andWhere('mentor.createdAt BETWEEN :startDate AND :endDate', { 
        startDate: new Date(startDate), 
        endDate: new Date(endDate) 
      });
    } else if (startDate) {
      query.andWhere('mentor.createdAt >= :startDate', { startDate: new Date(startDate) });
    } else if (endDate) {
      query.andWhere('mentor.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    return query.orderBy('mentor.createdAt', 'DESC').getMany();
  }

  async approveMentor(id: string, adminNotes?: string): Promise<Mentor> {
    return this.updateMentor(id, { 
      mentorStatus: MentorStatus.APPROVED,
      adminNotes 
    });
  }

  async rejectMentor(id: string, adminNotes?: string): Promise<Mentor> {
    return this.updateMentor(id, { 
      mentorStatus: MentorStatus.REJECTED,
      adminNotes 
    });
  }

  async activateMentor(id: string): Promise<Mentor> {
    return this.updateMentor(id, { mentorStatus: MentorStatus.ACTIVE });
  }

  async deactivateMentor(id: string): Promise<Mentor> {
    return this.updateMentor(id, { mentorStatus: MentorStatus.INACTIVE });
  }
}