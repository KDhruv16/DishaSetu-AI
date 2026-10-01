import ApplicationNote from '../models/ApplicationNote.js';
import Application from '../models/Application.js';

// @desc    Get notes for an application
// @route   GET /api/organization/notes/application/:applicationId
// @access  Private (Organization only)
export const getApplicationNotes = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Verify ownership of application
    const application = await Application.findOne({
      _id: applicationId,
      organization: req.user._id
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
    }

    const notes = await ApplicationNote.find({
      application: applicationId,
      organization: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: notes });
  } catch (error) {
    console.error('getApplicationNotes error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a note for an application
// @route   POST /api/organization/notes
// @access  Private (Organization only)
export const createApplicationNote = async (req, res) => {
  try {
    const { applicationId, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }

    // Verify ownership of application
    const application = await Application.findOne({
      _id: applicationId,
      organization: req.user._id
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
    }

    const note = await ApplicationNote.create({
      application: applicationId,
      organization: req.user._id,
      createdBy: req.user._id,
      content
    });

    return res.status(201).json({ success: true, data: note, message: 'Note created successfully' });
  } catch (error) {
    console.error('createApplicationNote error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
