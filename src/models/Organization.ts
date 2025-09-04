import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'Owner', required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);