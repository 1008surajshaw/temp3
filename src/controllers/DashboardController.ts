import { Request, Response } from 'express';
import { Organization } from '../models/Organization';
import { Feature } from '../models/Feature';
import { Plan } from '../models/Plan';
import { FeatureUser } from '../models/FeatureUser';
import { UserPlan } from '../models/UserPlan';
import { Usage } from '../models/Usage';
import { Analytics } from '../models/Analytics';
import mongoose from 'mongoose';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalFeatures: number;
    totalPlans: number;
    activeUserPlans: number;
    totalRevenue: number;
    monthlyActiveUsers: number;
  };
  userStats: {
    newUsersThisMonth: number;
    userGrowthRate: number;
    activeUsersToday: number;
    topActiveUsers: Array<{
      userId: string;
      userName: string;
      email: string;
      totalUsage: number;
      lastActive: Date;
    }>;
  };
  featureStats: {
    mostPopularFeatures: Array<{
      featureId: string;
      featureName: string;
      userCount: number;
      totalUsage: number;
      avgUsagePerUser: number;
    }>;
    featureUsageTrend: Array<{
      featureId: string;
      featureName: string;
      dailyUsage: Array<{
        date: string;
        usage: number;
      }>;
    }>;
  };
  planStats: {
    mostPopularPlans: Array<{
      planId: string;
      planName: string;
      price: number;
      subscriberCount: number;
      revenue: number;
      conversionRate: number;
    }>;
    planDistribution: Array<{
      planName: string;
      count: number;
      percentage: number;
    }>;
    revenueByPlan: Array<{
      planName: string;
      revenue: number;
      percentage: number;
    }>;
  };
  usageStats: {
    totalApiCalls: number;
    successRate: number;
    avgResponseTime: number;
    peakUsageHours: Array<{
      hour: number;
      usage: number;
    }>;
    monthlyUsageTrend: Array<{
      month: string;
      totalUsage: number;
      uniqueUsers: number;
    }>;
  };
  performanceStats: {
    limitExceededCount: number;
    errorRate: number;
    topErrorFeatures: Array<{
      featureId: string;
      featureName: string;
      errorCount: number;
      errorRate: number;
    }>;
  };
}

export const getOrganizationDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const orgObjectId = new mongoose.Types.ObjectId(organizationId);

    // Verify organization exists
    const organization = await Organization.findById(orgObjectId);
    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    // Date ranges for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. OVERVIEW STATS
    const [totalFeatures, totalPlans, totalUsers, activeUserPlans] = await Promise.all([
      Feature.countDocuments({ organizationId: orgObjectId }),
      Plan.countDocuments({ organizationId: orgObjectId }),
      FeatureUser.countDocuments({ organizationId: orgObjectId }),
      UserPlan.countDocuments({ organizationId: orgObjectId, isActive: true })
    ]);

    // Calculate total revenue
    const revenueData = await UserPlan.aggregate([
      { $match: { organizationId: orgObjectId, isActive: true } },
      { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $group: { _id: null, totalRevenue: { $sum: '$plan.price' } } }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Monthly active users
    const monthlyActiveUsers = await Usage.distinct('userId', {
      organizationId: orgObjectId,
      lastUsed: { $gte: startOfMonth }
    }).then(users => users.length);

    // 2. USER STATS
    const newUsersThisMonth = await FeatureUser.countDocuments({
      organizationId: orgObjectId,
      createdAt: { $gte: startOfMonth }
    });

    const newUsersLastMonth = await FeatureUser.countDocuments({
      organizationId: orgObjectId,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const userGrowthRate = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : 0;

    const activeUsersToday = await Usage.distinct('userId', {
      organizationId: orgObjectId,
      lastUsed: { $gte: startOfToday }
    }).then(users => users.length);

    // Top active users
    const topActiveUsers = await Usage.aggregate([
      { $match: { organizationId: orgObjectId } },
      { $group: { 
        _id: '$userId', 
        totalUsage: { $sum: '$usageCount' },
        lastActive: { $max: '$lastUsed' }
      }},
      { $lookup: { from: 'featureusers', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: {
        userId: '$_id',
        userName: '$user.name',
        email: '$user.email',
        totalUsage: 1,
        lastActive: 1
      }},
      { $sort: { totalUsage: -1 } },
      { $limit: 10 }
    ]);

    // 3. FEATURE STATS
    const mostPopularFeatures = await Usage.aggregate([
      { $match: { organizationId: orgObjectId } },
      { $group: {
        _id: '$featureId',
        userCount: { $addToSet: '$userId' },
        totalUsage: { $sum: '$usageCount' }
      }},
      { $lookup: { from: 'features', localField: '_id', foreignField: '_id', as: 'feature' } },
      { $unwind: '$feature' },
      { $project: {
        featureId: '$_id',
        featureName: '$feature.name',
        userCount: { $size: '$userCount' },
        totalUsage: 1,
        avgUsagePerUser: { $divide: ['$totalUsage', { $size: '$userCount' }] }
      }},
      { $sort: { totalUsage: -1 } },
      { $limit: 10 }
    ]);

    // Feature usage trend (last 7 days)
    const featureUsageTrend = await Usage.aggregate([
      { $match: { 
        organizationId: orgObjectId,
        lastUsed: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      }},
      { $group: {
        _id: {
          featureId: '$featureId',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$lastUsed' } }
        },
        usage: { $sum: '$usageCount' }
      }},
      { $lookup: { from: 'features', localField: '_id.featureId', foreignField: '_id', as: 'feature' } },
      { $unwind: '$feature' },
      { $group: {
        _id: '$_id.featureId',
        featureName: { $first: '$feature.name' },
        dailyUsage: { $push: { date: '$_id.date', usage: '$usage' } }
      }},
      { $project: {
        featureId: '$_id',
        featureName: 1,
        dailyUsage: 1
      }}
    ]);

    // 4. PLAN STATS
    const mostPopularPlans = await UserPlan.aggregate([
      { $match: { organizationId: orgObjectId } },
      { $group: {
        _id: '$planId',
        subscriberCount: { $sum: 1 },
        activeSubscribers: { $sum: { $cond: ['$isActive', 1, 0] } }
      }},
      { $lookup: { from: 'plans', localField: '_id', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $project: {
        planId: '$_id',
        planName: '$plan.name',
        price: '$plan.price',
        subscriberCount: '$activeSubscribers',
        revenue: { $multiply: ['$activeSubscribers', '$plan.price'] },
        conversionRate: { $divide: ['$activeSubscribers', '$subscriberCount'] }
      }},
      { $sort: { subscriberCount: -1 } }
    ]);

    // Plan distribution
    const totalActivePlans = activeUserPlans;
    const planDistribution = mostPopularPlans.map(plan => ({
      planName: plan.planName,
      count: plan.subscriberCount,
      percentage: totalActivePlans > 0 ? (plan.subscriberCount / totalActivePlans) * 100 : 0
    }));

    // Revenue by plan
    const totalPlanRevenue = mostPopularPlans.reduce((sum, plan) => sum + plan.revenue, 0);
    const revenueByPlan = mostPopularPlans.map(plan => ({
      planName: plan.planName,
      revenue: plan.revenue,
      percentage: totalPlanRevenue > 0 ? (plan.revenue / totalPlanRevenue) * 100 : 0
    }));

    // 5. USAGE STATS
    const analyticsData = await Analytics.aggregate([
      { $match: { organizationId: orgObjectId } },
      { $group: {
        _id: null,
        totalApiCalls: { $sum: '$totalRequests' },
        successfulRequests: { $sum: '$successfulRequests' },
        failedRequests: { $sum: '$failedRequests' },
        avgResponseTime: { $avg: '$averageResponseTime' },
        limitExceededCount: { $sum: '$limitExceededCount' }
      }}
    ]);

    const analytics = analyticsData[0] || {
      totalApiCalls: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      limitExceededCount: 0
    };

    const successRate = analytics.totalApiCalls > 0 
      ? (analytics.successfulRequests / analytics.totalApiCalls) * 100 
      : 0;

    // Peak usage hours
    const peakUsageHours = await Analytics.aggregate([
      { $match: { organizationId: orgObjectId } },
      { $project: {
        hour: { $hour: '$createdAt' },
        totalRequests: 1
      }},
      { $group: {
        _id: '$hour',
        usage: { $sum: '$totalRequests' }
      }},
      { $project: {
        hour: '$_id',
        usage: 1,
        _id: 0
      }},
      { $sort: { usage: -1 } },
      { $limit: 5 }
    ]);

    // Monthly usage trend (last 6 months)
    const monthlyUsageTrend = await Usage.aggregate([
      { $match: { 
        organizationId: orgObjectId,
        createdAt: { $gte: new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000) }
      }},
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalUsage: { $sum: '$usageCount' },
        uniqueUsers: { $addToSet: '$userId' }
      }},
      { $project: {
        month: { $concat: [{ $toString: '$_id.year' }, '-', { $toString: '$_id.month' }] },
        totalUsage: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 6. PERFORMANCE STATS
    const errorRate = analytics.totalApiCalls > 0 
      ? (analytics.failedRequests / analytics.totalApiCalls) * 100 
      : 0;

    const topErrorFeatures = await Analytics.aggregate([
      { $match: { organizationId: orgObjectId } },
      { $group: {
        _id: '$featureId',
        errorCount: { $sum: '$failedRequests' },
        totalRequests: { $sum: '$totalRequests' }
      }},
      { $lookup: { from: 'features', localField: '_id', foreignField: '_id', as: 'feature' } },
      { $unwind: '$feature' },
      { $project: {
        featureId: '$_id',
        featureName: '$feature.name',
        errorCount: 1,
        errorRate: { 
          $cond: [
            { $gt: ['$totalRequests', 0] },
            { $multiply: [{ $divide: ['$errorCount', '$totalRequests'] }, 100] },
            0
          ]
        }
      }},
      { $sort: { errorCount: -1 } },
      { $limit: 5 }
    ]);

    // Compile dashboard stats
    const dashboardStats: DashboardStats = {
      overview: {
        totalUsers,
        totalFeatures,
        totalPlans,
        activeUserPlans,
        totalRevenue,
        monthlyActiveUsers
      },
      userStats: {
        newUsersThisMonth,
        userGrowthRate: Math.round(userGrowthRate * 100) / 100,
        activeUsersToday,
        topActiveUsers
      },
      featureStats: {
        mostPopularFeatures,
        featureUsageTrend
      },
      planStats: {
        mostPopularPlans,
        planDistribution,
        revenueByPlan
      },
      usageStats: {
        totalApiCalls: analytics.totalApiCalls,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: Math.round(analytics.avgResponseTime * 100) / 100,
        peakUsageHours,
        monthlyUsageTrend
      },
      performanceStats: {
        limitExceededCount: analytics.limitExceededCount,
        errorRate: Math.round(errorRate * 100) / 100,
        topErrorFeatures
      }
    };

    res.status(200).json({ 
      success: true, 
      data: dashboardStats,
      organizationName: organization.name,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};