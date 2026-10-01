import mongoose from 'mongoose';

const skillCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill category name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const SkillCategory = mongoose.model('SkillCategory', skillCategorySchema);
export default SkillCategory;
