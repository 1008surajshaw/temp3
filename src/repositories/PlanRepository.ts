import { Plan, IPlan } from '../models/Plan';
import { CreatePlanDto, UpdatePlanDto } from '../dto/plan.dto';
import mongoose from 'mongoose';

export const createPlan = async (data: CreatePlanDto): Promise<IPlan> => {
  return await Plan.create(data);
};

export const findPlanById = async (id: string): Promise<IPlan | null> => {
  return await Plan.findById(id).populate('features.featureId organizationId');
};

export const findPlansByOrganizationId = async (organizationId: string): Promise<IPlan[]> => {
  try {
    return await Plan.find({ organizationId: new mongoose.Types.ObjectId(organizationId) }).populate('features.featureId');
  } catch (error) {
    // Fallback to string comparison if ObjectId conversion fails
    return await Plan.find({ organizationId: organizationId }).populate('features.featureId');
  }
};

export const updatePlan = async (id: string, data: UpdatePlanDto): Promise<IPlan | null> => {
  return await Plan.findByIdAndUpdate(id, data, { new: true });
};

export const deletePlan = async (id: string): Promise<boolean> => {
  const result = await Plan.findByIdAndDelete(id);
  return !!result;
};

export const findAllPlans = async (): Promise<IPlan[]> => {
  return await Plan.find().populate('features.featureId organizationId');
};