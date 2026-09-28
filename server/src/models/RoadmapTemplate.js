import mongoose from 'mongoose';

const taskTemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    type: { type: String, enum: ['learn', 'practice', 'project'], default: 'learn' },
    duration: { type: String, default: '1-2 days', trim: true },
  },
  { _id: true }
);

const milestoneTemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    order: { type: Number, default: 1 },
    tasks: [taskTemplateSchema],
  },
  { _id: true }
);

const roadmapTemplateSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: [true, 'Target skill is required'],
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Roadmap title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'Technical',
      trim: true,
    },
    milestones: [milestoneTemplateSchema],
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

const RoadmapTemplate = mongoose.model('RoadmapTemplate', roadmapTemplateSchema);
export default RoadmapTemplate;
