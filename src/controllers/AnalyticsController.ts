import { Request, Response } from 'express';
import { Analytics } from '../models/Analytics';

export const getOrganizationAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const { startDate, endDate } = req.query;
    
    const filter: any = { organizationId };
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    
    const analytics = await Analytics.find(filter).populate('featureId');
    res.status(200).json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeatureAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { featureId } = req.params;
    const { startDate, endDate } = req.query;
    
    const filter: any = { featureId };
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    
    const analytics = await Analytics.find(filter).populate('organizationId');
    res.status(200).json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await Analytics.aggregate([
      { $match: { organizationId, date: today } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: '$totalRequests' },
          successfulRequests: { $sum: '$successfulRequests' },
          failedRequests: { $sum: '$failedRequests' },
          limitExceededCount: { $sum: '$limitExceededCount' },
          avgResponseTime: { $avg: '$averageResponseTime' }
        }
      }
    ]);
    
    res.status(200).json({ success: true, data: stats[0] || {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};