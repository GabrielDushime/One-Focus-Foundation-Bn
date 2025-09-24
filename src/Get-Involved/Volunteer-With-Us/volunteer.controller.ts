// src/volunteer/volunteer.controller.ts
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VolunteerService } from './volunteer.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerStatusDto } from './dto/update-volunteer-status.dto';
import { VolunteerQueryDto } from './dto/volunteer-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';


@ApiTags('Volunteer With Us')
@Controller('volunteers')
export class VolunteerController {
  constructor(private readonly volunteerService: VolunteerService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new volunteer application' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Volunteer application submitted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        volunteer: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed or agreements not accepted',
  })
  async create(@Body() createVolunteerDto: CreateVolunteerDto) {
    const volunteer = await this.volunteerService.create(createVolunteerDto);
    
    return {
      message: 'Thank you for your interest! Your volunteer application has been submitted successfully. We will review your application and get back to you soon.',
      volunteer: {
        id: volunteer.id,
        fullName: volunteer.fullName,
        emailAddress: volunteer.emailAddress,
        status: volunteer.status,
        submittedAt: volunteer.createdAt,
      },
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all volunteer applications (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of volunteer applications',
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  async findAll(@Query() query: VolunteerQueryDto) {
    const result = await this.volunteerService.findAll(query);
    
    return {
      message: 'Volunteer applications retrieved successfully',
      data: result.volunteers,
      total: result.total,
    };
  }

  @Get('statistics')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get volunteer statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Volunteer statistics',
  })
  async getStatistics() {
    const statistics = await this.volunteerService.getStatistics();
    
    return {
      message: 'Volunteer statistics retrieved successfully',
      data: statistics,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific volunteer application (Admin only)' })
  @ApiParam({ name: 'id', description: 'Volunteer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Volunteer application details',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Volunteer not found',
  })
  async findOne(@Param('id') id: string) {
    const volunteer = await this.volunteerService.findOne(id);
    
    return {
      message: 'Volunteer application retrieved successfully',
      data: volunteer,
    };
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update volunteer application status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Volunteer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Volunteer status updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Volunteer not found',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateVolunteerStatusDto,
  ) {
    const volunteer = await this.volunteerService.updateStatus(id, updateStatusDto);
    
    return {
      message: 'Volunteer status updated successfully',
      data: volunteer,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a volunteer application (Admin only)' })
  @ApiParam({ name: 'id', description: 'Volunteer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Volunteer application deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Volunteer not found',
  })
  async remove(@Param('id') id: string) {
    await this.volunteerService.remove(id);
    
    return {
      message: 'Volunteer application deleted successfully',
    };
  }

  @Get('status/:status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get volunteers by status (Admin only)' })
  @ApiParam({ 
    name: 'status', 
    description: 'Application status',
    enum: ['pending', 'approved', 'rejected', 'onboarding', 'active']
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Volunteers with specified status',
  })
  async findByStatus(@Param('status') status: string) {
    const volunteers = await this.volunteerService.findByStatus(status as any);
    
    return {
      message: `Volunteers with status "${status}" retrieved successfully`,
      data: volunteers,
      total: volunteers.length,
    };
  }

  @Get('email/:email')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check if email exists (Admin only)' })
  @ApiParam({ name: 'email', description: 'Email address to check' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email check result',
  })
  async checkEmail(@Param('email') email: string) {
    const volunteer = await this.volunteerService.findByEmail(email);
    
    return {
      message: 'Email check completed',
      exists: !!volunteer,
      volunteer: volunteer ? {
        id: volunteer.id,
        fullName: volunteer.fullName,
        status: volunteer.status,
        submittedAt: volunteer.createdAt,
      } : null,
    };
  }
}