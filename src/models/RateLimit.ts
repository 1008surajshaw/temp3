import mongoose, { Schema, Document } from 'mongoose';

export interface IRateLimit extends Document {
  userId: mongoose.Types.ObjectId;
  featureId: mongoose.Types.ObjectId;
  requestCount: number;
  windowStart: Date;
  windowEnd: Date;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>({
  userId: { type: Schema.Types.ObjectId, ref: 'FeatureUser', required: true },
  featureId: { type: Schema.Types.ObjectId, ref: 'Feature', required: true },
  requestCount: { type: Number, default: 0 },
  windowStart: { type: Date, required: true },
  windowEnd: { type: Date, required: true },
  isBlocked: { type: Boolean, default: false }
}, {
  timestamps: true
});

RateLimitSchema.index({ userId: 1, featureId: 1 }, { unique: true });
RateLimitSchema.index({ windowEnd: 1 }, { expireAfterSeconds: 0 });

export const RateLimit = mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);