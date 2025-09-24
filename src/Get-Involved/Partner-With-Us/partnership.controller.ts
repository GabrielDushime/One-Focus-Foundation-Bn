import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpStatus,
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
import { PartnershipService } from './partnership.service';
import { CreatePartnershipDto } from './create-partnership.dto';
import { UpdatePartnershipStatusDto } from './update-partnership-status.dto';
import { Partnership, PartnershipStatus } from './partnership.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Partnership With Us')
@Controller('partnerships')
export class PartnershipController {
  constructor(private readonly partnershipService: PartnershipService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a partnership request' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Partnership request submitted successfully',
    type: Partnership,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(@Body() createPartnershipDto: CreatePartnershipDto): Promise<Partnership> {
    return await this.partnershipService.create(createPartnershipDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all partnership requests' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: PartnershipStatus,
    description: 'Filter by partnership status' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partnership requests retrieved successfully',
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: PartnershipStatus,
  ) {
    return await this.partnershipService.findAll(page, limit, status);
  }

  @Get('statistics')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get partnership statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partnership statistics retrieved successfully',
  })
  async getStatistics() {
    return await this.partnershipService.getStatistics();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific partnership request' })
  @ApiParam({ name: 'id', description: 'Partnership ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partnership request retrieved successfully',
    type: Partnership,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partnership request not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Partnership> {
    return await this.partnershipService.findOne(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update partnership status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Partnership ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partnership status updated successfully',
    type: Partnership,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partnership request not found',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePartnershipStatusDto: UpdatePartnershipStatusDto,
  ): Promise<Partnership> {
    return await this.partnershipService.updateStatus(id, updatePartnershipStatusDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a partnership request' })
  @ApiParam({ name: 'id', description: 'Partnership ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Partnership request deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partnership request not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.partnershipService.delete(id);
  }
}