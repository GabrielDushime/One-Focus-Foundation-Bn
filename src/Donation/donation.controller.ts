import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DonationService } from './donation.service';
import {
  CreateDonationDto,
  UpdateDonationDto,
  DonationResponseDto,
  DonationStatsResponseDto,
} from './donation.dto';
import { DonationStatus, DonationType, PaymentMethod, DonationPurpose } from './donation.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Donations')
@Controller('donations')
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  @Post()
  @ApiOperation({ summary: 'Make a donation to ONEFOCUS Foundation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Donation submitted successfully',
    type: DonationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createDonation(@Body() createDonationDto: CreateDonationDto) {
    const donation = await this.donationService.createDonation(createDonationDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for your generous support! Your contribution will directly empower young Africans through mentorship, workshops, and innovation. You\'ll receive a confirmation email shortly.',
      data: donation,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all donations (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: DonationStatus, description: 'Filter by donation status' })
  @ApiQuery({ name: 'donationType', required: false, enum: DonationType, description: 'Filter by donation type' })
  @ApiQuery({ name: 'paymentMethod', required: false, enum: PaymentMethod, description: 'Filter by payment method' })
  @ApiQuery({ name: 'purposeOfDonation', required: false, enum: DonationPurpose, description: 'Filter by donation purpose' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Donations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Donations retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            donations: { type: 'array', items: { $ref: '#/components/schemas/DonationResponseDto' } },
            total: { type: 'number', example: 150 },
            totalPages: { type: 'number', example: 15 },
            currentPage: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  async findAllDonations(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: DonationStatus,
    @Query('donationType') donationType?: DonationType,
    @Query('paymentMethod') paymentMethod?: PaymentMethod,
    @Query('purposeOfDonation') purposeOfDonation?: DonationPurpose,
  ) {
    const result = await this.donationService.findAllDonations(page, limit, status, donationType, paymentMethod, purposeOfDonation);
    return {
      statusCode: HttpStatus.OK,
      message: 'Donations retrieved successfully',
      data: {
        ...result,
        currentPage: page,
        limit,
      },
    };
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get donation statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: DonationStatsResponseDto,
  })
  async getDonationStats() {
    const stats = await this.donationService.getDonationStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Donation statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('by-date')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get donations by date range (Admin only)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter (YYYY-MM-DD)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Donations by date retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Donations by date retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/DonationResponseDto' } }
      }
    }
  })
  async getDonationsByDate(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const donations = await this.donationService.getDonationsByDateRange(startDate, endDate);
    return {
      statusCode: HttpStatus.OK,
      message: 'Donations by date retrieved successfully',
      data: donations,
    };
  }

  @Get('recurring')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get recurring donations (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recurring donations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Recurring donations retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/DonationResponseDto' } }
      }
    }
  })
  async getRecurringDonations() {
    const donations = await this.donationService.getRecurringDonations();
    return {
      statusCode: HttpStatus.OK,
      message: 'Recurring donations retrieved successfully',
      data: donations,
    };
  }

  @Get('purpose/:purpose')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get donations by purpose (Admin only)' })
  @ApiParam({ name: 'purpose', enum: DonationPurpose, description: 'Donation purpose' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Donations by purpose retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Donations by purpose retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/DonationResponseDto' } }
      }
    }
  })
  async getDonationsByPurpose(@Param('purpose') purpose: DonationPurpose) {
    const donations = await this.donationService.getDonationsByPurpose(purpose);
    return {
      statusCode: HttpStatus.OK,
      message: 'Donations by purpose retrieved successfully',
      data: donations,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific donation by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Donation UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Donation retrieved successfully',
    type: DonationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Donation not found',
  })
  async findDonationById(@Param('id', ParseUUIDPipe) id: string) {
    const donation = await this.donationService.findDonationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Donation retrieved successfully',
      data: donation,
    };
  }

  @Get('email/:email')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get donations by email (Admin only)' })
  @ApiParam({ name: 'email', description: 'Email address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Donations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Donations retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/DonationResponseDto' } }
      }
    }
  })
  async findDonationsByEmail(@Param('email') email: string) {
    const donations = await this.donationService.findDonationsByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'Donations retrieved successfully',
      data: donations,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update donation status and details (Admin only)' })
  @ApiParam({ name: 'id', description: 'Donation UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Donation updated successfully',
    type: DonationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Donation not found',
  })
  async updateDonation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDonationDto: UpdateDonationDto,
  ) {
    const donation = await this.donationService.updateDonation(id, updateDonationDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Donation updated successfully',
      data: donation,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a donation (Admin only)' })
  @ApiParam({ name: 'id', description: 'Donation UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Donation deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Donation not found',
  })
  async deleteDonation(@Param('id', ParseUUIDPipe) id: string) {
    await this.donationService.deleteDonation(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Donation deleted successfully',
    };
  }
}