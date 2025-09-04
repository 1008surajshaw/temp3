import mongoose, { Schema, Document } from 'mongoose';

export interface IFeatureUser extends Document {
  name: string;
  email: string;
  featureId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  accessToken: string;
  isActive: boolean;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureUserSchema = new Schema<IFeatureUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  featureId: { type: Schema.Types.ObjectId, ref: 'Feature', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  accessToken: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  lastUsed: { type: Date, default: Date.now }
}, {
  timestamps: true
});

FeatureUserSchema.index({ email: 1, featureId: 1 }, { unique: true });

export const FeatureUser = mongoose.model<IFeatureUser>('FeatureUser', FeatureUserSchema);