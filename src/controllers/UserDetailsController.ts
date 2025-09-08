import { Request, Response } from 'express';
import { UserPlan } from '../models/UserPlan';
import { Usage } from '../models/Usage';
import { FeatureUser } from '../models/FeatureUser';

export const getUserCompleteDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken } = req.body;

    // Find user plan by access token
    let userPlan = await UserPlan.findOne({ accessToken, isActive: true })
      .populate({
        path: 'planId',
        populate: {
          path: 'features.featureId',
          model: 'Feature'
        }
      })
      .populate('userId')
      .populate('organizationId');

    if (!userPlan) {
      res.status(404).json({ success: false, message: 'User plan not found or inactive' });
      return;
    }

    // Check if token is expired and refresh if needed
    let newToken = null;
    if (new Date() > userPlan.tokenExpiryDate) {
      const { refreshUserPlanToken } = await import('../repositories/UserPlanRepository');
      const refreshedPlan = await refreshUserPlanToken(userPlan._id.toString());
      if (!refreshedPlan) {
        res.status(500).json({ success: false, message: 'Failed to refresh token' });
        return;
      }
      userPlan = refreshedPlan;
      newToken = userPlan.accessToken;
    }

    // Check if plan is expired
    if (new Date() > userPlan.expiryDate) {
      res.status(401).json({ success: false, message: 'Plan expired' });
      return;
    }

    // Get usage data for each feature
    const usageData = await Usage.find({
      userId: userPlan.userId,
      planId: userPlan.planId
    }).populate('featureId');

    // Build feature details with usage
    const featureDetails = userPlan.planId.features.map((planFeature: any) => {
      const usage = usageData.find(u => u.featureId._id.toString() === planFeature.featureId._id.toString());
      const currentUsage = usage ? usage.usageCount : 0;
      const remaining = planFeature.isUnlimited ? 'unlimited' : Math.max(0, planFeature.limit - currentUsage);

      return {
        featureId: planFeature.featureId._id,
        featureName: planFeature.featureId.name,
        featureDescription: planFeature.featureId.description,
        limit: planFeature.isUnlimited ? 'unlimited' : planFeature.limit,
        currentUsage,
        remaining,
        isUnlimited: planFeature.isUnlimited,
        usagePercentage: planFeature.isUnlimited ? 0 : Math.round((currentUsage / planFeature.limit) * 100),
        lastUsed: usage ? usage.lastUsed : null
      };
    });

    const response = {
      user: {
        id: userPlan.userId._id,
        name: userPlan.userId.name,
        email: userPlan.userId.email,
        isActive: userPlan.userId.isActive
      },
      plan: {
        id: userPlan.planId._id,
        name: userPlan.planId.name,
        description: userPlan.planId.description,
        price: userPlan.planId.price,
        billingCycle: userPlan.planId.billingCycle
      },
      subscription: {
        id: userPlan._id,
        purchaseDate: userPlan.purchaseDate,
        expiryDate: userPlan.expiryDate,
        isActive: userPlan.isActive,
        daysRemaining: Math.ceil((userPlan.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      },
      features: featureDetails,
      organization: {
        id: userPlan.organizationId._id,
        name: userPlan.organizationId.name
      }
    };

    const finalResponse: any = { success: true, data: response };
    if (newToken) {
      finalResponse.newToken = newToken;
      finalResponse.message = 'Token refreshed automatically';
    }
    
    res.status(200).json(finalResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};