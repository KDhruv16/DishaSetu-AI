import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill display name is required'],
      trim: true,
    },
    canonicalName: {
      type: String,
      required: [true, 'Canonical skill name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: String,
      default: 'Technical',
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillCategory',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to compute canonicalName if not explicitly provided
skillSchema.pre('validate', function (next) {
  if (this.name && !this.canonicalName) {
    this.canonicalName = this.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  next();
});

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
