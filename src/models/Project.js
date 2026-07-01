import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageData: {
      data: Buffer,
      contentType: String,
    },
    technologies: { type: [String], default: [] },
    githubLink: { type: String },
    liveLink: { type: String },
    details: { type: String },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.image = ret.imageData?.contentType ? `/api/projects/${ret._id}/image` : null;
        delete ret.imageData;
        return ret;
      },
    },
  }
);

export default mongoose.model('Project', projectSchema);
