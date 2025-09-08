import { UserPlan, IUserPlan } from '../models/UserPlan';
import { generatePlanToken } from '../utils/tokenGenerator';

export interface CreateUserPlanDto {
  userId: string;
  planId: string;
  organizationId: string;
  expiryDate: Date;
}

export const createUserPlan = async (data: CreateUserPlanDto): Promise<IUserPlan> => {
  const accessToken = generatePlanToken(data.userId, data.planId);
  const tokenExpiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  return await UserPlan.create({ ...data, accessToken, tokenExpiryDate });
};

export const findUserPlanById = async (id: string): Promise<IUserPlan | null> => {
  return await UserPlan.findById(id).populate('userId planId organizationId');
};

export const findUserPlanByToken = async (accessToken: string): Promise<IUserPlan | null> => {
  return await UserPlan.findOne({ accessToken, isActive: true })
    .populate('userId planId organizationId');
};

export const findUserPlansByUser = async (userId: string): Promise<IUserPlan[]> => {
  return await UserPlan.find({ userId, isActive: true })
    .populate('planId organizationId');
};

export const deactivateUserPlan = async (id: string): Promise<IUserPlan | null> => {
  return await UserPlan.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

export const findUserPlansByOrganization = async (organizationId: string): Promise<IUserPlan[]> => {
  return await UserPlan.find({ organizationId })
    .populate('userId planId');
};

export const upgradePlan = async (id: string, newPlanId: string): Promise<IUserPlan | null> => {
  const newAccessToken = generatePlanToken(id, newPlanId);
  return await UserPlan.findByIdAndUpdate(
    id,
    { planId: newPlanId, accessToken: newAccessToken },
    { new: true }
  ).populate('userId planId organizationId');
};

export const downgradePlan = async (id: string, newPlanId: string): Promise<IUserPlan | null> => {
  const newAccessToken = generatePlanToken(id, newPlanId);
  return await UserPlan.findByIdAndUpdate(
    id,
    { planId: newPlanId, accessToken: newAccessToken },
    { new: true }
  ).populate('userId planId organizationId');
};

export const removePlan = async (id: string): Promise<boolean> => {
  const result = await UserPlan.findByIdAndDelete(id);
  return !!result;
};

export const extendExpiry = async (id: string, newExpiryDate: Date): Promise<IUserPlan | null> => {
  return await UserPlan.findByIdAndUpdate(
    id,
    { expiryDate: newExpiryDate },
    { new: true }
  ).populate('userId planId organizationId');
};

export const getPlanHistory = async (userId: string): Promise<IUserPlan[]> => {
  return await UserPlan.find({ userId })
    .populate('planId organizationId')
    .sort({ createdAt: -1 });
};

export const refreshUserPlanToken = async (id: string): Promise<IUserPlan | null> => {
  const newAccessToken = generatePlanToken(id, Date.now().toString());
  const newTokenExpiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  return await UserPlan.findByIdAndUpdate(
    id,
    { 
      accessToken: newAccessToken,
      tokenExpiryDate: newTokenExpiryDate
    },
    { new: true }
  ).populate('userId planId organizationId');
};