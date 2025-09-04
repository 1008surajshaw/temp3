export interface CreateUserPlanDto {
  userId: string;
  planId: string;
  organizationId: string;
  expiryDate: Date;
}

export interface UserPlanResponseDto {
  id: string;
  userId: string;
  planId: string;
  organizationId: string;
  accessToken: string;
  purchaseDate: Date;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
}