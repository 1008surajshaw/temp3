import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  organizationId: mongoose.Types.ObjectId;
  featureId: mongoose.Types.ObjectId;
  date: Date;
  totalRequests: number;
  uniqueUsers: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  peakUsageHour: number;
  limitExceededCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  featureId: { type: Schema.Types.ObjectId, ref: 'Feature', required: true },
  date: { type: Date, required: true },
  totalRequests: { type: Number, default: 0 },
  uniqueUsers: { type: Number, default: 0 },
  successfulRequests: { type: Number, default: 0 },
  failedRequests: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 0 },
  peakUsageHour: { type: Number, default: 0 },
  limitExceededCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

AnalyticsSchema.index({ organizationId: 1, featureId: 1, date: 1 }, { unique: true });

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);