export interface CreateFeatureDto {
  name: string;
  description: string;
  organizationId: string;
}

export interface UpdateFeatureDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface FeatureResponseDto {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
}