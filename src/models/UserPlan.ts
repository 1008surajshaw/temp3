import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPlan extends Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  accessToken: string;
  purchaseDate: Date;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserPlanSchema = new Schema<IUserPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'FeatureUser', required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  accessToken: { type: String, required: true, unique: true },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const UserPlan = mongoose.model<IUserPlan>('UserPlan', UserPlanSchema);