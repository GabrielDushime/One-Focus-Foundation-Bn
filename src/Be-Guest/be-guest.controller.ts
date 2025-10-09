
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
import { BeGuestService } from './be-guest.service';
import {
  CreateGuestRequestDto,
  UpdateGuestRequestDto,
  GuestRequestResponseDto,
  GuestRequestStatsDto,
} from './be-guest.dto';
import { GuestRequestStatus } from './be-guest.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Be a Guest')
@Controller('be-guest')
export class BeGuestController {
  constructor(private readonly beGuestService: BeGuestService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a guest request' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Guest request submitted successfully',
    type: GuestRequestResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Guest request with this email already exists',
  })
  async createRequest(@Body() createDto: CreateGuestRequestDto) {
    const request = await this.beGuestService.createGuestRequest(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for your interest! Your guest request has been submitted successfully. We will review your application and contact you soon.',
      data: request,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all guest requests (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: GuestRequestStatus })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guest requests retrieved successfully',
  })
  async findAllRequests(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: GuestRequestStatus,
  ) {
    const result = await this.beGuestService.findAllRequests(page, limit, status);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guest requests retrieved successfully',
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
  @ApiOperation({ summary: 'Get guest request statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: GuestRequestStatsDto,
  })
  async getRequestStats() {
    const stats = await this.beGuestService.getRequestStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Guest request statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific guest request by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Guest request UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guest request retrieved successfully',
    type: GuestRequestResponseDto,
  })
  async findRequestById(@Param('id', ParseUUIDPipe) id: string) {
    const request = await this.beGuestService.findRequestById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guest request retrieved successfully',
      data: request,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update guest request (Admin only)' })
  @ApiParam({ name: 'id', description: 'Guest request UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guest request updated successfully',
    type: GuestRequestResponseDto,
  })
  async updateRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateGuestRequestDto,
  ) {
    const request = await this.beGuestService.updateRequest(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guest request updated successfully',
      data: request,
    };
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve a guest request (Admin only)' })
  @ApiParam({ name: 'id', description: 'Guest request UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guest request approved successfully',
  })
  async approveRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: { adminNotes?: string }
  ) {
    const request = await this.beGuestService.approveRequest(id, body?.adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guest request approved successfully',
      data: request,
    };
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reject a guest request (Admin only)' })
  @ApiParam({ name: 'id', description: 'Guest request UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guest request rejected successfully',
  })
  async rejectRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: { adminNotes?: string }
  ) {
    const request = await this.beGuestService.rejectRequest(id, body?.adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guest request rejected successfully',
      data: request,
    };
  }

  @Patch(':id/contacted')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark guest request as contacted (Admin only)' })
  @ApiParam({ name: 'id', description: 'Guest request UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guest request marked as contacted',
  })
  async markAsContacted(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: { adminNotes?: string }
  ) {
    const request = await this.beGuestService.markAsContacted(id, body?.adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guest request marked as contacted',
      data: request,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a guest request (Admin only)' })
  @ApiParam({ name: 'id', description: 'Guest request UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guest request deleted successfully',
  })
  async deleteRequest(@Param('id', ParseUUIDPipe) id: string) {
    await this.beGuestService.deleteRequest(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guest request deleted successfully',
    };
  }
}
