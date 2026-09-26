import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Profile from '../models/Profile.js';
import CareerAnalysis from '../models/CareerAnalysis.js';
import {
  extractTextFromPdf,
  validateResumeGate,
  analyzeResumeIntelligence,
  improveResumeContent,
} from '../services/resumeService.js';

// @desc    Upload PDF and Analyze Resume
// @route   POST /api/resume/analyze
// @access  Private
export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid PDF resume file.',
      });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF documents are accepted. Please upload a PDF file.',
      });
    }

    // Step 1: Extract text from PDF buffer
    let resumeText = '';
    try {
      resumeText = await extractTextFromPdf(req.file.buffer);
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        message: parseErr.message || 'Could not parse text from the uploaded PDF.',
      });
    }

    // Step 2: Resume Validation Gate (Strict Non-Resume Rejection)
    const gateResult = await validateResumeGate(resumeText, req.file.originalname);
    if (!gateResult.isResume) {
      return res.status(422).json({
        success: false,
        isResume: false,
        documentType: gateResult.documentType,
        detectedNonResumeType: gateResult.detectedNonResumeType,
        message: gateResult.rejectionMessage || "⚠️ This doesn't appear to be a resume/CV.",
        details:
          gateResult.rejectionDetails ||
          'Please upload a resume containing your education, skills, projects, internships, work experience, or professional profile.',
        reasoningSignals: gateResult.reasoningSignals || [],
        confidence: gateResult.confidence || 0.9,
      });
    }

    // Step 3: Get student profile and career analysis for context
    const profile = await Profile.findOne({ user: req.user._id });
    const careerAnalysis = await CareerAnalysis.findOne({ userId: req.user._id });

    const targetRole =
      careerAnalysis?.careers?.[0]?.role ||
      profile?.career?.targetRole ||
      'Full Stack Developer';

    // Step 4: Perform Resume Intelligence & ATS Scoring
    const intelligence = await analyzeResumeIntelligence(
      resumeText,
      targetRole,
      careerAnalysis,
      profile
    );

    // Save to ResumeAnalysis in MongoDB
    const resumeDoc = await ResumeAnalysis.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      targetRole,
      resumeText: resumeText.slice(0, 10000), // store parsed text
      atsScore: intelligence.atsScore,
      presentKeywords: intelligence.presentKeywords || [],
      missingKeywords: intelligence.missingKeywords || [],
      coreMissingKeywords: intelligence.coreMissingKeywords || [],
      recommendedMissingKeywords: intelligence.recommendedMissingKeywords || [],
      detectedSkills: intelligence.detectedSkills || [],
      sectionsDetected: intelligence.sectionsDetected || [],
      pageCount: intelligence.pageCount || 1,
      strengths: intelligence.strengths,
      weakAreas: intelligence.weakAreas,
      suggestions: intelligence.suggestions,
      generatedAt: new Date(),
    });

    // Sync ATS score to Profile model
    if (profile && profile.readiness) {
      profile.readiness.resumeScore = intelligence.atsScore.overall;
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      analysis: resumeDoc,
    });
  } catch (error) {
    console.error('Error in analyzeResume:', error);
    return res.status(500).json({
      success: false,
      message: "Resume analysis couldn't be completed right now. Please try again.",
    });
  }
};

// @desc    Get Latest Saved Resume Analysis
// @route   GET /api/resume/latest
// @access  Private
export const getLatestAnalysis = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      analysis: analysis || null,
    });
  } catch (error) {
    console.error('Error fetching latest resume analysis:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving resume analysis',
    });
  }
};

// @desc    Improve Bullet Point / Resume Section
// @route   POST /api/resume/improve
// @access  Private
export const improveResumeText = async (req, res) => {
  try {
    const { originalText, sectionType, targetRole } = req.body;

    if (!originalText || !originalText.trim()) {
      return res.status(400).json({
        success: false,
        isValid: false,
        message: 'Please provide text to improve.',
      });
    }

    // Retrieve user's latest resume analysis for factual context if available
    let resumeContext = null;
    if (req.user?._id) {
      const latestAnalysis = await ResumeAnalysis.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (latestAnalysis) {
        resumeContext = {
          targetRole: latestAnalysis.targetRole,
          presentKeywords: latestAnalysis.presentKeywords || [],
        };
      }
    }

    const result = await improveResumeContent(
      originalText,
      sectionType || 'Project Description',
      targetRole || 'Full Stack Developer',
      resumeContext
    );

    if (result && typeof result === 'object') {
      if (result.isValid === false) {
        return res.status(200).json({
          success: true,
          isValid: false,
          original: originalText,
          improved: null,
          validationMessage: result.validationMessage,
          example: result.example,
        });
      }

      return res.status(200).json({
        success: true,
        isValid: true,
        original: originalText,
        improved: result.improvedText,
        intent: result.intent,
        actionVerb: result.actionVerb,
      });
    }

    return res.status(200).json({
      success: true,
      isValid: true,
      original: originalText,
      improved: typeof result === 'string' ? result : result?.improvedText,
    });
  } catch (error) {
    console.error('Error in improveResumeText:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to improve resume text. Please try again.",
    });
  }
};
