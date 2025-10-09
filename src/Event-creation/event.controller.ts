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
  ParseBoolPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { EventService } from './event.service';
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponseDto,
  EventStatsDto,
  CreateEventWithFileDto,
} from './event.dto';
import { EventStatus, EventType } from './event.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('eventPhoto'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new event with photo upload (Admin only)' })
  @ApiBody({
    description: 'Create event with image file upload',
    type: CreateEventWithFileDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event created successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createEvent(
    @Body() createDto: CreateEventDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false, // Make file optional
      }),
    )
    file?: Express.Multer.File,
  ) {
    // Save file to disk and get file path
    if (file) {
      createDto.eventPhoto = await this.eventService.saveFile(file);
    }

    const event = await this.eventService.createEvent(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Event created successfully',
      data: event,
    };
  }

  @Post('upload-photo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload event photo (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Photo uploaded successfully',
  })
  async uploadEventPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const filePath = await this.eventService.saveFile(file);
    return {
      statusCode: HttpStatus.OK,
      message: 'Photo uploaded successfully',
      data: { eventPhoto: filePath },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all events (Public - with filters)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: EventStatus })
  @ApiQuery({ name: 'eventType', required: false, enum: EventType })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Events retrieved successfully',
  })
  async findAllEvents(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: EventStatus,
    @Query('eventType') eventType?: EventType,
    @Query('upcoming', new DefaultValuePipe(false), ParseBoolPipe) upcoming?: boolean,
  ) {
    const result = await this.eventService.findAllEvents(
      page, 
      limit, 
      status, 
      eventType,
      upcoming
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Events retrieved successfully',
      data: {
        ...result,
        currentPage: page,
        limit,
      },
    };
  }

  @Get('published')
  @ApiOperation({ summary: 'Get all published events (Public)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Published events retrieved successfully',
  })
  async findPublishedEvents(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.eventService.findPublishedEvents(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Published events retrieved successfully',
      data: {
        ...result,
        currentPage: page,
        limit,
      },
    };
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get all upcoming events (Public)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upcoming events retrieved successfully',
  })
  async findUpcomingEvents(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.eventService.findUpcomingEvents(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Upcoming events retrieved successfully',
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
  @ApiOperation({ summary: 'Get event statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: EventStatsDto,
  })
  async getEventStats() {
    const stats = await this.eventService.getEventStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Event statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search events (Public)' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search term' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results retrieved successfully',
  })
  async searchEvents(@Query('q') searchTerm: string) {
    const events = await this.eventService.searchEvents(searchTerm);
    return {
      statusCode: HttpStatus.OK,
      message: 'Search completed successfully',
      data: {
        events,
        total: events.length,
        searchTerm,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific event by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event retrieved successfully',
    type: EventResponseDto,
  })
  async findEventById(@Param('id', ParseUUIDPipe) id: string) {
    const event = await this.eventService.findEventById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Event retrieved successfully',
      data: event,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('eventPhoto'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an event with optional photo upload (Admin only)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiBody({
    description: 'Update event with optional image file upload',
    type: CreateEventWithFileDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event updated successfully',
    type: EventResponseDto,
  })
  async updateEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEventDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    // Save file to disk and get file path
    if (file) {
      updateDto.eventPhoto = await this.eventService.saveFile(file);
    }

    const event = await this.eventService.updateEvent(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Event updated successfully',
      data: event,
    };
  }

  @Patch(':id/publish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Publish an event (Admin only)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event published successfully',
  })
  async publishEvent(@Param('id', ParseUUIDPipe) id: string) {
    const event = await this.eventService.publishEvent(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Event published successfully',
      data: event,
    };
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel an event (Admin only)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event cancelled successfully',
  })
  async cancelEvent(@Param('id', ParseUUIDPipe) id: string) {
    const event = await this.eventService.cancelEvent(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Event cancelled successfully',
      data: event,
    };
  }

  @Patch(':id/ongoing')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark event as ongoing (Admin only)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event marked as ongoing successfully',
  })
  async markEventAsOngoing(@Param('id', ParseUUIDPipe) id: string) {
    const event = await this.eventService.markEventAsOngoing(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Event marked as ongoing successfully',
      data: event,
    };
  }

  @Patch(':id/complete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark event as completed (Admin only)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event marked as completed successfully',
  })
  async markEventAsCompleted(@Param('id', ParseUUIDPipe) id: string) {
    const event = await this.eventService.markEventAsCompleted(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Event marked as completed successfully',
      data: event,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an event (Admin only)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event deleted successfully',
  })
  async deleteEvent(@Param('id', ParseUUIDPipe) id: string) {
    await this.eventService.deleteEvent(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Event deleted successfully',
    };
  }
}