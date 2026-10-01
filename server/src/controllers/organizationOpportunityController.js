import Opportunity from '../models/Opportunity.js';
import OrganizationProfile from '../models/OrganizationProfile.js';
import Application from '../models/Application.js';

// @desc    Get all opportunities for the logged-in organization
// @route   GET /api/organization/opportunities
// @access  Private (Organization only)
export const getOrganizationOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ organizationId: req.user._id }).sort({ createdAt: -1 }).lean();
    
    const applicationCounts = await Application.aggregate([
      { $match: { organization: req.user._id } },
      { $group: { _id: '$opportunity', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    applicationCounts.forEach(app => {
      countMap[app._id.toString()] = app.count;
    });

    const opportunitiesWithCount = opportunities.map(opp => ({
      ...opp,
      applicationCount: countMap[opp._id.toString()] || 0
    }));

    return res.status(200).json({
      success: true,
      count: opportunitiesWithCount.length,
      data: opportunitiesWithCount,
    });
  } catch (error) {
    console.error('Error fetching organization opportunities:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get single opportunity for the logged-in organization
// @route   GET /api/organization/opportunities/:id
// @access  Private (Organization only)
export const getOrganizationOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findOne({
      _id: req.params.id,
      organizationId: req.user._id,
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found or you do not have permission to access it',
      });
    }

    return res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Create a new opportunity
// @route   POST /api/organization/opportunities
// @access  Private (Organization only)
export const createOpportunity = async (req, res) => {
  try {
    // Ensure the organization profile exists to get the org name
    const orgProfile = await OrganizationProfile.findOne({ user: req.user._id });
    const orgName = orgProfile ? orgProfile.organizationName : req.user.name;

    const {
      title, type, category, description, responsibilities, location, workMode,
      stipendOrSalary, skills, preferredSkills, eligibility, qualification, experience,
      deadline, applicationUrl, status
    } = req.body;

    const opportunity = await Opportunity.create({
      title,
      organization: orgName,
      organizationId: req.user._id,
      type: type || 'Job',
      category: category || 'Technology',
      description,
      responsibilities: responsibilities || '',
      location: location || '',
      workMode: workMode || 'On-site',
      stipendOrSalary: stipendOrSalary || '',
      skills: Array.isArray(skills) ? skills : [],
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : [],
      eligibility: eligibility || '',
      qualification: qualification || '',
      experience: experience || '',
      deadline: deadline || 'Open / Rolling Basis',
      applicationUrl: applicationUrl || '#',
      source: 'DishaSetu AI Platform',
      sourceType: 'direct',
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : null,
      isVerified: true,
    });

    return res.status(201).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Update opportunity
// @route   PUT /api/organization/opportunities/:id
// @access  Private (Organization only)
export const updateOpportunity = async (req, res) => {
  try {
    let opportunity = await Opportunity.findOne({
      _id: req.params.id,
      organizationId: req.user._id,
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found or you do not have permission to edit it',
      });
    }

    const {
      title, type, category, description, responsibilities, location, workMode,
      stipendOrSalary, skills, preferredSkills, eligibility, qualification, experience,
      deadline, applicationUrl, status
    } = req.body;

    // Determine publishedAt logic
    let publishedAt = opportunity.publishedAt;
    if (status === 'published' && opportunity.status !== 'published') {
      publishedAt = new Date();
    }

    opportunity = await Opportunity.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user._id },
      {
        title, type, category, description, responsibilities, location, workMode,
        stipendOrSalary, skills, preferredSkills, eligibility, qualification, experience,
        deadline, applicationUrl, status, publishedAt
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/organization/opportunities/:id
// @access  Private (Organization only)
export const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findOne({
      _id: req.params.id,
      organizationId: req.user._id,
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found or you do not have permission to delete it',
      });
    }

    await opportunity.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
