import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ['NPTEL', 'SWAYAM', 'Coursera', 'YouTube', 'Skill India', 'FreeCodeCamp', 'Microsoft Learn'],
      default: 'NPTEL',
    },
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner',
    },
    type: {
      type: String,
      enum: ['Course', 'Certification', 'Tutorial', 'Track'],
      default: 'Course',
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    duration: {
      type: String,
      default: '4 Weeks',
    },
    description: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      default: 'National Open Educational Repository',
    },
    certificateAvailable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
