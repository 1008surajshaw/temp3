import { IUserService } from '../interfaces/IUserService';
import { IUserRepository } from '../interfaces/IUserRepository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto';
import { PaginatedResponse } from '../types/common';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getAllUsers(page: number, limit: number): Promise<PaginatedResponse<UserResponseDto>> {
    const offset = (page - 1) * limit;
    const { users, total } = await this.userRepository.findAll(offset, limit);
    
    return {
      success: true,
      data: users.map(this.mapToResponseDto),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: number): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.mapToResponseDto(user) : null;
  }

  async createUser(userData: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await this.userRepository.create(userData);
    return this.mapToResponseDto(user);
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<UserResponseDto | null> {
    if (userData.email) {
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already in use');
      }
    }

    const user = await this.userRepository.update(id, userData);
    return user ? this.mapToResponseDto(user) : null;
  }

  async deleteUser(id: number): Promise<boolean> {
    return await this.userRepository.delete(id);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.mapToResponseDto(user) : null;
  }

  private mapToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}