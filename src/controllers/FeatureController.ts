import { Request, Response } from 'express';
import { CreateFeatureDto, UpdateFeatureDto } from '../dto/feature.dto';
import * as featureRepository from '../repositories/FeatureRepository';
import { AuthRequest } from '../middleware/auth';

export const createFeature = async (req: Request, res: Response): Promise<void> => {
  try {
    const featureData: CreateFeatureDto = req.body;
    const feature = await featureRepository.createFeature(featureData);
    res.status(201).json({ success: true, data: feature });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFeature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const feature = await featureRepository.findFeatureById(id);
    if (!feature) {
      res.status(404).json({ success: false, message: 'Feature not found' });
      return;
    }
    res.status(200).json({ success: true, data: feature });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFeaturesByOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const features = await featureRepository.findFeaturesByOrganizationId(organizationId);
    res.status(200).json({ success: true, data: features });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateFeature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateFeatureDto = req.body;
    const feature = await featureRepository.updateFeature(id, updateData);
    if (!feature) {
      res.status(404).json({ success: false, message: 'Feature not found' });
      return;
    }
    res.status(200).json({ success: true, data: feature });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteFeature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await featureRepository.deleteFeature(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Feature not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Feature deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllFeatures = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // If user has organizationId, filter by organization
    if (req.owner?.organizationId) {
      const features = await featureRepository.findFeaturesByOrganizationId(req.owner.organizationId);
      res.status(200).json({ success: true, data: features });
    } else {
      // Superadmin can see all features
      const features = await featureRepository.findAllFeatures();
      res.status(200).json({ success: true, data: features });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};