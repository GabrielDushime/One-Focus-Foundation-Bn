import { Controller, Get, Post, Body, Param, Patch, Delete, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { GetInvolvedService } from './get-involved.service';
import { CreateGetInvolvedDto } from './create-get-involved.dto';
import { GetInvolved } from './get-involved.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Get Involved')
@Controller('get-involved')
export class GetInvolvedController {
  constructor(private readonly getInvolvedService: GetInvolvedService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a mentorship application' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Application submitted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            status: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists or validation failed'
  })
  async create(@Body() createGetInvolvedDto: CreateGetInvolvedDto) {
    const application = await this.getInvolvedService.create(createGetInvolvedDto);
    
    return {
      success: true,
      message: "Thank you for registering! You'll soon be contacted by the ONEFOCUS team to be matched with a mentor who fits your path. Let's grow together!",
      data: {
        id: application.id,
        fullName: application.fullName,
        email: application.email,
        status: application.status,
        createdAt: application.createdAt
      }
    };
  }

  @Get()
 @ApiBearerAuth()
 @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all mentorship applications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all applications',
    type: [GetInvolved]
  })
  async findAll() {
    const applications = await this.getInvolvedService.findAll();
    return {
      success: true,
      data: applications,
      total: applications.length
    };
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get application statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application statistics'
  })
  async getStats() {
    const stats = await this.getInvolvedService.getStats();
    return {
      success: true,
      data: stats
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific mentorship application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application details',
    type: GetInvolved
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Application not found'
  })
  async findOne(@Param('id') id: string) {
    const application = await this.getInvolvedService.findOne(id);
    return {
      success: true,
      data: application
    };
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update application status' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status updated successfully'
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateData: { status: string }
  ) {
    const application = await this.getInvolvedService.updateStatus(id, updateData.status);
    return {
      success: true,
      message: 'Status updated successfully',
      data: application
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a mentorship application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application deleted successfully'
  })
  async remove(@Param('id') id: string) {
    await this.getInvolvedService.remove(id);
    return {
      success: true,
      message: 'Application deleted successfully'
    };
  }
}