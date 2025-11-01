
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseUUIDPipe,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscribeService } from './subscribe.service'
import {
  CreateSubscriberDto,
  UpdateSubscriberDto,
  SubscriberResponseDto,
  SubscriberStatsDto,
  SubscriberAnalyticsDto,
} from './subscribe.dto';
import { SubscriberStatus } from './subscribe.entity';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Subscribe')
@Controller('subscribe')
export class SubscribeController {
  constructor(private readonly subscribeService: SubscribeService) {}

  @Post()
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully subscribed',
    type: SubscriberResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already subscribed',
  })
  async subscribe(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @Req() request: Request,
  ) {
    const ipAddress = request.ip || (request.headers['x-forwarded-for'] as string);
    const userAgent = request.headers['user-agent'];
    const source = request.headers['referer'] || 'direct';

    const subscriber = await this.subscribeService.subscribe(
      createSubscriberDto,
      ipAddress,
      userAgent,
      source,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for subscribing! You will receive our latest updates.',
      data: subscriber,
    };
  }

  @Post('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully unsubscribed',
    type: SubscriberResponseDto,
  })
  async unsubscribe(@Body('email') email: string) {
    const subscriber = await this.subscribeService.unsubscribe(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'You have been unsubscribed successfully',
      data: subscriber,
    };
  }

  @Get()
   @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all subscribers (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscribers retrieved successfully',
    type: [SubscriberResponseDto],
  })
  async findAll() {
    const subscribers = await this.subscribeService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscribers retrieved successfully',
      data: subscribers,
    };
  }

  @Get('stats')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get subscriber statistics (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: SubscriberStatsDto,
  })
  async getStats() {
    const stats = await this.subscribeService.getStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('analytics')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get subscriber analytics (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics retrieved successfully',
    type: SubscriberAnalyticsDto,
  })
  async getAnalytics() {
    const analytics = await this.subscribeService.getAnalytics();
    return {
      statusCode: HttpStatus.OK,
      message: 'Analytics retrieved successfully',
      data: analytics,
    };
  }

  @Get('active')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all active subscribers (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active subscribers retrieved successfully',
    type: [SubscriberResponseDto],
  })
  async getActiveSubscribers() {
    const subscribers = await this.subscribeService.getActiveSubscribers();
    return {
      statusCode: HttpStatus.OK,
      message: 'Active subscribers retrieved successfully',
      data: subscribers,
    };
  }

  @Get('status/:status')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get subscribers by status (Admin)' })
  @ApiParam({ name: 'status', enum: SubscriberStatus })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscribers retrieved successfully',
    type: [SubscriberResponseDto],
  })
  async getByStatus(@Param('status') status: SubscriberStatus) {
    const subscribers = await this.subscribeService.getByStatus(status);
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscribers retrieved successfully',
      data: subscribers,
    };
  }

  @Get('export')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Export active subscribers (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscribers exported successfully',
    type: [SubscriberResponseDto],
  })
  async exportSubscribers() {
    const subscribers = await this.subscribeService.exportSubscribers();
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscribers exported successfully',
      data: subscribers,
    };
  }

  @Get(':id')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific subscriber by ID (Admin)' })
  @ApiParam({ name: 'id', description: 'Subscriber UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscriber retrieved successfully',
    type: SubscriberResponseDto,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const subscriber = await this.subscribeService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscriber retrieved successfully',
      data: subscriber,
    };
  }

  @Patch(':id')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a subscriber (Admin)' })
  @ApiParam({ name: 'id', description: 'Subscriber UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscriber updated successfully',
    type: SubscriberResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubscriberDto: UpdateSubscriberDto,
  ) {
    const subscriber = await this.subscribeService.update(id, updateSubscriberDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscriber updated successfully',
      data: subscriber,
    };
  }

  @Delete(':id')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a subscriber (Admin)' })
  @ApiParam({ name: 'id', description: 'Subscriber UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscriber deleted successfully',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.subscribeService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Subscriber deleted successfully',
    };
  }
}
