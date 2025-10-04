
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, ContactStatus } from './contact.entity';
import { CreateContactDto, UpdateContactDto } from './contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    return await this.contactRepository.save(contact);
  }

  async findAll(): Promise<Contact[]> {
    return await this.contactRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(id);
    Object.assign(contact, updateContactDto);
    return await this.contactRepository.save(contact);
  }

  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    await this.contactRepository.remove(contact);
  }

  async markAsRead(id: string): Promise<Contact> {
    const contact = await this.findOne(id);
    contact.isRead = true;
    contact.readAt = new Date();
    if (contact.status === ContactStatus.NEW) {
      contact.status = ContactStatus.READ;
    }
    return await this.contactRepository.save(contact);
  }

  async markAsReplied(id: string, adminNotes?: string): Promise<Contact> {
    const contact = await this.findOne(id);
    contact.status = ContactStatus.REPLIED;
    contact.isRead = true;
    if (!contact.readAt) {
      contact.readAt = new Date();
    }
    if (adminNotes) {
      contact.adminNotes = adminNotes;
    }
    return await this.contactRepository.save(contact);
  }

  async archive(id: string): Promise<Contact> {
    const contact = await this.findOne(id);
    contact.status = ContactStatus.ARCHIVED;
    return await this.contactRepository.save(contact);
  }

  async getNewMessages(): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: { status: ContactStatus.NEW },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadMessages(): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: { isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async getByStatus(status: ContactStatus): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(): Promise<{
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
  }> {
    const total = await this.contactRepository.count();
    const newCount = await this.contactRepository.count({
      where: { status: ContactStatus.NEW },
    });
    const readCount = await this.contactRepository.count({
      where: { status: ContactStatus.READ },
    });
    const repliedCount = await this.contactRepository.count({
      where: { status: ContactStatus.REPLIED },
    });
    const archivedCount = await this.contactRepository.count({
      where: { status: ContactStatus.ARCHIVED },
    });

    return {
      total,
      new: newCount,
      read: readCount,
      replied: repliedCount,
      archived: archivedCount,
    };
  }
}
