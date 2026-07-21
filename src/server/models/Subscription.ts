import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  orgId: mongoose.Types.ObjectId;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  startDate: Date;
  endDate: Date;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
  orgId: { type: Schema.Types.ObjectId, ref: 'Org', required: true },
  plan: { type: String, enum: ['starter', 'professional', 'enterprise'], default: 'starter', required: true },
  status: { type: String, enum: ['active', 'inactive', 'canceled', 'past_due'], default: 'active', required: true },
  startDate: { type: Date, default: Date.now, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD', required: true },
}, { timestamps: true });

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
