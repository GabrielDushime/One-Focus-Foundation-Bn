
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
import { Subscriber, SubscriberStatus } from './subscribe.entity';
import { CreateSubscriberDto, UpdateSubscriberDto } from './subscribe.dto';

@Injectable()
export class SubscribeService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly subscriberRepository: Repository<Subscriber>,
  ) {}

  async subscribe(
    createSubscriberDto: CreateSubscriberDto,
    ipAddress?: string,
    userAgent?: string,
    source?: string,
  ): Promise<Subscriber> {
    const existingSubscriber = await this.subscriberRepository.findOne({
      where: { email: createSubscriberDto.email },
    });

    if (existingSubscriber && existingSubscriber.status === SubscriberStatus.ACTIVE) {
      throw new ConflictException('This email is already subscribed');
    }

    if (existingSubscriber && existingSubscriber.status === SubscriberStatus.UNSUBSCRIBED) {
      existingSubscriber.status = SubscriberStatus.ACTIVE;
      
      return await this.subscriberRepository.save(existingSubscriber);
    }

    const subscriber = this.subscriberRepository.create({
      ...createSubscriberDto,
      ipAddress,
      userAgent,
      source,
      status: SubscriberStatus.ACTIVE,
    });

    return await this.subscriberRepository.save(subscriber);
  }

  async findAll(): Promise<Subscriber[]> {
    return await this.subscriberRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Subscriber> {
    const subscriber = await this.subscriberRepository.findOne({ where: { id } });
    
    if (!subscriber) {
      throw new NotFoundException(`Subscriber with ID ${id} not found`);
    }

    return subscriber;
  }

  async update(id: string, updateSubscriberDto: UpdateSubscriberDto): Promise<Subscriber> {
    const subscriber = await this.findOne(id);
    Object.assign(subscriber, updateSubscriberDto);
    return await this.subscriberRepository.save(subscriber);
  }

  async remove(id: string): Promise<void> {
    const subscriber = await this.findOne(id);
    await this.subscriberRepository.remove(subscriber);
  }

  async unsubscribe(email: string): Promise<Subscriber> {
    const subscriber = await this.subscriberRepository.findOne({ where: { email } });
    
    if (!subscriber) {
      throw new NotFoundException(`Subscriber with email ${email} not found`);
    }

    subscriber.status = SubscriberStatus.UNSUBSCRIBED;
    subscriber.unsubscribedAt = new Date();
    return await this.subscriberRepository.save(subscriber);
  }

  async getActiveSubscribers(): Promise<Subscriber[]> {
    return await this.subscriberRepository.find({
      where: { status: SubscriberStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async getByStatus(status: SubscriberStatus): Promise<Subscriber[]> {
    return await this.subscriberRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
    bounced: number;
    pending: number;
    todaySubscriptions: number;
    weekSubscriptions: number;
    monthSubscriptions: number;
    growthRate: number;
  }> {
    const total = await this.subscriberRepository.count();
    const active = await this.subscriberRepository.count({
      where: { status: SubscriberStatus.ACTIVE },
    });
    const unsubscribed = await this.subscriberRepository.count({
      where: { status: SubscriberStatus.UNSUBSCRIBED },
    });
    const bounced = await this.subscriberRepository.count({
      where: { status: SubscriberStatus.BOUNCED },
    });
    const pending = await this.subscriberRepository.count({
      where: { status: SubscriberStatus.PENDING },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySubscriptions = await this.subscriberRepository.count({
      where: { createdAt: MoreThanOrEqual(today) },
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    const weekSubscriptions = await this.subscriberRepository.count({
      where: { createdAt: MoreThanOrEqual(weekAgo) },
    });

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    monthAgo.setHours(0, 0, 0, 0);
    const monthSubscriptions = await this.subscriberRepository.count({
      where: { createdAt: MoreThanOrEqual(monthAgo) },
    });

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    twoMonthsAgo.setHours(0, 0, 0, 0);
    const lastMonthSubscriptions = await this.subscriberRepository.count({
      where: { createdAt: Between(twoMonthsAgo, monthAgo) },
    });

    const growthRate = lastMonthSubscriptions > 0
      ? ((monthSubscriptions - lastMonthSubscriptions) / lastMonthSubscriptions) * 100
      : 0;

    return {
      total,
      active,
      unsubscribed,
      bounced,
      pending,
      todaySubscriptions,
      weekSubscriptions,
      monthSubscriptions,
      growthRate: Math.round(growthRate * 100) / 100,
    };
  }

  async getAnalytics(): Promise<{
    dailySubscriptions: { date: string; count: number }[];
    monthlySubscriptions: { month: string; count: number }[];
    topSources: { source: string; count: number }[];
    statusDistribution: { status: string; count: number; percentage: number }[];
    recentSubscribers: Subscriber[];
  }> {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const subscribers = await this.subscriberRepository.find({
      where: { createdAt: MoreThanOrEqual(last30Days) },
      order: { createdAt: 'DESC' },
    });

    const dailyMap = new Map<string, number>();
    subscribers.forEach(sub => {
      const date = sub.createdAt.toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    const dailySubscriptions = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    const last12Months = new Date();
    last12Months.setMonth(last12Months.getMonth() - 12);
    const monthlyData = await this.subscriberRepository.find({
      where: { createdAt: MoreThanOrEqual(last12Months) },
      order: { createdAt: 'DESC' },
    });

    const monthlyMap = new Map<string, number>();
    monthlyData.forEach(sub => {
      const month = sub.createdAt.toISOString().substring(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
    });

    const monthlySubscriptions = Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const allSubscribers = await this.subscriberRepository.find();
    const sourceMap = new Map<string, number>();
    allSubscribers.forEach(sub => {
      if (sub.source) {
        sourceMap.set(sub.source, (sourceMap.get(sub.source) || 0) + 1);
      }
    });

    const topSources = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const total = allSubscribers.length;
    const statusMap = new Map<string, number>();
    allSubscribers.forEach(sub => {
      statusMap.set(sub.status, (statusMap.get(sub.status) || 0) + 1);
    });

    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
    }));

    const recentSubscribers = await this.subscriberRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      dailySubscriptions,
      monthlySubscriptions,
      topSources,
      statusDistribution,
      recentSubscribers,
    };
  }

  async exportSubscribers(): Promise<Subscriber[]> {
    return await this.subscriberRepository.find({
      where: { status: SubscriberStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }
}
