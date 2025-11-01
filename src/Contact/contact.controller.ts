
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
  Query,
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
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto, ContactResponseDto, ContactStatsDto } from './contact.dto';
import { ContactStatus } from './contact.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Contacts')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact form' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Contact submitted successfully',
    type: ContactResponseDto,
  })
  async create(@Body() createContactDto: CreateContactDto) {
    const contact = await this.contactService.create(createContactDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: contact,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contacts retrieved successfully',
    type: [ContactResponseDto],
  })
  async findAll() {
    const contacts = await this.contactService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Contacts retrieved successfully',
      data: contacts,
    };
  }

  @Get('stats')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get contact statistics (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: ContactStatsDto,
  })
  async getStats() {
    const stats = await this.contactService.getStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('new')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all new messages (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New messages retrieved successfully',
    type: [ContactResponseDto],
  })
  async getNewMessages() {
    const contacts = await this.contactService.getNewMessages();
    return {
      statusCode: HttpStatus.OK,
      message: 'New messages retrieved successfully',
      data: contacts,
    };
  }

  @Get('unread')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all unread messages (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Unread messages retrieved successfully',
    type: [ContactResponseDto],
  })
  async getUnreadMessages() {
    const contacts = await this.contactService.getUnreadMessages();
    return {
      statusCode: HttpStatus.OK,
      message: 'Unread messages retrieved successfully',
      data: contacts,
    };
  }

  @Get('status/:status')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get messages by status (Admin)' })
  @ApiParam({ name: 'status', enum: ContactStatus })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messages retrieved successfully',
    type: [ContactResponseDto],
  })
  async getByStatus(@Param('status') status: ContactStatus) {
    const contacts = await this.contactService.getByStatus(status);
    return {
      statusCode: HttpStatus.OK,
      message: 'Messages retrieved successfully',
      data: contacts,
    };
  }

  @Get(':id')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact retrieved successfully',
    type: ContactResponseDto,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const contact = await this.contactService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Contact retrieved successfully',
      data: contact,
    };
  }

  @Patch(':id')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a contact (Admin)' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact updated successfully',
    type: ContactResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    const contact = await this.contactService.update(id, updateContactDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Contact updated successfully',
      data: contact,
    };
  }

  @Patch(':id/read')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark message as read (Admin)' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message marked as read',
    type: ContactResponseDto,
  })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string) {
    const contact = await this.contactService.markAsRead(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Message marked as read',
      data: contact,
    };
  }

  @Patch(':id/reply')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark message as replied (Admin)' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message marked as replied',
    type: ContactResponseDto,
  })
  async markAsReplied(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('adminNotes') adminNotes?: string,
  ) {
    const contact = await this.contactService.markAsReplied(id, adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Message marked as replied',
      data: contact,
    };
  }

  @Patch(':id/archive')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Archive a message (Admin)' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message archived',
    type: ContactResponseDto,
  })
  async archive(@Param('id', ParseUUIDPipe) id: string) {
    const contact = await this.contactService.archive(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Message archived successfully',
      data: contact,
    };
  }

  @Delete(':id')
   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a contact (Admin)' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact deleted successfully',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.contactService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Contact deleted successfully',
    };
  }
}
