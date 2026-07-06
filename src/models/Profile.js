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
    // Resume PDF, also stored as binary directly in MongoDB — replaces
    // the old resumeLink text field entirely; admins upload a file now.
    resumeFileData: {
      data: Buffer,
      contentType: String,
    },
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
        // Public API exposes simple URLs, never the raw binary.
        ret.profileImage = ret.profileImageData?.contentType ? '/api/profile/image' : null;
        ret.resumeFile = ret.resumeFileData?.contentType ? '/api/profile/resume' : null;
        delete ret.profileImageData;
        delete ret.resumeFileData;
        return ret;
      },
    },
  }
);

export default mongoose.model('Profile', profileSchema);
