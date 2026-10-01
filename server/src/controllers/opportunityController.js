import mongoose from 'mongoose';
import Opportunity from '../models/Opportunity.js';
import Profile from '../models/Profile.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Interview from '../models/Interview.js';
import {
  calculateOpportunityMatch,
  calculateApplicationReadiness,
} from '../services/matchingService.js';

// @desc    Get all opportunities with optional filters & personalized match score
// @route   GET /api/opportunities
// @access  Private
export const getOpportunities = async (req, res) => {
  try {
    const { type, category, location } = req.query;

    const query = {
      $or: [
        { status: 'published' },
        { status: { $exists: false } }
      ]
    };
    
    if (type && type !== 'All') {
      query.type = type;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    const opportunities = await Opportunity.find(query).sort({ createdAt: -1 });

    // Fetch user profile if available for deterministic match scoring
    let profile = null;
    if (req.user) {
      profile = await Profile.findOne({ user: req.user._id });
    }

    const decorated = opportunities.map((opp) => {
      const matchData = calculateOpportunityMatch(opp, profile);
      return {
        ...opp.toObject(),
        matchPercentage: matchData.matchPercentage,
        overallMatch: matchData.overallMatch,
        skillMatch: matchData.skillMatch,
        roleMatch: matchData.roleMatch,
        educationMatch: matchData.educationMatch,
        experienceMatch: matchData.experienceMatch,
        matchedSkills: matchData.matchedSkills,
        missingSkills: matchData.missingSkills,
        reasons: matchData.reasons,
        missingReasons: matchData.missingReasons,
        whyItMatches: matchData.whyItMatches,
        breakdown: matchData.breakdown,
      };
    });

    // If student has a profile, sort decorated by match percentage descending
    if (profile) {
      decorated.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    res.status(200).json({
      success: true,
      count: decorated.length,
      hasProfile: !!(profile && profile.targetRole),
      data: decorated,
    });
  } catch (error) {
    console.error('getOpportunities error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunities',
    });
  }
};

// @desc    Get top recommended opportunities for the authenticated student
// @route   GET /api/opportunities/recommended
// @access  Private
export const getRecommendedOpportunities = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const opportunities = await Opportunity.find({
      $or: [
        { status: 'published' },
        { status: { $exists: false } }
      ]
    });

    const matched = opportunities.map((opp) => {
      const matchData = calculateOpportunityMatch(opp, profile);
      return {
        ...opp.toObject(),
        matchPercentage: matchData.matchPercentage,
        overallMatch: matchData.overallMatch,
        skillMatch: matchData.skillMatch,
        roleMatch: matchData.roleMatch,
        educationMatch: matchData.educationMatch,
        experienceMatch: matchData.experienceMatch,
        matchedSkills: matchData.matchedSkills,
        missingSkills: matchData.missingSkills,
        reasons: matchData.reasons,
        missingReasons: matchData.missingReasons,
        whyItMatches: matchData.whyItMatches,
        breakdown: matchData.breakdown,
      };
    });

    // Sort by match percentage descending
    matched.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Pick top 4 recommended
    const topRecommended = matched.slice(0, 4);

    res.status(200).json({
      success: true,
      count: topRecommended.length,
      hasProfile: !!(profile && profile.targetRole),
      targetRole: profile?.targetRole || null,
      data: topRecommended,
    });
  } catch (error) {
    console.error('getRecommendedOpportunities error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
    });
  }
};

// @desc    Get single opportunity by ID with personalized match & application readiness
// @route   GET /api/opportunities/:id
// @access  Private
export const getOpportunityById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID format',
      });
    }

    const opportunity = await Opportunity.findOne({
      _id: req.params.id,
      $or: [
        { status: 'published' },
        { status: { $exists: false } }
      ]
    });
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found or not available',
      });
    }

    const [profile, resumeAnalysis, interviewAnalysis] = await Promise.all([
      Profile.findOne({ user: req.user._id }),
      ResumeAnalysis.findOne({ userId: req.user._id }).sort({ createdAt: -1 }),
      Interview.findOne({ userId: req.user._id }).sort({ createdAt: -1 }),
    ]);

    const matchData = calculateOpportunityMatch(opportunity, profile);
    const readinessData = calculateApplicationReadiness(
      opportunity,
      profile,
      resumeAnalysis,
      interviewAnalysis
    );

    const opportunityObj = opportunity.toObject();

    const responsePayload = {
      ...opportunityObj,
      matchPercentage: matchData.matchPercentage,
      overallMatch: matchData.overallMatch,
      skillMatch: matchData.skillMatch,
      roleMatch: matchData.roleMatch,
      educationMatch: matchData.educationMatch,
      experienceMatch: matchData.experienceMatch,
      matchedSkills: matchData.matchedSkills,
      missingSkills: matchData.missingSkills,
      reasons: matchData.reasons,
      missingReasons: matchData.missingReasons,
      whyItMatches: matchData.whyItMatches,
      breakdown: matchData.breakdown,
      match: {
        overallMatch: matchData.overallMatch,
        skillMatch: matchData.skillMatch,
        roleMatch: matchData.roleMatch,
        educationMatch: matchData.educationMatch,
        experienceMatch: matchData.experienceMatch,
        matchedSkills: matchData.matchedSkills,
        missingSkills: matchData.missingSkills,
        reasons: matchData.reasons,
        missingReasons: matchData.missingReasons,
      },
      applicationReadiness: {
        score: readinessData.score,
        status: readinessData.status,
        canApplyNow: readinessData.canApplyNow,
        factors: readinessData.factors,
      },
      preparationSteps: readinessData.preparationSteps,
    };

    res.status(200).json({
      success: true,
      opportunity: opportunityObj,
      match: responsePayload.match,
      applicationReadiness: responsePayload.applicationReadiness,
      preparationSteps: responsePayload.preparationSteps,
      data: responsePayload,
    });
  } catch (error) {
    console.error('getOpportunityById error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunity details',
    });
  }
};

