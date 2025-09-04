import mongoose, { Schema, Document } from 'mongoose';

export interface IUsage extends Document {
  userId: mongoose.Types.ObjectId;
  featureId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  usageCount: number;
  lastUsed: Date;
  resetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UsageSchema = new Schema<IUsage>({
  userId: { type: Schema.Types.ObjectId, ref: 'FeatureUser', required: true },
  featureId: { type: Schema.Types.ObjectId, ref: 'Feature', required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  usageCount: { type: Number, default: 0 },
  lastUsed: { type: Date, default: Date.now },
  resetDate: { type: Date, required: true }
}, {
  timestamps: true
});

UsageSchema.index({ userId: 1, featureId: 1, planId: 1 }, { unique: true });

export const Usage = mongoose.model<IUsage>('Usage', UsageSchema);