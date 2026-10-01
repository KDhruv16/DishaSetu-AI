import Hiring from '../models/Hiring.js';
import Application from '../models/Application.js';

// @desc    Get Candidate's Offers
// @route   GET /api/candidate/hiring
// @access  Private (Candidate only)
export const getCandidateOffers = async (req, res) => {
  try {
    const offers = await Hiring.find({ candidate: req.user._id })
      .populate('organization', 'name')
      .populate('opportunity', 'title company')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    console.error('getCandidateOffers error:', error);
    return res.status(500).json({ success: false, message: 'Server Error fetching offers' });
  }
};

// @desc    Respond to an offer (Accept / Decline)
// @route   PATCH /api/candidate/hiring/:id/respond
// @access  Private (Candidate only)
export const respondToOffer = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    
    const hiring = await Hiring.findOne({
      _id: req.params.id,
      candidate: req.user._id
    });

    if (!hiring) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (hiring.status !== 'offer_sent') {
      return res.status(400).json({ success: false, message: 'Offer cannot be responded to at this stage.' });
    }

    if (action === 'accept') {
      hiring.status = 'accepted';
    } else if (action === 'decline') {
      hiring.status = 'declined';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await hiring.save();

    return res.status(200).json({ success: true, data: hiring, message: `Offer ${action}ed successfully.` });
  } catch (error) {
    console.error('respondToOffer error:', error);
    return res.status(500).json({ success: false, message: 'Server Error responding to offer' });
  }
};
