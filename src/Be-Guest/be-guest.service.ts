
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { GuestRequest, GuestRequestStatus } from './be-guest.entity';
import { CreateGuestRequestDto, UpdateGuestRequestDto } from './be-guest.dto';

@Injectable()
export class BeGuestService {
  constructor(
    @InjectRepository(GuestRequest)
    private readonly guestRequestRepository: Repository<GuestRequest>,
  ) {}

  async createGuestRequest(createDto: CreateGuestRequestDto): Promise<GuestRequest> {
    const existingRequest = await this.guestRequestRepository.findOne({ 
      where: { email: createDto.email } 
    });

    if (existingRequest) {
      throw new ConflictException('A guest request with this email already exists');
    }

    const guestRequest = this.guestRequestRepository.create(createDto);
    return await this.guestRequestRepository.save(guestRequest);
  }

  async findAllRequests(
    page: number = 1, 
    limit: number = 10, 
    status?: GuestRequestStatus
  ): Promise<{ requests: GuestRequest[]; total: number; totalPages: number }> {
    const options: FindManyOptions<GuestRequest> = {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    if (status) {
      options.where = { requestStatus: status };
    }

    const [requests, total] = await this.guestRequestRepository.findAndCount(options);
    
    return {
      requests,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findRequestById(id: string): Promise<GuestRequest> {
    const request = await this.guestRequestRepository.findOne({ where: { id } });
    
    if (!request) {
      throw new NotFoundException(`Guest request with ID ${id} not found`);
    }

    return request;
  }

  async updateRequest(id: string, updateDto: UpdateGuestRequestDto): Promise<GuestRequest> {
    const request = await this.findRequestById(id);
    Object.assign(request, updateDto);
    return await this.guestRequestRepository.save(request);
  }

  async deleteRequest(id: string): Promise<void> {
    const request = await this.findRequestById(id);
    await this.guestRequestRepository.remove(request);
  }

  async approveRequest(id: string, adminNotes?: string): Promise<GuestRequest> {
    return this.updateRequest(id, { 
      requestStatus: GuestRequestStatus.APPROVED,
      adminNotes 
    });
  }

  async rejectRequest(id: string, adminNotes?: string): Promise<GuestRequest> {
    return this.updateRequest(id, { 
      requestStatus: GuestRequestStatus.REJECTED,
      adminNotes 
    });
  }

  async markAsContacted(id: string, adminNotes?: string): Promise<GuestRequest> {
    return this.updateRequest(id, { 
      requestStatus: GuestRequestStatus.CONTACTED,
      adminNotes 
    });
  }

  async getRequestStats(): Promise<any> {
    const totalRequests = await this.guestRequestRepository.count();
    const pendingRequests = await this.guestRequestRepository.count({ 
      where: { requestStatus: GuestRequestStatus.PENDING } 
    });
    const approvedRequests = await this.guestRequestRepository.count({ 
      where: { requestStatus: GuestRequestStatus.APPROVED } 
    });
    const rejectedRequests = await this.guestRequestRepository.count({ 
      where: { requestStatus: GuestRequestStatus.REJECTED } 
    });
    const contactedRequests = await this.guestRequestRepository.count({ 
      where: { requestStatus: GuestRequestStatus.CONTACTED } 
    });

    const guestTypeStats = await this.guestRequestRepository
      .createQueryBuilder('request')
      .select('request.guestType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('request.guestType')
      .getRawMany();

    const byGuestType = guestTypeStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      contactedRequests,
      byGuestType
    };
  }
}