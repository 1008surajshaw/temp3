import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemHealth extends Document {
  organizationId: mongoose.Types.ObjectId;
  featureId: mongoose.Types.ObjectId;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  errorRate: number;
  responseTime: number;
  uptime: number;
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SystemHealthSchema = new Schema<ISystemHealth>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  featureId: { type: Schema.Types.ObjectId, ref: 'Feature', required: true },
  status: { type: String, enum: ['HEALTHY', 'DEGRADED', 'DOWN'], default: 'HEALTHY' },
  errorRate: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 },
  uptime: { type: Number, default: 100 },
  lastChecked: { type: Date, default: Date.now }
}, {
  timestamps: true
});

SystemHealthSchema.index({ organizationId: 1, featureId: 1 }, { unique: true });

export const SystemHealth = mongoose.model<ISystemHealth>('SystemHealth', SystemHealthSchema);