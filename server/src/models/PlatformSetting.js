import mongoose from 'mongoose';

const platformSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Setting value is required'],
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
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

const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);
export default PlatformSetting;
