import mongoose from 'mongoose';

const roleSkillMappingSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      index: true,
    },
    skillName: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'High',
    },
    requiredLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
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

roleSkillMappingSchema.index({ roleName: 1, skillName: 1 }, { unique: true });

const RoleSkillMapping = mongoose.model('RoleSkillMapping', roleSkillMappingSchema);
export default RoleSkillMapping;
