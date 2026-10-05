import OrganizationInterview from '../models/OrganizationInterview.js';
import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import { generateOpeningQuestion, generateNextInterviewQuestion, synthesizeGeminiVoice } from '../services/aiAvatarInterviewService.js';

/**
 * @desc    Get or initialize AI Avatar Interview session
 * @route   GET /api/ai-interview/session/:interviewId
 * @access  Private (Candidate or authorized organization/admin)
 */
export const getAiInterviewSession = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await OrganizationInterview.findById(interviewId)
      .populate('opportunity', 'title company organization skills description requirements')
      .populate('organization', 'name email company')
      .populate('candidate', 'name email');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    // Candidate authorization check (or admin/organization)
    const isCandidate = req.user._id.toString() === (interview.candidate?._id || interview.candidate).toString();
    const isOrg = req.user._id.toString() === (interview.organization?._id || interview.organization).toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCandidate && !isOrg && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this AI interview session.'
      });
    }

    // Ensure interview is marked as AI Interview
    if (interview.interviewType !== 'ai') {
      interview.interviewType = 'ai';
      await interview.save();
    }

    // Initialize session if questions are empty
    if (!interview.aiSession) {
      interview.aiSession = {
        startedAt: new Date(),
        currentQuestionIndex: 0,
        persona: {
          name: 'Dr. Elena Vance',
          title: 'Senior AI Technical Interviewer',
          voice: 'female-professional'
        },
        questions: []
      };
    }

    // If no questions have been generated yet, dynamically generate Question 1 with Gemini
    if (!interview.aiSession.questions || interview.aiSession.questions.length === 0) {
      const opp = interview.opportunity || {};
      const candidateName = interview.candidate?.name || 'Candidate';
      const companyName = opp.company || opp.organization || interview.organization?.name || 'the Organization';
      const jobTitle = opp.title || interview.title || 'Technical Role';
      const requiredSkills = opp.skills || [];

      const opening = await generateOpeningQuestion({
        candidateName,
        jobTitle,
        companyName,
        requiredSkills,
        jobDescription: opp.description || '',
        personaName: interview.aiSession.persona?.name || 'Dr. Elena Vance'
      });

      interview.aiSession.startedAt = interview.aiSession.startedAt || new Date();
      interview.aiSession.questions = [
        {
          questionNumber: 1,
          questionText: opening.questionText,
          askedAt: new Date()
        }
      ];
      interview.aiSession.currentQuestionIndex = 0;
      await interview.save();
    }

    // Pre-synthesize Gemini 3.8 Flash Voice for the active question
    let activeQuestionAudio = null;
    const activeQuestion = interview.aiSession.questions?.[interview.aiSession.currentQuestionIndex || 0];
    if (activeQuestion?.questionText) {
      try {
        const vResult = await synthesizeGeminiVoice(activeQuestion.questionText, 'Aoede');
        if (vResult?.success) {
          activeQuestionAudio = {
            audioBase64: vResult.audioBase64,
            mimeType: vResult.mimeType,
            voiceName: vResult.voiceName,
            model: vResult.model
          };
        }
      } catch (err) {
        console.warn('[AI Interview] Opening voice notice:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        interviewId: interview._id,
        applicationId: interview.application,
        status: interview.status,
        interviewType: interview.interviewType,
        scheduledDate: interview.scheduledDate,
        startTime: interview.startTime,
        endTime: interview.endTime,
        opportunity: interview.opportunity,
        organization: interview.organization,
        candidate: {
          _id: interview.candidate?._id || interview.candidate,
          name: interview.candidate?.name || 'Candidate',
          email: interview.candidate?.email || ''
        },
        aiSession: interview.aiSession,
        activeQuestionAudio,
        isPreview: isOrg || isAdmin
      }
    });
  } catch (error) {
    console.error('getAiInterviewSession error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving AI interview session'
    });
  }
};

/**
 * @desc    Submit candidate's spoken response and receive Gemini-generated dynamic next question
 * @route   POST /api/ai-interview/next-question
 * @access  Private (Candidate)
 */
export const submitCandidateResponseAndGetNextQuestion = async (req, res) => {
  try {
    const { interviewId, candidateResponse, currentQuestionIndex, isPreview } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: 'Interview ID is required.'
      });
    }

    const interview = await OrganizationInterview.findById(interviewId)
      .populate('opportunity', 'title company organization skills description')
      .populate('organization', 'name');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found.'
      });
    }

    const isCandidate = req.user._id.toString() === (interview.candidate?._id || interview.candidate).toString();
    const isOrg = req.user._id.toString() === (interview.organization?._id || interview.organization).toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCandidate && !isOrg && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this interview.'
      });
    }

    const isPreviewMode = Boolean(isPreview || isOrg || isAdmin);
    const questions = interview.aiSession?.questions || [];
    const activeIndex = typeof currentQuestionIndex === 'number' ? currentQuestionIndex : (questions.length - 1);

    // Save candidate's response to the active question ONLY if NOT in preview mode
    if (!isPreviewMode && questions[activeIndex]) {
      questions[activeIndex].candidateResponse = candidateResponse || '[No verbal response recorded]';
      questions[activeIndex].answeredAt = new Date();
    }

    const opp = interview.opportunity || {};
    const candidateName = isPreviewMode ? 'Preview Candidate' : (req.user.name || 'Candidate');
    const companyName = opp.company || opp.organization || interview.organization?.name || 'the Organization';
    const jobTitle = opp.title || interview.title || 'Technical Role';
    const requiredSkills = opp.skills || [];

    const TOTAL_QUESTIONS = 5;

    // Generate next question with Gemini
    const nextResult = await generateNextInterviewQuestion({
      candidateName,
      jobTitle,
      companyName,
      requiredSkills,
      conversationHistory: questions,
      latestCandidateResponse: candidateResponse || '',
      currentQuestionNumber: questions.length,
      totalPlannedQuestions: TOTAL_QUESTIONS,
      personaName: interview.aiSession?.persona?.name || 'Dr. Elena Vance'
    });

    // Synthesize Gemini Voice with gemini-3.8-flash-tts
    let voiceAudio = null;
    try {
      const vResult = await synthesizeGeminiVoice(nextResult.nextQuestion, 'Aoede');
      if (vResult?.success) {
        voiceAudio = {
          audioBase64: vResult.audioBase64,
          mimeType: vResult.mimeType,
          voiceName: vResult.voiceName,
          model: vResult.model
        };
      }
    } catch (vErr) {
      console.warn('[AI Interview] Voice synthesis notice:', vErr.message);
    }

    if (nextResult.isInterviewComplete) {
      // In real candidate mode, complete the interview
      if (!isPreviewMode) {
        interview.status = 'completed';
        interview.aiSession.completedAt = new Date();
        await interview.save();
      }

      return res.status(200).json({
        success: true,
        data: {
          nextQuestion: nextResult.nextQuestion,
          audio: voiceAudio,
          isInterviewComplete: true,
          isLastQuestion: true,
          totalQuestions: questions.length,
          questions: questions,
          isPreview: isPreviewMode
        }
      });
    }

    const newQuestionObj = {
      questionNumber: questions.length + 1,
      questionText: nextResult.nextQuestion,
      askedAt: new Date()
    };

    if (!isPreviewMode) {
      questions.push(newQuestionObj);
      interview.aiSession.questions = questions;
      interview.aiSession.currentQuestionIndex = questions.length - 1;
      await interview.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        nextQuestion: nextResult.nextQuestion,
        audio: voiceAudio,
        isInterviewComplete: false,
        isLastQuestion: nextResult.isLastQuestion,
        questionIndex: questions.length - 1,
        totalQuestions: questions.length + (isPreviewMode ? 1 : 0),
        questions: isPreviewMode ? [...questions, newQuestionObj] : interview.aiSession.questions,
        isPreview: isPreviewMode
      }
    });
  } catch (error) {
    console.error('submitCandidateResponseAndGetNextQuestion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing response with Gemini'
    });
  }
};

/**
 * @desc    Conclude / End AI Interview session
 * @route   POST /api/ai-interview/end
 * @access  Private (Candidate or Organization Preview)
 */
export const endAiInterview = async (req, res) => {
  try {
    const { interviewId, isPreview } = req.body;

    const interview = await OrganizationInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found.'
      });
    }

    const isCandidate = req.user._id.toString() === (interview.candidate?._id || interview.candidate).toString();
    const isOrg = req.user._id.toString() === (interview.organization?._id || interview.organization).toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCandidate && !isOrg && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to interview.'
      });
    }

    const isPreviewMode = Boolean(isPreview || isOrg || isAdmin);

    if (isPreviewMode) {
      return res.status(200).json({
        success: true,
        message: 'Organization preview ended successfully. Candidate interview remains unchanged.',
        data: {
          interviewId: interview._id,
          status: interview.status,
          isPreview: true
        }
      });
    }

    interview.status = 'completed';
    if (!interview.aiSession) interview.aiSession = {};
    interview.aiSession.completedAt = new Date();
    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'AI Interview successfully concluded and saved.',
      data: {
        interviewId: interview._id,
        status: interview.status,
        completedAt: interview.aiSession.completedAt,
        isPreview: false
      }
    });
  } catch (error) {
    console.error('endAiInterview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error concluding interview'
    });
  }
};

/**
 * @desc    Synthesize avatar speech using Gemini Voices API
 * @route   POST /api/ai-interview/synthesize-voice
 * @access  Private (Candidate or Organization)
 */
export const synthesizeAvatarVoice = async (req, res) => {
  try {
    const { text, voiceName = 'Aoede' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Speech text is required.'
      });
    }

    const result = await synthesizeGeminiVoice(text.trim(), voiceName);

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: {
          audioBase64: result.audioBase64,
          mimeType: result.mimeType,
          voiceName: result.voiceName,
          model: result.model
        }
      });
    }

    return res.status(200).json({
      success: false,
      fallback: 'web_speech',
      message: result.reason || 'Gemini Voice generation unavailable, use browser TTS'
    });
  } catch (error) {
    console.error('synthesizeAvatarVoice error:', error);
    return res.status(200).json({
      success: false,
      fallback: 'web_speech',
      message: 'Voice synthesis error, fallback to browser speech'
    });
  }
};

