import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Step 1: About You
    personal: {
      name: { type: String, trim: true },
      college: { type: String, trim: true },
      degree: { type: String, trim: true },
      branch: { type: String, trim: true },
    },
    // Step 2: Academics
    academics: {
      semester: { type: String, trim: true },
      cgpa: { type: String, trim: true },
      graduationYear: { type: String, trim: true },
    },
    // Step 3: Career Direction
    career: {
      careerInterest: { type: String, trim: true },
      targetRole: { type: String, trim: true, default: 'Full Stack Developer' },
    },
    // Step 4: Skills & Experience
    skills: {
      currentSkills: [{ type: String, trim: true }],
      learningSkills: [{ type: String, trim: true }],
      readyForEvaluationSkills: [{ type: String, trim: true }],
      projects: [{ type: String, trim: true }],
      internships: [{ type: String, trim: true }],
      certifications: [{ type: String, trim: true }],
    },
    // Career Intelligence & Readiness Metrics
    readiness: {
      readinessScore: { type: Number, default: 0 },
      skillMatchScore: { type: Number, default: 0 },
      resumeScore: { type: Number, default: null },
      interviewScore: { type: Number, default: null },
      nextBestStep: {
        type: String,
        default: 'Improve your backend deployment skills by learning Docker & Containerization.',
      },
      topSkillGaps: [
        {
          name: { type: String },
          priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
          reason: { type: String },
        },
      ],
      journeyStatus: {
        profile: { type: String, default: 'completed' }, // completed, in-progress, pending
        careerAnalysis: { type: String, default: 'completed' },
        skillGap: { type: String, default: 'in-progress' },
        roadmap: { type: String, default: 'pending' },
        opportunities: { type: String, default: 'pending' },
        interview: { type: String, default: 'pending' },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
