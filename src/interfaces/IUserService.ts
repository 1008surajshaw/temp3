import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto';
import { PaginatedResponse } from '../types/common';

export interface IUserService {
  getAllUsers(page: number, limit: number): Promise<PaginatedResponse<UserResponseDto>>;
  getUserById(id: number): Promise<UserResponseDto | null>;
  createUser(userData: CreateUserDto): Promise<UserResponseDto>;
  updateUser(id: number, userData: UpdateUserDto): Promise<UserResponseDto | null>;
  deleteUser(id: number): Promise<boolean>;
  getUserByEmail(email: string): Promise<UserResponseDto | null>;
}