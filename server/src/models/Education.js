import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Education degree name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Undergraduate',
      trim: true,
    },
    specializations: [{ type: String, trim: true }],
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
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

const Education = mongoose.model('Education', educationSchema);
export default Education;
