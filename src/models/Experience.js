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
    // e.g. "Hybrid" | "Onsite" | "Remote"
    workplaceType: { type: String, enum: ['Hybrid', 'Onsite', 'Remote'], default: null },
    // Free-typed location, e.g. "Chennai, Tamil Nadu"
    location: { type: String, default: '' },
    // Company logo, stored as binary directly in MongoDB — same pattern
    // as Project.imageData / Profile.profileImageData.
    imageData: {
      data: Buffer,
      contentType: String,
    },
    roles: { type: [roleSchema], default: [] },
    technologies: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.image = ret.imageData?.contentType ? `/api/experience/${ret._id}/image` : null;
        delete ret.imageData;
        return ret;
      },
    },
  }
);

export default mongoose.model('Experience', experienceSchema);
