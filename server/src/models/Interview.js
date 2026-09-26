import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    questionText: { type: String, required: true },
    category: { type: String, default: 'Technical' },
    studentAnswer: { type: String, default: '' },
    isAnswered: { type: Boolean, default: false },
    scores: {
      technicalAccuracy: { type: Number, default: 0 },
      completeness: { type: Number, default: 0 },
      clarity: { type: Number, default: 0 },
      relevance: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },
    whatWentWell: [{ type: String }],
    howToImprove: [{ type: String }],
    betterApproach: { type: String, default: '' },
  },
  { _id: true }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Technical', 'HR', 'Mixed'],
      default: 'Technical',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    questions: [questionSchema],
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    overallScore: {
      overall: { type: Number, default: 0 },
      breakdown: {
        technicalAccuracy: { type: Number, default: 0 },
        completeness: { type: Number, default: 0 },
        clarity: { type: Number, default: 0 },
        relevance: { type: Number, default: 0 },
      },
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
