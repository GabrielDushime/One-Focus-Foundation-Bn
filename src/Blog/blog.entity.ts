
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'blog_title', type: 'varchar', length: 255 })
  blogTitle: string;

  @Column({ name: 'blog_subtitle', type: 'varchar', length: 500, nullable: true })
  blogSubtitle?: string;

  @Column({ name: 'blog_description', type: 'text' })
  blogDescription: string;

  @Column({ name: 'blog_photo', type: 'text', nullable: true })
  blogPhoto?: string; 

  @Column({
    type: 'enum',
    enum: BlogStatus,
    name: 'status',
    default: BlogStatus.DRAFT,
  })
  status: BlogStatus;

  @Column({ name: 'author_name', type: 'varchar', length: 255, nullable: true })
  authorName?: string;

  @Column({ name: 'author_email', type: 'varchar', length: 255, nullable: true })
  authorEmail?: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ name: 'views_count', type: 'int', default: 0 })
  viewsCount: number;

  @Column({ name: 'reading_time', type: 'int', nullable: true })
  readingTime?: number; 

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
