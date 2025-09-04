import { Request, Response } from 'express';
import { CreateOwnerDto, UpdateOwnerDto, LoginOwnerDto } from '../dto/owner.dto';
import * as ownerRepository from '../repositories/OwnerRepository';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

const mapToResponseDto = (owner: any) => ({
  id: owner._id.toString(),
  name: owner.name,
  email: owner.email,
  accountType: owner.accountType,
  organizationId: owner.organizationId?.toString(),
  isActive: owner.isActive,
  createdAt: owner.createdAt
});

export const createOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerData: CreateOwnerDto = req.body;
    
    const existingOwner = await ownerRepository.findOwnerByEmail(ownerData.email);
    if (existingOwner) {
      res.status(400).json({ success: false, message: 'Owner with this email already exists' });
      return;
    }

    const owner = await ownerRepository.createOwner(ownerData);
    res.status(201).json({ success: true, data: mapToResponseDto(owner) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const owner = await ownerRepository.findOwnerById(id);
    if (!owner) {
      res.status(404).json({ success: false, message: 'Owner not found' });
      return;
    }
    res.status(200).json({ success: true, data: mapToResponseDto(owner) });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateOwnerDto = req.body;
    const owner = await ownerRepository.updateOwner(id, updateData);
    if (!owner) {
      res.status(404).json({ success: false, message: 'Owner not found' });
      return;
    }
    res.status(200).json({ success: true, data: mapToResponseDto(owner) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await ownerRepository.deleteOwner(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Owner not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Owner deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllOwners = async (req: Request, res: Response): Promise<void> => {
  try {
    const owners = await ownerRepository.findAllOwners();
    res.status(200).json({ success: true, data: owners.map(mapToResponseDto) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginOwnerDto = req.body;
    
    const owner = await ownerRepository.findOwnerByEmailWithPassword(email);
    if (!owner) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await ownerRepository.comparePassword(password, owner.password);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (!owner.isActive) {
      res.status(401).json({ success: false, message: 'Account is deactivated' });
      return;
    }

    const token = generateToken({
      ownerId: (owner._id as any).toString(),
      email: owner.email,
      accountType: owner.accountType,
      organizationId: owner.organizationId?.toString()
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        owner: mapToResponseDto(owner)
      },
      message: 'Login successful'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.owner) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const owner = await ownerRepository.findOwnerById(req.owner.ownerId);
    if (!owner) {
      res.status(404).json({ success: false, message: 'Owner not found' });
      return;
    }

    res.status(200).json({ success: true, data: mapToResponseDto(owner) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};