import Hiring from '../models/Hiring.js';
import Application from '../models/Application.js';

// @desc    Create Offer / Hiring Record
// @route   POST /api/organization/hiring
// @access  Private (Organization only)
export const createOffer = async (req, res) => {
  try {
    const { applicationId, offerDetails } = req.body;

    // Verify application exists, belongs to organization, and is selected
    const application = await Application.findOne({
      _id: applicationId,
      organization: req.user._id
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
    }

    if (application.status !== 'selected' && application.status !== 'hired') {
      return res.status(400).json({ success: false, message: 'Candidate must be selected before an offer can be created.' });
    }

    // Check for duplicate offer
    let hiring = await Hiring.findOne({ application: applicationId });
    if (hiring) {
      return res.status(400).json({ success: false, message: 'An active offer already exists for this application.' });
    }

    hiring = await Hiring.create({
      application: application._id,
      candidate: application.candidate,
      organization: req.user._id,
      opportunity: application.opportunity,
      status: 'offer_sent',
      offerDetails
    });

    return res.status(201).json({ success: true, data: hiring, message: 'Offer created successfully.' });
  } catch (error) {
    console.error('createOffer error:', error);
    return res.status(500).json({ success: false, message: 'Server Error creating offer' });
  }
};

// @desc    Get Organization Hiring Records
// @route   GET /api/organization/hiring
// @access  Private (Organization only)
export const getOrganizationHiring = async (req, res) => {
  try {
    const records = await Hiring.find({ organization: req.user._id })
      .populate('candidate', 'name email')
      .populate('opportunity', 'title')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    console.error('getOrganizationHiring error:', error);
    return res.status(500).json({ success: false, message: 'Server Error fetching hiring records' });
  }
};

// @desc    Update Hiring Status (e.g., mark hired)
// @route   PATCH /api/organization/hiring/:id/status
// @access  Private (Organization only)
export const updateHiringStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const hiring = await Hiring.findOne({
      _id: req.params.id,
      organization: req.user._id
    });

    if (!hiring) {
      return res.status(404).json({ success: false, message: 'Hiring record not found or unauthorized' });
    }

    // Update Application Status if marked hired
    if (status === 'hired') {
      const application = await Application.findById(hiring.application);
      if (application) {
        application.status = 'hired';
        application.statusHistory.push({ status: 'hired', changedAt: new Date(), changedBy: req.user._id });
        await application.save();
      }
    }

    hiring.status = status;
    await hiring.save();

    return res.status(200).json({ success: true, data: hiring, message: 'Hiring status updated.' });
  } catch (error) {
    console.error('updateHiringStatus error:', error);
    return res.status(500).json({ success: false, message: 'Server Error updating status' });
  }
};

// @desc    Get Hiring Record By Application ID
// @route   GET /api/organization/hiring/application/:applicationId
// @access  Private (Organization only)
export const getHiringByApplication = async (req, res) => {
  try {
    const hiring = await Hiring.findOne({
      application: req.params.applicationId,
      organization: req.user._id
    });
    
    if (!hiring) {
      return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({ success: true, data: hiring });
  } catch (error) {
    console.error('getHiringByApplication error:', error);
    return res.status(500).json({ success: false, message: 'Server Error fetching hiring record' });
  }
};
