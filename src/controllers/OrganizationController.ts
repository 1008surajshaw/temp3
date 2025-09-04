import { Request, Response } from 'express';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto/organization.dto';
import * as organizationRepository from '../repositories/OrganizationRepository';

const mapToResponseDto = (organization: any) => ({
  id: organization._id.toString(),
  name: organization.name,
  description: organization.description,
  ownerId: organization.ownerId.toString(),
  isActive: organization.isActive,
  createdAt: organization.createdAt
});

export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizationData: CreateOrganizationDto = req.body;
    const organization = await organizationRepository.createOrganization(organizationData);
    res.status(201).json({ success: true, data: mapToResponseDto(organization) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organization = await organizationRepository.findOrganizationById(id);
    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }
    res.status(200).json({ success: true, data: mapToResponseDto(organization) });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getOrganizationsByOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ownerId } = req.params;
    const organizations = await organizationRepository.findOrganizationsByOwnerId(ownerId);
    res.status(200).json({ success: true, data: organizations.map(mapToResponseDto) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateOrganizationDto = req.body;
    const organization = await organizationRepository.updateOrganization(id, updateData);
    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }
    res.status(200).json({ success: true, data: mapToResponseDto(organization) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await organizationRepository.deleteOrganization(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Organization deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizations = await organizationRepository.findAllOrganizations();
    res.status(200).json({ success: true, data: organizations.map(mapToResponseDto) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};