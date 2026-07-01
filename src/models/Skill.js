import mongoose from 'mongoose';

const skillItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: Number, default: 80, min: 0, max: 100 },
  },
  { _id: false }
);

const skillsSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    items: { type: [skillItemSchema], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Skill', skillsSchema);
