import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'employee';
  department: string;
  designation: string;
  joinDate: Date;
  status: 'active' | 'inactive' | 'remote' | 'on_leave';
  orgId?: mongoose.Types.ObjectId;
}

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'remote', 'on_leave'], default: 'active' },
  orgId: { type: Schema.Types.ObjectId, ref: 'Org' },
  refreshToken: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
