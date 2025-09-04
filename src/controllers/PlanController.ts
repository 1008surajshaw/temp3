import { Request, Response } from 'express';
import { CreatePlanDto, UpdatePlanDto } from '../dto/plan.dto';
import * as planRepository from '../repositories/PlanRepository';

export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const planData: CreatePlanDto = req.body;
    const plan = await planRepository.createPlan(planData);
    res.status(201).json({ success: true, data: plan });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await planRepository.findPlanById(id);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPlansByOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const plans = await planRepository.findPlansByOrganizationId(organizationId);
    res.status(200).json({ success: true, data: plans });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdatePlanDto = req.body;
    const plan = await planRepository.updatePlan(id, updateData);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await planRepository.deletePlan(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await planRepository.findAllPlans();
    res.status(200).json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};