import mongoose from 'mongoose';

const organizationInterviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'Technical Interview'
    },
    type: {
      type: String,
      enum: ['technical', 'hr', 'managerial', 'final'],
      default: 'technical'
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'phone'],
      default: 'online'
    },
    meetingLink: {
      type: String
    },
    location: {
      type: String
    },
    instructions: {
      type: String
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    feedback: {
      technicalKnowledge: String,
      communication: String,
      problemSolving: String,
      overallNotes: String
    },
    feedbackUpdatedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const OrganizationInterview = mongoose.model('OrganizationInterview', organizationInterviewSchema);
export default OrganizationInterview;
