export interface CreateUsageDto {
  userId: string;
  featureId: string;
  planId: string;
  organizationId: string;
}

export interface UsageResponseDto {
  id: string;
  userId: string;
  featureId: string;
  planId: string;
  organizationId: string;
  usageCount: number;
  lastUsed: Date;
  resetDate: Date;
  createdAt: Date;
}

export interface FeatureUsageStatsDto {
  featureId: string;
  featureName: string;
  totalUsers: number;
  totalUsage: number;
  averageUsage: number;
  limitExceeded: number;
}