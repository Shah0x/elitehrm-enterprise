import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'half-day';
  location?: string;
}

const AttendanceSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  status: { type: String, enum: ['present', 'absent', 'late', 'half-day'], default: 'present' },
  location: { type: String },
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
