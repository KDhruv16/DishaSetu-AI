import mongoose from 'mongoose';

const hiringSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
      unique: true // Prevent duplicate offers for same application
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
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true
    },
    status: {
      type: String,
      enum: ['pending_offer', 'offer_sent', 'accepted', 'declined', 'hired'],
      default: 'pending_offer'
    },
    offerDetails: {
      role: String,
      compensation: String,
      joiningDate: Date,
      employmentType: String,
      additionalNotes: String
    }
  },
  {
    timestamps: true
  }
);

const Hiring = mongoose.model('Hiring', hiringSchema);
export default Hiring;
