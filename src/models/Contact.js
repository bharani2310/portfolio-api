import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

contactSchema.index({ email: 1, createdDate: 1 });

export default mongoose.model('Contact', contactSchema);
