import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResumeAnalysis',
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'hired', 'rejected'],
      default: 'applied',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'hired', 'rejected'],
        },
        changedAt: {
          type: Date,
          default: Date.now
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        note: {
          type: String,
          trim: true
        }
      }
    ],
    evaluation: {
      summary: String,
      strengths: [String],
      skillGaps: [String],
      experienceAnalysis: {
        level: { type: String, enum: ['strong', 'moderate', 'limited', 'not_available'] },
        evidence: String,
        details: String
      },
      resumeAlignment: {
        level: { type: String, enum: ['strong', 'moderate', 'limited', 'not_available'] },
        evidence: String,
        details: String
      },
      assessmentEvidence: {
        level: { type: String, enum: ['strong', 'moderate', 'limited', 'not_available'] },
        evidence: String,
        details: String
      },
      certificationRelevance: {
        level: { type: String, enum: ['strong', 'moderate', 'limited', 'not_available'] },
        evidence: String,
        details: String
      },
      projectRelevance: {
        level: { type: String, enum: ['strong', 'moderate', 'limited', 'not_available'] },
        evidence: String,
        details: String
      },
      areasToVerify: [String],
      evaluatedAt: Date
    }
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ candidate: 1, opportunity: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
