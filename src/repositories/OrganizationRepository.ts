import { Organization, IOrganization } from '../models/Organization';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto/organization.dto';

export const createOrganization = async (data: CreateOrganizationDto): Promise<IOrganization> => {
  return await Organization.create(data);
};

export const findOrganizationById = async (id: string): Promise<IOrganization | null> => {
  return await Organization.findById(id).populate('ownerId');
};

export const findOrganizationsByOwnerId = async (ownerId: string): Promise<IOrganization[]> => {
  return await Organization.find({ ownerId });
};

export const updateOrganization = async (id: string, data: UpdateOrganizationDto): Promise<IOrganization | null> => {
  return await Organization.findByIdAndUpdate(id, data, { new: true });
};

export const deleteOrganization = async (id: string): Promise<boolean> => {
  const result = await Organization.findByIdAndDelete(id);
  return !!result;
};

export const findAllOrganizations = async (): Promise<IOrganization[]> => {
  return await Organization.find().populate('ownerId');
};