import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSocialMediaSupportRequestDto, UpdateSocialMediaSupportRequestDto } from './media.dto';
import { SocialMediaSupportRequest, SupportRequestStatus, SocialMediaPlatform } from './media.entity';

@Injectable()
export class SocialMediaSupportService {
  constructor(
    @InjectRepository(SocialMediaSupportRequest)
    private readonly requestRepository: Repository<SocialMediaSupportRequest>,
  ) {}

  async createRequest(
    createDto: CreateSocialMediaSupportRequestDto,
  ): Promise<SocialMediaSupportRequest> {
    // Validate consent
    if (!createDto.consentConfirmed) {
      throw new BadRequestException(
        'You must agree to ONEFOCUS terms & conditions',
      );
    }

    // Validate platforms and handles match
    const providedHandles = Object.keys(createDto.socialMediaHandles);
    const hasAtLeastOneMatchingHandle = createDto.platformsRequested.some(
      (platform) => providedHandles.includes(platform),
    );

    if (!hasAtLeastOneMatchingHandle) {
      throw new BadRequestException(
        'Please provide social media handles for at least one requested platform',
      );
    }

    // Check for recent duplicate request
    const existingRequest = await this.requestRepository.findOne({
      where: {
        email: createDto.email.toLowerCase(),
        status: SupportRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        'You already have a pending support request',
      );
    }

    // Create request
    const request = this.requestRepository.create(createDto);
    return await this.requestRepository.save(request);
  }

  async findAllRequests(
    page: number = 1,
    limit: number = 10,
    status?: SupportRequestStatus,
    platform?: SocialMediaPlatform,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.requestRepository.createQueryBuilder('req');

    if (status) {
      queryBuilder.andWhere('req.status = :status', { status });
    }

    if (platform) {
      queryBuilder.andWhere(':platform = ANY(req.platforms_requested)', {
        platform,
      });
    }

    queryBuilder.orderBy('req.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [requests, total] = await queryBuilder.getManyAndCount();

    return {
      requests,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findRequestById(id: string): Promise<SocialMediaSupportRequest> {
    const request = await this.requestRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    return request;
  }

  async findRequestsByEmail(email: string): Promise<SocialMediaSupportRequest[]> {
    return await this.requestRepository.find({
      where: { email: email.toLowerCase() },
      order: { createdAt: 'DESC' },
    });
  }

  async updateRequest(
    id: string,
    updateDto: UpdateSocialMediaSupportRequestDto,
  ): Promise<SocialMediaSupportRequest> {
    const request = await this.findRequestById(id);
    Object.assign(request, updateDto);
    return await this.requestRepository.save(request);
  }

  async deleteRequest(id: string): Promise<void> {
    const request = await this.findRequestById(id);
    await this.requestRepository.remove(request);
  }
}
