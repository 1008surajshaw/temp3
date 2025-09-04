export interface CreateOwnerDto {
  name: string;
  email: string;
  password: string;
  accountType: 'superadmin' | 'admin';
  organizationId?: string;
}

export interface LoginOwnerDto {
  email: string;
  password: string;
}

export interface UpdateOwnerDto {
  name?: string;
  email?: string;
  accountType?: 'superadmin' | 'admin';
  isActive?: boolean;
}

export interface OwnerResponseDto {
  id: string;
  name: string;
  email: string;
  accountType: string;
  organizationId?: string;
  organizationCreated: boolean;
  isActive: boolean;
  createdAt: Date;
}