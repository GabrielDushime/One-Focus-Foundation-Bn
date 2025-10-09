
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetInvolvedActionsService } from './get-involved-actions.service';
import {
  CreateGetInvolvedActionDto,
  UpdateGetInvolvedActionDto,
  GetInvolvedActionResponseDto,
  GetInvolvedActionsStatsDto,
} from './get-involved-actions.dto';
import { InterestArea, ApplicationStatus } from './get-involved-actions.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Get Involved Actions')
@Controller('get-involved-actions')
export class GetInvolvedActionsController {
  constructor(
    private readonly getInvolvedActionsService: GetInvolvedActionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Submit a get involved application (Public)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Application submitted successfully',
    type: GetInvolvedActionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createApplication(@Body() createDto: CreateGetInvolvedActionDto) {
    const application =
      await this.getInvolvedActionsService.createApplication(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message:
        'Thank you for your interest! Your application has been submitted successfully. We will contact you soon.',
      data: application,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all applications with filters (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiQuery({ name: 'interestArea', required: false, enum: InterestArea })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications retrieved successfully',
  })
  async findAllApplications(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: ApplicationStatus,
    @Query('interestArea') interestArea?: InterestArea,
  ) {
    const result = await this.getInvolvedActionsService.findAllApplications(
      page,
      limit,
      status,
      interestArea,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Applications retrieved successfully',
      data: {
        ...result,
        currentPage: page,
        limit,
      },
    };
  }

  @Get('pending')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all pending applications (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pending applications retrieved successfully',
  })
  async findPendingApplications(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result =
      await this.getInvolvedActionsService.findPendingApplications(
        page,
        limit,
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Pending applications retrieved successfully',
      data: {
        ...result,
        currentPage: page,
        limit,
      },
    };
  }

  @Get('by-interest/:interestArea')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get applications by interest area (Admin only)',
  })
  @ApiParam({ name: 'interestArea', enum: InterestArea })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications retrieved successfully',
  })
  async findByInterestArea(
    @Param('interestArea') interestArea: InterestArea,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result =
      await this.getInvolvedActionsService.findByInterestArea(
        interestArea,
        page,
        limit,
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Applications retrieved successfully',
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
  @ApiOperation({ summary: 'Get application statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: GetInvolvedActionsStatsDto,
  })
  async getStats() {
    const stats = await this.getInvolvedActionsService.getStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('search')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search applications (Admin only)' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search term',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results retrieved successfully',
  })
  async searchApplications(@Query('q') searchTerm: string) {
    const applications =
      await this.getInvolvedActionsService.searchApplications(searchTerm);
    return {
      statusCode: HttpStatus.OK,
      message: 'Search completed successfully',
      data: {
        applications,
        total: applications.length,
        searchTerm,
      },
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific application by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application retrieved successfully',
    type: GetInvolvedActionResponseDto,
  })
  async findApplicationById(@Param('id', ParseUUIDPipe) id: string) {
    const application =
      await this.getInvolvedActionsService.findApplicationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application retrieved successfully',
      data: application,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an application (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application updated successfully',
    type: GetInvolvedActionResponseDto,
  })
  async updateApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateGetInvolvedActionDto,
  ) {
    const application =
      await this.getInvolvedActionsService.updateApplication(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application updated successfully',
      data: application,
    };
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve an application (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application approved successfully',
  })
  async approveApplication(@Param('id', ParseUUIDPipe) id: string) {
    const application =
      await this.getInvolvedActionsService.approveApplication(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application approved successfully',
      data: application,
    };
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reject an application (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application rejected successfully',
  })
  async rejectApplication(@Param('id', ParseUUIDPipe) id: string) {
    const application =
      await this.getInvolvedActionsService.rejectApplication(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application rejected successfully',
      data: application,
    };
  }

  @Patch(':id/mark-contacted')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark application as contacted (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application marked as contacted successfully',
  })
  async markAsContacted(@Param('id', ParseUUIDPipe) id: string) {
    const application =
      await this.getInvolvedActionsService.markAsContacted(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application marked as contacted successfully',
      data: application,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an application (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application deleted successfully',
  })
  async deleteApplication(@Param('id', ParseUUIDPipe) id: string) {
    await this.getInvolvedActionsService.deleteApplication(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application deleted successfully',
    };
  }
}