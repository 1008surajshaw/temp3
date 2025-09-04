import mongoose, { Schema, Document } from 'mongoose';

export interface IOwner extends Document {
  name: string;
  email: string;
  password: string;
  accountType: 'superadmin' | 'admin';
  organizationId?: mongoose.Types.ObjectId;
  organizationCreated: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OwnerSchema = new Schema<IOwner>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountType: { type: String, enum: ['superadmin', 'admin'], required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  organizationCreated: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Owner = mongoose.model<IOwner>('Owner', OwnerSchema);