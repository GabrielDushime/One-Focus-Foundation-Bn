import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (user && await user.validatePassword(password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { email: user.email, sub: user.id };
    
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user with this email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    
    // Create new user
    const user = this.usersRepository.create(registerDto);
    await this.usersRepository.save(user);
    
    // Return the user without password
    const { password, ...result } = user;
    return result;
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  // New services for user management
  
  async getAllUsers(): Promise<User[]> {
    const users = await this.usersRepository.find();
    // Remove passwords from the response
    return users.map(user => {
      const { password, ...result } = user;
      return result as User;
    });
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.remove(user);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // If updating email, check if it already exists for another user
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }
    
    // Update password if provided
    if (updateUserDto.password) {
      // Assuming the entity has a method to hash the password before saving
      user.password = updateUserDto.password;
    }
    
    // Update other fields
    Object.assign(user, updateUserDto);
    
    // Save the updated user
    await this.usersRepository.save(user);
    
    // Return the user without password
    const { password, ...result } = user;
    return result as User;
  }
}