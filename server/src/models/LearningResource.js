import mongoose from 'mongoose';

const learningResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    skill: {
      type: String,
      required: [true, 'Skill is required'],
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    resourceType: {
      type: String,
      enum: ['Course', 'Video', 'Article', 'Documentation', 'Practice', 'Project'],
      default: 'Course',
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    platform: {
      type: String,
      default: 'DishaSetu Learning',
      trim: true,
    },
    estimatedDuration: {
      type: String,
      default: '2-4 hours',
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

const LearningResource = mongoose.model('LearningResource', learningResourceSchema);
export default LearningResource;
