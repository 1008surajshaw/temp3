import { Request, Response } from 'express';
import { CreateFeatureUserDto } from '../repositories/FeatureUserRepository';
import * as featureUserRepository from '../repositories/FeatureUserRepository';

export const createFeatureUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: CreateFeatureUserDto = req.body;
    const user = await featureUserRepository.createFeatureUser(userData);
    res.status(201).json({ 
      success: true, 
      data: {
        id: user._id,
        accessToken: user.accessToken,
        name: user.name,
        email: user.email,
        featureId: user.featureId
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFeatureUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await featureUserRepository.findFeatureUserById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Feature user not found' });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFeatureUsersByFeature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { featureId } = req.params;
    const users = await featureUserRepository.findFeatureUsersByFeature(featureId);
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFeatureUsersByOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const users = await featureUserRepository.findFeatureUsersByOrganization(organizationId);
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const validateFeatureUserToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken } = req.body;
    const user = await featureUserRepository.findFeatureUserByToken(accessToken);
    
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid access token' });
      return;
    }

    res.status(200).json({ 
      success: true, 
      data: {
        valid: true,
        userId: user._id,
        featureId: user.featureId,
        organizationId: user.organizationId
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFeatureUserActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }
    const user = await featureUserRepository.toggleFeatureUserActivity(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Feature user not found' });
      return;
    }
    const status = user.isActive ? 'activated' : 'deactivated';
    res.status(200).json({ 
      success: true, 
      data: user,
      message: `Feature user ${status}` 
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};