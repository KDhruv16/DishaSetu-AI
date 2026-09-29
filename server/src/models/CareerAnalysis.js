import mongoose from 'mongoose';

const missingSkillSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const careerOptionSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    matchPercentage: { type: Number, required: true, min: 0, max: 100 },
    whyItMatches: [{ type: String }],
    requiredSkills: [{ type: String }],
    missingSkills: [missingSkillSchema],
    nextStep: { type: String, required: true },
  },
  { _id: false }
);

const careerAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    careers: {
      type: [careerOptionSchema],
      validate: [
        (val) => val.length <= 3,
        'Cannot exceed 3 career recommendations',
      ],
    },
    readinessScore: {
      overall: { type: Number, default: 75 },
      breakdown: {
        technicalSkills: { type: Number, default: 70 },
        projects: { type: Number, default: 70 },
        experience: { type: Number, default: 60 },
        education: { type: Number, default: 80 },
        targetSkillCoverage: { type: Number, default: 75 },
        interviewReadiness: { type: Number, default: 50 },
      },
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    dataFingerprint: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CareerAnalysis = mongoose.model('CareerAnalysis', careerAnalysisSchema);
export default CareerAnalysis;
