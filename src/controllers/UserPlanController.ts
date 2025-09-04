import { Request, Response } from 'express';
import { CreateUserPlanDto } from '../repositories/UserPlanRepository';
import * as userPlanRepository from '../repositories/UserPlanRepository';

export const createUserPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const planData: CreateUserPlanDto = req.body;
    const userPlan = await userPlanRepository.createUserPlan(planData);
    res.status(201).json({ 
      success: true, 
      data: {
        id: userPlan._id,
        accessToken: userPlan.accessToken,
        planId: userPlan.planId,
        expiryDate: userPlan.expiryDate
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userPlan = await userPlanRepository.findUserPlanById(id);
    if (!userPlan) {
      res.status(404).json({ success: false, message: 'User plan not found' });
      return;
    }
    res.status(200).json({ success: true, data: userPlan });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserPlansByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const userPlans = await userPlanRepository.findUserPlansByUser(userId);
    res.status(200).json({ success: true, data: userPlans });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const validateToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken } = req.body;
    const userPlan = await userPlanRepository.findUserPlanByToken(accessToken);
    
    if (!userPlan) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    if (new Date() > userPlan.expiryDate) {
      res.status(401).json({ success: false, message: 'Plan expired' });
      return;
    }

    res.status(200).json({ 
      success: true, 
      data: {
        valid: true,
        planId: userPlan.planId,
        userId: userPlan.userId,
        expiryDate: userPlan.expiryDate
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deactivateUserPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userPlan = await userPlanRepository.deactivateUserPlan(id);
    if (!userPlan) {
      res.status(404).json({ success: false, message: 'User plan not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User plan deactivated' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const upgradePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPlanId } = req.body;
    const userPlan = await userPlanRepository.upgradePlan(id, newPlanId);
    if (!userPlan) {
      res.status(404).json({ success: false, message: 'User plan not found' });
      return;
    }
    res.status(200).json({ success: true, data: userPlan, message: 'Plan upgraded successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const downgradePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPlanId } = req.body;
    const userPlan = await userPlanRepository.downgradePlan(id, newPlanId);
    if (!userPlan) {
      res.status(404).json({ success: false, message: 'User plan not found' });
      return;
    }
    res.status(200).json({ success: true, data: userPlan, message: 'Plan downgraded successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const removed = await userPlanRepository.removePlan(id);
    if (!removed) {
      res.status(404).json({ success: false, message: 'User plan not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Plan removed successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const extendExpiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newExpiryDate } = req.body;
    const userPlan = await userPlanRepository.extendExpiry(id, new Date(newExpiryDate));
    if (!userPlan) {
      res.status(404).json({ success: false, message: 'User plan not found' });
      return;
    }
    res.status(200).json({ success: true, data: userPlan, message: 'Plan expiry extended successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPlanHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const history = await userPlanRepository.getPlanHistory(userId);
    res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};