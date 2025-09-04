import mongoose, { Schema, Document } from 'mongoose';

export interface IFeature extends Document {
  name: string;
  description: string;
  organizationId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureSchema = new Schema<IFeature>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Feature = mongoose.model<IFeature>('Feature', FeatureSchema);