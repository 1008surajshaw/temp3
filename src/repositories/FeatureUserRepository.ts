import { FeatureUser, IFeatureUser } from '../models/FeatureUser';
import { generateAccessToken } from '../utils/tokenGenerator';

export interface CreateFeatureUserDto {
  name: string;
  email: string;
  featureId: string;
  organizationId: string;
}

export const createFeatureUser = async (data: CreateFeatureUserDto): Promise<IFeatureUser> => {
  const accessToken = generateAccessToken();
  return await FeatureUser.create({ ...data, accessToken });
};

export const findFeatureUserById = async (id: string): Promise<IFeatureUser | null> => {
  return await FeatureUser.findById(id).populate('featureId organizationId');
};

export const findFeatureUserByToken = async (accessToken: string): Promise<IFeatureUser | null> => {
  return await FeatureUser.findOne({ accessToken, isActive: true })
    .populate('featureId organizationId');
};

export const findFeatureUsersByFeature = async (featureId: string): Promise<IFeatureUser[]> => {
  return await FeatureUser.find({ featureId, isActive: true });
};

export const findFeatureUsersByOrganization = async (organizationId: string): Promise<IFeatureUser[]> => {
  return await FeatureUser.find({ organizationId })
    .populate('featureId');
};

export const updateFeatureUserUsage = async (id: string): Promise<IFeatureUser | null> => {
  return await FeatureUser.findByIdAndUpdate(
    id,
    { 
      $inc: { usageCount: 1 },
      lastUsed: new Date()
    },
    { new: true }
  );
};

export const deactivateFeatureUser = async (id: string): Promise<IFeatureUser | null> => {
  return await FeatureUser.findByIdAndUpdate(id, { isActive: false }, { new: true });
};