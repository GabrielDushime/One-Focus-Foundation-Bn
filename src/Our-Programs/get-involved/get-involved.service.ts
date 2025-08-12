import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetInvolved } from './get-involved.entity';
import { CreateGetInvolvedDto } from './create-get-involved.dto';

@Injectable()
export class GetInvolvedService {
  constructor(
    @InjectRepository(GetInvolved)
    private readonly getInvolvedRepository: Repository<GetInvolved>,
  ) {}

  async create(createGetInvolvedDto: CreateGetInvolvedDto): Promise<GetInvolved> {
    // Check if email already exists
    const existingApplication = await this.getInvolvedRepository.findOne({
      where: { email: createGetInvolvedDto.email }
    });

    if (existingApplication) {
      throw new ConflictException('An application with this email already exists');
    }

   
    const { oneOnOneVirtual, groupSessions, inPersonRwanda } = createGetInvolvedDto;
    if (!oneOnOneVirtual && !groupSessions && !inPersonRwanda) {
      throw new ConflictException('Please select at least one mentorship format');
    }

    // Validate that at least one availability option is selected
    const { weekdayEvenings, weekends, flexible } = createGetInvolvedDto;
    if (!weekdayEvenings && !weekends && !flexible) {
      throw new ConflictException('Please select at least one availability option');
    }

    // Validate consent agreements
    if (!createGetInvolvedDto.agreesToParticipate || !createGetInvolvedDto.consentToGuidelines) {
      throw new ConflictException('Both consent agreements must be accepted');
    }

    const getInvolved = this.getInvolvedRepository.create(createGetInvolvedDto);
    return await this.getInvolvedRepository.save(getInvolved);
  }

  async findAll(): Promise<GetInvolved[]> {
    return await this.getInvolvedRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<GetInvolved> {
    const application = await this.getInvolvedRepository.findOne({
      where: { id }
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async findByEmail(email: string): Promise<GetInvolved> {
    const application = await this.getInvolvedRepository.findOne({
      where: { email }
    });

    if (!application) {
      throw new NotFoundException(`Application with email ${email} not found`);
    }

    return application;
  }

  async updateStatus(id: string, status: string): Promise<GetInvolved> {
    const application = await this.findOne(id);
    application.status = status;
    return await this.getInvolvedRepository.save(application);
  }

  async remove(id: string): Promise<void> {
    const application = await this.findOne(id);
    await this.getInvolvedRepository.remove(application);
  }

  async getStats() {
    const total = await this.getInvolvedRepository.count();
    const pending = await this.getInvolvedRepository.count({
      where: { status: 'pending' }
    });
    const approved = await this.getInvolvedRepository.count({
      where: { status: 'approved' }
    });
    const rejected = await this.getInvolvedRepository.count({
      where: { status: 'rejected' }
    });

    return {
      total,
      pending,
      approved,
      rejected
    };
  }
}
