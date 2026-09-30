import OrganizationProfile from '../models/OrganizationProfile.js';
import User from '../models/User.js';

// @desc    Get current organization profile
// @route   GET /api/organization/profile
// @access  Private (Organization only)
export const getOrganizationProfile = async (req, res) => {
  try {
    const profile = await OrganizationProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Organization profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching organization profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Create or update organization profile
// @route   POST /api/organization/profile
// @route   PUT /api/organization/profile
// @access  Private (Organization only)
export const upsertOrganizationProfile = async (req, res) => {
  try {
    const {
      organizationName,
      industry,
      organizationType,
      website,
      location,
      contactEmail,
      phone,
      employeeCount,
      about,
      logo,
    } = req.body;

    const profileFields = {
      user: req.user._id,
      organizationName: organizationName || req.user.name,
      industry: industry || '',
      organizationType: organizationType || '',
      website: website || '',
      location: location || '',
      contactEmail: contactEmail || req.user.email,
      phone: phone || '',
      employeeCount: employeeCount || '',
      about: about || '',
      logo: logo || '',
    };

    let profile = await OrganizationProfile.findOne({ user: req.user._id });

    if (profile) {
      // Update
      profile = await OrganizationProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
    } else {
      // Create
      profile = await OrganizationProfile.create(profileFields);
      
      // Update user onboarded status
      await User.findByIdAndUpdate(req.user._id, { isOnboarded: true });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error saving organization profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
