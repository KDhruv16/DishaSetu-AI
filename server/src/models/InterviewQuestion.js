import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
      index: true,
    },
    skill: {
      type: String,
      required: [true, 'Target skill is required'],
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    type: {
      type: String,
      enum: ['Technical', 'HR', 'Mixed'],
      default: 'Technical',
    },
    expectedRubric: {
      type: String,
      required: [true, 'Expected rubric / concepts are required'],
      trim: true,
    },
    evaluationGuidance: {
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

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);
export default InterviewQuestion;
