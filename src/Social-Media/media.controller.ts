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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialMediaSupportRequestResponseDto, CreateSocialMediaSupportRequestDto, UpdateSocialMediaSupportRequestDto } from './media.dto';
import { SupportRequestStatus, SocialMediaPlatform } from './media.entity';
import { SocialMediaSupportService } from './media.service';

@ApiTags('Social Media Support')
@Controller('social-media-support')
export class SocialMediaSupportController {
  constructor(private readonly supportService: SocialMediaSupportService) {}

  @Post()
  @ApiOperation({ summary: 'Request social media support (Public)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Support request submitted successfully',
    type: SocialMediaSupportRequestResponseDto,
  })
  async createRequest(@Body() createDto: CreateSocialMediaSupportRequestDto) {
    const request = await this.supportService.createRequest(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Your social media support request has been submitted successfully',
      data: request,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all support requests (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: SupportRequestStatus })
  @ApiQuery({ name: 'platform', required: false, enum: SocialMediaPlatform })
  @ApiResponse({ status: HttpStatus.OK })
  async findAllRequests(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: SupportRequestStatus,
    @Query('platform') platform?: SocialMediaPlatform,
  ) {
    const result = await this.supportService.findAllRequests(
      page,
      limit,
      status,
      platform,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Requests retrieved successfully',
      data: { ...result, currentPage: page, limit },
    };
  }

  @Get('my-requests/:email')
  @ApiOperation({ summary: 'Get requests by email (Public)' })
  @ApiParam({ name: 'email' })
  @ApiResponse({ status: HttpStatus.OK })
  async findRequestsByEmail(@Param('email') email: string) {
    const requests = await this.supportService.findRequestsByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'Your requests retrieved successfully',
      data: { requests, total: requests.length },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get request by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async findRequestById(@Param('id', ParseUUIDPipe) id: string) {
    const request = await this.supportService.findRequestById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Request retrieved successfully',
      data: request,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update request (Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSocialMediaSupportRequestDto,
  ) {
    const request = await this.supportService.updateRequest(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Request updated successfully',
      data: request,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete request (Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteRequest(@Param('id', ParseUUIDPipe) id: string) {
    await this.supportService.deleteRequest(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Request deleted successfully',
    };
  }
}