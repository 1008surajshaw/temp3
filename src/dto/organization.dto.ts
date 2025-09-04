export interface CreateOrganizationDto {
  name: string;
  description: string;
  ownerId: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface OrganizationResponseDto {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
}