import { Usage, IUsage } from '../models/Usage';
import { CreateUsageDto } from '../dto/usage.dto';

export const createUsage = async (data: CreateUsageDto): Promise<IUsage> => {
  const resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1);
  return await Usage.create({ ...data, resetDate });
};

export const findUsageByUserAndFeature = async (userId: string, featureId: string, planId: string): Promise<IUsage | null> => {
  return await Usage.findOne({ userId, featureId, planId });
};

export const incrementUsage = async (userId: string, featureId: string, planId: string): Promise<IUsage | null> => {
  return await Usage.findOneAndUpdate(
    { userId, featureId, planId },
    { 
      $inc: { usageCount: 1 },
      lastUsed: new Date()
    },
    { new: true }
  );
};

export const getUsageByOrganization = async (organizationId: string): Promise<IUsage[]> => {
  return await Usage.find({ organizationId })
    .populate('userId featureId planId');
};

export const getUsageByFeature = async (featureId: string): Promise<IUsage[]> => {
  return await Usage.find({ featureId })
    .populate('userId planId');
};

export const resetUsage = async (userId: string, featureId: string, planId: string): Promise<IUsage | null> => {
  const resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1);
  
  return await Usage.findOneAndUpdate(
    { userId, featureId, planId },
    { 
      usageCount: 0,
      resetDate,
      lastUsed: new Date()
    },
    { new: true }
  );
};