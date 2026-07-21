import mongoose, { Schema, Document } from 'mongoose';

export interface ILeave extends Document {
  userId: mongoose.Types.ObjectId;
  leaveType: 'sick' | 'casual' | 'vacation' | 'other';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
}

const LeaveSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: String, enum: ['sick', 'casual', 'vacation', 'other'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);
