import { Owner, IOwner } from '../models/Owner';
import { CreateOwnerDto, UpdateOwnerDto } from '../dto/owner.dto';
import bcrypt from 'bcryptjs';

export const createOwner = async (data: CreateOwnerDto): Promise<IOwner> => {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  return await Owner.create({ ...data, password: hashedPassword });
};

export const findOwnerByEmailWithPassword = async (email: string): Promise<IOwner | null> => {
  return await Owner.findOne({ email }).select('+password');
};

export const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const findOwnerById = async (id: string): Promise<IOwner | null> => {
  return await Owner.findById(id).populate('organizationId');
};

export const findOwnerByEmail = async (email: string): Promise<IOwner | null> => {
  return await Owner.findOne({ email });
};

export const updateOwner = async (id: string, data: UpdateOwnerDto): Promise<IOwner | null> => {
  return await Owner.findByIdAndUpdate(id, data, { new: true });
};

export const deleteOwner = async (id: string): Promise<boolean> => {
  const result = await Owner.findByIdAndDelete(id);
  return !!result;
};

export const findAllOwners = async (): Promise<IOwner[]> => {
  return await Owner.find().populate('organizationId');
};