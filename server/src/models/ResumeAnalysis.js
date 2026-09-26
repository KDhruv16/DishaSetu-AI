import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
    },
    targetRole: {
      type: String,
      required: true,
    },
    resumeText: {
      type: String,
      required: true,
    },
    atsScore: {
      overall: { type: Number, required: true, min: 0, max: 100 },
      breakdown: {
        keywordMatch: { type: Number, default: 75 },
        sectionCompleteness: { type: Number, default: 80 },
        formattingAndClarity: { type: Number, default: 85 },
        projectAndExperience: { type: Number, default: 70 },
      },
    },
    presentKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    coreMissingKeywords: [{ type: String }],
    recommendedMissingKeywords: [{ type: String }],
    detectedSkills: [
      {
        name: { type: String },
        category: { type: String },
        evidence: { type: String },
      },
    ],
    sectionsDetected: [
      {
        name: { type: String },
        found: { type: Boolean },
      },
    ],
    pageCount: {
      type: Number,
      default: 1,
    },
    strengths: [{ type: String }],
    weakAreas: [{ type: String }],
    suggestions: [{ type: String }],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
export default ResumeAnalysis;
