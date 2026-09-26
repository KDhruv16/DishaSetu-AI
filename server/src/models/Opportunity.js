import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide opportunity title'],
      trim: true,
    },
    organization: {
      type: String,
      required: [true, 'Please provide organization name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Job', 'Internship', 'Apprenticeship', 'Government'],
      required: true,
      default: 'Internship',
    },
    category: {
      type: String,
      enum: ['Technology', 'Data', 'Engineering', 'Public Sector', 'Skill Development', 'Management'],
      default: 'Technology',
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: 'Bhopal / Hybrid',
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Hybrid',
    },
    stipendOrSalary: {
      type: String,
      default: 'Competitive / Stipend Provided',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    eligibility: {
      type: String,
      default: 'Open to B.Tech, BCA, MCA and related graduates (2025/2026/2027 batches)',
    },
    qualification: {
      type: String,
      default: 'B.Tech / B.E. / BCA / MCA / B.Sc (CS/IT)',
    },
    experience: {
      type: String,
      default: 'Fresher / Student (0-1 Years)',
    },
    deadline: {
      type: String,
      default: 'Open / Rolling Basis',
    },
    applicationUrl: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      default: 'MP Online Innovation Ecosystem',
    },
    sourceType: {
      type: String,
      default: 'curated',
    },
    isGovernment: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Opportunity = mongoose.model('Opportunity', opportunitySchema);
export default Opportunity;
