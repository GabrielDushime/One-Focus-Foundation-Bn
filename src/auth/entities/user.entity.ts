import { Entity, Column, BeforeInsert } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ example: 'admin@example.com', description: 'User email' })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ example: 'Gabriel Dushime', description: 'Full name' })
  @Column({ name: 'full_name' })
  fullName: string;

  @ApiProperty({ example: 'admin', description: 'User role' })
  @Column({ default: 'admin' })
  role: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}