import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between } from 'typeorm';
import { Donation, DonationStatus, DonationType, PaymentMethod, DonationPurpose, Currency } from './donation.entity';
import { CreateDonationDto, UpdateDonationDto } from './donation.dto';

@Injectable()
export class DonationService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
  ) {}

  async createDonation(createDonationDto: CreateDonationDto): Promise<Donation> {
    // Validate consent agreements
    if (!createDonationDto.agreeToContributionUse || !createDonationDto.agreeToReceiveUpdates) {
      throw new ConflictException('All consent agreements must be accepted');
    }

    const donation = this.donationRepository.create(createDonationDto);
    return await this.donationRepository.save(donation);
  }

  async findAllDonations(
    page: number = 1, 
    limit: number = 10, 
    status?: DonationStatus,
    donationType?: DonationType,
    paymentMethod?: PaymentMethod,
    purposeOfDonation?: DonationPurpose
  ): Promise<{ donations: Donation[]; total: number; totalPages: number }> {
    const options: FindManyOptions<Donation> = {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const whereClause: any = {};
    if (status) {
      whereClause.donationStatus = status;
    }
    if (donationType) {
      whereClause.donationType = donationType;
    }
    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod;
    }
    if (purposeOfDonation) {
      whereClause.purposeOfDonation = purposeOfDonation;
    }

    if (Object.keys(whereClause).length > 0) {
      options.where = whereClause;
    }

    const [donations, total] = await this.donationRepository.findAndCount(options);
    
    return {
      donations,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findDonationById(id: string): Promise<Donation> {
    const donation = await this.donationRepository.findOne({ where: { id } });
    
    if (!donation) {
      throw new NotFoundException(`Donation with ID ${id} not found`);
    }

    return donation;
  }

  async findDonationsByEmail(email: string): Promise<Donation[]> {
    return this.donationRepository.find({ 
      where: { email },
      order: { createdAt: 'DESC' }
    });
  }

  async updateDonation(id: string, updateDonationDto: UpdateDonationDto): Promise<Donation> {
    const donation = await this.findDonationById(id);
    
    Object.assign(donation, updateDonationDto);
    
    return await this.donationRepository.save(donation);
  }

  async deleteDonation(id: string): Promise<void> {
    const donation = await this.findDonationById(id);
    await this.donationRepository.remove(donation);
  }

  async getDonationStats(): Promise<{
    totalDonations: number;
    totalAmount: number;
    pendingDonations: number;
    completedDonations: number;
    failedDonations: number;
    byDonationType: Record<string, number>;
    byPaymentMethod: Record<string, number>;
    byPurpose: Record<string, number>;
    byCurrency: Record<string, { count: number; totalAmount: number }>;
    monthlyTrend: Array<{ month: string; count: number; amount: number }>;
  }> {
    const totalDonations = await this.donationRepository.count();
    
    // Calculate total amount
    const totalAmountResult = await this.donationRepository
      .createQueryBuilder('donation')
      .select('SUM(donation.donationAmount)', 'total')
      .where('donation.donationStatus = :status', { status: DonationStatus.COMPLETED })
      .getRawOne();
    const totalAmount = parseFloat(totalAmountResult.total) || 0;

    const pendingDonations = await this.donationRepository.count({ where: { donationStatus: DonationStatus.PENDING } });
    const completedDonations = await this.donationRepository.count({ where: { donationStatus: DonationStatus.COMPLETED } });
    const failedDonations = await this.donationRepository.count({ where: { donationStatus: DonationStatus.FAILED } });

    // Get statistics by donation type
    const donationTypeStats = await this.donationRepository
      .createQueryBuilder('donation')
      .select('donation.donationType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('donation.donationType')
      .getRawMany();

    const byDonationType = donationTypeStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by payment method
    const paymentMethodStats = await this.donationRepository
      .createQueryBuilder('donation')
      .select('donation.paymentMethod', 'method')
      .addSelect('COUNT(*)', 'count')
      .groupBy('donation.paymentMethod')
      .getRawMany();

    const byPaymentMethod = paymentMethodStats.reduce((acc, stat) => {
      acc[stat.method] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by purpose
    const purposeStats = await this.donationRepository
      .createQueryBuilder('donation')
      .select('donation.purposeOfDonation', 'purpose')
      .addSelect('COUNT(*)', 'count')
      .where('donation.purposeOfDonation IS NOT NULL')
      .groupBy('donation.purposeOfDonation')
      .getRawMany();

    const byPurpose = purposeStats.reduce((acc, stat) => {
      acc[stat.purpose] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by currency
    const currencyStats = await this.donationRepository
      .createQueryBuilder('donation')
      .select('donation.currency', 'currency')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(donation.donationAmount)', 'totalAmount')
      .where('donation.donationStatus = :status', { status: DonationStatus.COMPLETED })
      .groupBy('donation.currency')
      .getRawMany();

    const byCurrency = currencyStats.reduce((acc, stat) => {
      acc[stat.currency] = {
        count: parseInt(stat.count),
        totalAmount: parseFloat(stat.totalAmount) || 0
      };
      return acc;
    }, {});

    // Get monthly trend for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyStats = await this.donationRepository
      .createQueryBuilder('donation')
      .select('DATE_TRUNC(\'month\', donation.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(donation.donationAmount)', 'amount')
      .where('donation.createdAt >= :startDate', { startDate: twelveMonthsAgo })
      .andWhere('donation.donationStatus = :status', { status: DonationStatus.COMPLETED })
      .groupBy('DATE_TRUNC(\'month\', donation.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthlyTrend = monthlyStats.map(stat => ({
      month: new Date(stat.month).toISOString().substring(0, 7), // YYYY-MM format
      count: parseInt(stat.count),
      amount: parseFloat(stat.amount) || 0
    }));

    return {
      totalDonations,
      totalAmount,
      pendingDonations,
      completedDonations,
      failedDonations,
      byDonationType,
      byPaymentMethod,
      byPurpose,
      byCurrency,
      monthlyTrend
    };
  }

  async getDonationsByDateRange(startDate?: string, endDate?: string): Promise<Donation[]> {
    const query = this.donationRepository
      .createQueryBuilder('donation')
      .where('donation.donationStatus = :status', { status: DonationStatus.COMPLETED });

    if (startDate && endDate) {
      query.andWhere('donation.createdAt BETWEEN :startDate AND :endDate', { 
        startDate: new Date(startDate), 
        endDate: new Date(endDate) 
      });
    } else if (startDate) {
      query.andWhere('donation.createdAt >= :startDate', { startDate: new Date(startDate) });
    } else if (endDate) {
      query.andWhere('donation.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    return query.orderBy('donation.createdAt', 'DESC').getMany();
  }

  async getRecurringDonations(): Promise<Donation[]> {
    return this.donationRepository.find({
      where: { 
        donationType: DonationType.MONTHLY,
        donationStatus: DonationStatus.COMPLETED
      },
      order: { createdAt: 'DESC' }
    });
  }

  async getDonationsByPurpose(purpose: DonationPurpose): Promise<Donation[]> {
    return this.donationRepository.find({
      where: { 
        purposeOfDonation: purpose,
        donationStatus: DonationStatus.COMPLETED
      },
      order: { createdAt: 'DESC' }
    });
  }
}