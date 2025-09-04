import { Feature, IFeature } from '../models/Feature';
import { CreateFeatureDto, UpdateFeatureDto } from '../dto/feature.dto';

export const createFeature = async (data: CreateFeatureDto): Promise<IFeature> => {
  return await Feature.create(data);
};

export const findFeatureById = async (id: string): Promise<IFeature | null> => {
  return await Feature.findById(id).populate('organizationId');
};

export const findFeaturesByOrganizationId = async (organizationId: string): Promise<IFeature[]> => {
  return await Feature.find({ organizationId });
};

export const updateFeature = async (id: string, data: UpdateFeatureDto): Promise<IFeature | null> => {
  return await Feature.findByIdAndUpdate(id, data, { new: true });
};

export const deleteFeature = async (id: string): Promise<boolean> => {
  const result = await Feature.findByIdAndDelete(id);
  return !!result;
};

export const findAllFeatures = async (): Promise<IFeature[]> => {
  return await Feature.find().populate('organizationId');
};