export interface CreatePlanDto {
  name: string;
  description: string;
  organizationId: string;
  features: {
    featureId: string;
    limit: number;
    isUnlimited: boolean;
  }[];
  price: number;
}

export interface UpdatePlanDto {
  name?: string;
  description?: string;
  features?: {
    featureId: string;
    limit: number;
    isUnlimited: boolean;
  }[];
  price?: number;
  isActive?: boolean;
}

export interface PlanResponseDto {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  features: {
    featureId: string;
    limit: number;
    isUnlimited: boolean;
  }[];
  price: number;
  isActive: boolean;
  createdAt: Date;
}