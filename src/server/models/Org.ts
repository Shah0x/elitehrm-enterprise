import mongoose, { Schema, Document } from 'mongoose';

export interface IOrg extends Document {
  name: string;
  domain: string;
  address?: string;
  phone?: string;
  status: 'active' | 'suspended' | 'trial';
  createdAt: Date;
  updatedAt: Date;
}

const OrgSchema: Schema = new Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  address: { type: String },
  phone: { type: String },
  status: { type: String, enum: ['active', 'suspended', 'trial'], default: 'trial' },
}, { timestamps: true });

export default mongoose.models.Org || mongoose.model<IOrg>('Org', OrgSchema);
