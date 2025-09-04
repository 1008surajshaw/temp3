import mongoose, { Schema, Document } from 'mongoose';

export interface ICircuitBreaker extends Document {
  featureId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: Date;
  nextAttemptTime: Date;
  successCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CircuitBreakerSchema = new Schema<ICircuitBreaker>({
  featureId: { type: Schema.Types.ObjectId, ref: 'Feature', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  state: { type: String, enum: ['CLOSED', 'OPEN', 'HALF_OPEN'], default: 'CLOSED' },
  failureCount: { type: Number, default: 0 },
  lastFailureTime: { type: Date },
  nextAttemptTime: { type: Date },
  successCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

CircuitBreakerSchema.index({ featureId: 1, organizationId: 1 }, { unique: true });

export const CircuitBreaker = mongoose.model<ICircuitBreaker>('CircuitBreaker', CircuitBreakerSchema);