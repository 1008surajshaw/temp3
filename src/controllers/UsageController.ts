import { Request, Response } from 'express';
import * as usageRepository from '../repositories/UsageRepository';
import * as planRepository from '../repositories/PlanRepository';
import { UserPlan } from '../models/UserPlan';
import { Analytics } from '../models/Analytics';
import { RateLimit } from '../models/RateLimit';

const extractId = (field: any): string => {
  return typeof field === 'object' && field._id ? field._id.toString() : field.toString();
};

const recordAnalytics = async (organizationId: string | null, featureId: string, success: boolean, responseTime: number, limitExceeded: boolean = false): Promise<void> => {
  if (!organizationId) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  await Analytics.findOneAndUpdate(
    { organizationId, featureId, date: today },
    {
      $inc: {
        totalRequests: 1,
        successfulRequests: success ? 1 : 0,
        failedRequests: success ? 0 : 1,
        limitExceededCount: limitExceeded ? 1 : 0
      },
      $set: {
        averageResponseTime: responseTime
      }
    },
    { upsert: true }
  );
};

const checkRateLimit = async (userId: string, featureId: string): Promise<boolean> => {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 60000); // 1 minute window
  
  const rateLimit = await RateLimit.findOneAndUpdate(
    { userId, featureId },
    {
      $inc: { requestCount: 1 },
      $setOnInsert: { windowStart: now, windowEnd: new Date(now.getTime() + 60000) }
    },
    { upsert: true, new: true }
  );
  
  return rateLimit.requestCount > 100; // 100 requests per minute
};

export const trackUsage = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    const { accessToken, featureId } = req.body;

    // Validate token and check expiry
    let userPlan = await UserPlan.findOne({ accessToken, isActive: true })
      .populate('planId userId');
    
    if (!userPlan) {
      await recordAnalytics(null, featureId, false, Date.now() - startTime);
      res.status(401).json({ success: false, message: 'Invalid access token' });
      return;
    }

    // Check if token is expired and refresh if needed
    if (new Date() > userPlan.tokenExpiryDate) {
      const refreshedPlan = await userPlanRepository.refreshUserPlanToken(userPlan._id.toString());
      if (!refreshedPlan) {
        await recordAnalytics(organizationId, featureId, false, Date.now() - startTime);
        res.status(500).json({ success: false, message: 'Failed to refresh token' });
        return;
      }
      userPlan = refreshedPlan;
      
      // Return new token to client
      res.setHeader('X-New-Token', userPlan.accessToken);
    }

    // Extract IDs safely
    const userId = extractId(userPlan.userId);
    const planId = extractId(userPlan.planId);
    const organizationId = extractId(userPlan.organizationId);

    // Check plan expiry
    if (new Date() > userPlan.expiryDate) {
      await recordAnalytics(organizationId, featureId, false, Date.now() - startTime);
      res.status(401).json({ success: false, message: 'Plan expired' });
      return;
    }

    const plan = await planRepository.findPlanById(planId);
    if (!plan) {
      await recordAnalytics(organizationId, featureId, false, Date.now() - startTime);
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    const featureLimit = plan.features.find(f => extractId(f.featureId) === featureId);
    if (!featureLimit) {
      await recordAnalytics(organizationId, featureId, false, Date.now() - startTime);
      res.status(403).json({ success: false, message: 'Feature not included in plan' });
      return;
    }

    // Check rate limiting
    const isRateLimited = await checkRateLimit(userId, featureId);
    if (isRateLimited) {
      await recordAnalytics(organizationId, featureId, false, Date.now() - startTime);
      res.status(429).json({ success: false, message: 'Rate limit exceeded' });
      return;
    }

    let usage = await usageRepository.findUsageByUserAndFeature(
      userId,
      featureId,
      planId
    );

    if (!usage) {
      usage = await usageRepository.createUsage({
        userId,
        featureId,
        planId,
        organizationId
      });
    }

    if (!featureLimit.isUnlimited && usage.usageCount >= featureLimit.limit) {
      await recordAnalytics(organizationId, featureId, false, Date.now() - startTime, true);
      res.status(429).json({ 
        success: false, 
        message: 'Usage limit exceeded',
        currentUsage: usage.usageCount,
        limit: featureLimit.limit
      });
      return;
    }

    const updatedUsage = await usageRepository.incrementUsage(
      userId,
      featureId,
      planId
    );

    await recordAnalytics(organizationId, featureId, true, Date.now() - startTime);

    res.status(200).json({ 
      success: true, 
      data: {
        currentUsage: updatedUsage?.usageCount,
        limit: featureLimit.isUnlimited ? 'unlimited' : featureLimit.limit,
        remaining: featureLimit.isUnlimited ? 'unlimited' : featureLimit.limit - (updatedUsage?.usageCount || 0)
      }
    });
  } catch (error: any) {
    await recordAnalytics(null, req.body.featureId, false, Date.now() - startTime);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsageStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const usage = await usageRepository.getUsageByOrganization(organizationId);
    res.status(200).json({ success: true, data: usage });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeatureUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { featureId } = req.params;
    const usage = await usageRepository.getUsageByFeature(featureId);
    res.status(200).json({ success: true, data: usage });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};