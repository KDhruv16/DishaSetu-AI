import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    questionText: { type: String, required: true },
    category: { type: String, default: 'Technical' },
    studentAnswer: { type: String, default: '' },
    isAnswered: { type: Boolean, default: false },
    answerStatus: {
      type: String,
      enum: ['VALID', 'PARTIAL', 'INSUFFICIENT', 'UNANSWERED'],
      default: 'UNANSWERED',
    },
    isMeaningfulAnswer: { type: Boolean, default: false },
    isQuestionRestatement: { type: Boolean, default: false },
    validityReason: { type: String, default: '' },
    verdict: {
      type: String,
      enum: ['excellent', 'good', 'partial', 'needs_improvement', 'incorrect', 'unanswered'],
      default: 'unanswered',
    },
    skillEvidence: {
      type: String,
      enum: ['strong', 'moderate', 'insufficient'],
      default: 'insufficient',
    },
    scores: {
      technicalAccuracy: { type: Number, default: 0 },
      completeness: { type: Number, default: 0 },
      clarity: { type: Number, default: 0 },
      communicationClarity: { type: Number, default: 0 },
      relevance: { type: Number, default: 0 },
      depth: { type: Number, default: 0 },
      correctness: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },
    feedback: { type: String, default: '' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
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
