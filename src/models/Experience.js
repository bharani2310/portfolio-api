import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null }, // null = Present
    description: { type: String },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    roles: { type: [roleSchema], default: [] },
    technologies: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Experience', experienceSchema);

