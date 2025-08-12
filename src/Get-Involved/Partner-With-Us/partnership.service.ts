import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Partnership, PartnershipStatus } from './partnership.entity';
import { CreatePartnershipDto } from './create-partnership.dto';
import { UpdatePartnershipStatusDto } from './update-partnership-status.dto';

@Injectable()
export class PartnershipService {
  constructor(
    @InjectRepository(Partnership)
    private readonly partnershipRepository: Repository<Partnership>,
  ) {}

  async create(createPartnershipDto: CreatePartnershipDto): Promise<Partnership> {
    const partnership = this.partnershipRepository.create(createPartnershipDto);
    return await this.partnershipRepository.save(partnership);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: PartnershipStatus,
  ): Promise<{
    data: Partnership[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const options: FindManyOptions<Partnership> = {
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    if (status) {
      options.where = { status };
    }

    const [data, total] = await this.partnershipRepository.findAndCount(options);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Partnership> {
    const partnership = await this.partnershipRepository.findOne({
      where: { id },
    });

    if (!partnership) {
      throw new NotFoundException(`Partnership with ID ${id} not found`);
    }

    return partnership;
  }

  async updateStatus(
    id: string,
    updatePartnershipStatusDto: UpdatePartnershipStatusDto,
  ): Promise<Partnership> {
    const partnership = await this.findOne(id);
    
    Object.assign(partnership, updatePartnershipStatusDto);
    
    return await this.partnershipRepository.save(partnership);
  }

  async delete(id: string): Promise<void> {
    const partnership = await this.findOne(id);
    await this.partnershipRepository.remove(partnership);
  }

  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<PartnershipStatus, number>;
    recentApplications: number;
  }> {
    const total = await this.partnershipRepository.count();
    
    const byStatus = {} as Record<PartnershipStatus, number>;
    for (const status of Object.values(PartnershipStatus)) {
      byStatus[status] = await this.partnershipRepository.count({
        where: { status },
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentApplications = await this.partnershipRepository.count({
      where: {
        createdAt: {
          $gte: thirtyDaysAgo,
        } as any,
      },
    });

    return {
      total,
      byStatus,
      recentApplications,
    };
  }
}