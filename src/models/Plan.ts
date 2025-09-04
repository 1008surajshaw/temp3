import mongoose, { Schema, Document } from 'mongoose';

export interface IFeatureLimit {
  featureId: mongoose.Types.ObjectId;
  limit: number;
  isUnlimited: boolean;
}

export interface IPlan extends Document {
  name: string;
  description: string;
  organizationId: mongoose.Types.ObjectId;
  features: IFeatureLimit[];
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureLimitSchema = new Schema<IFeatureLimit>({
  featureId: { type: Schema.Types.ObjectId, ref: 'Feature', required: true },
  limit: { type: Number, default: 0 },
  isUnlimited: { type: Boolean, default: false }
}, { _id: false });

const PlanSchema = new Schema<IPlan>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  features: [FeatureLimitSchema],
  price: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);