import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['CASUAL', 'SICK', 'EARNED', 'UNPAID'], default: 'CASUAL' },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  reason:    { type: String, maxlength: 500 },
  status:    { type: String, enum: ['PENDING','APPROVED','REJECTED','CANCELLED'], default: 'PENDING', index: true },
  approver:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments:  { type: String, maxlength: 500 }
}, { timestamps: true });

leaveSchema.index({ employee: 1, startDate: -1 });

export default mongoose.model('Leave', leaveSchema);
