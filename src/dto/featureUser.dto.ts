export interface CreateFeatureUserDto {
  name: string;
  email: string;
  featureId: string;
  organizationId: string;
}

export interface FeatureUserResponseDto {
  id: string;
  name: string;
  email: string;
  featureId: string;
  organizationId: string;
  accessToken: string;
  isActive: boolean;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
}