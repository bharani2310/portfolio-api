import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    description: { type: String, required: true },
    professionalSummary: { type: String },
    currentCompany: { type: String },
    location: { type: String },
    // Image is stored as binary directly in MongoDB.
    profileImageData: {
      data: Buffer,
      contentType: String,
    },
    resumeLink: { type: String },
    socialLinks: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      flattenMaps: true,
      virtuals: true,
      transform: (_doc, ret) => {
        // Public API exposes a simple image URL, never the raw binary.
        ret.profileImage = ret.profileImageData?.contentType ? '/api/profile/image' : null;
        delete ret.profileImageData;
        return ret;
      },
    },
  }
);

export default mongoose.model('Profile', profileSchema);
