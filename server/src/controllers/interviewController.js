import Interview from '../models/Interview.js';
import Profile from '../models/Profile.js';
import CareerAnalysis from '../models/CareerAnalysis.js';
import { generateQuestions, evaluateStudentAnswer } from '../services/interviewService.js';
import { calculateReadinessScore } from '../services/readinessService.js';

// @desc    Start a New Mock Interview Session
// @route   POST /api/interview/start
// @access  Private
export const startInterview = async (req, res) => {
  try {
    const { role, type, difficulty } = req.body;

    const profile = await Profile.findOne({ user: req.user._id });
    const targetRole = role || profile?.career?.targetRole || 'Full Stack Developer';
    const interviewType = type || 'Technical';
    const interviewDifficulty = difficulty || 'Medium';
    const skills = profile?.skills?.currentSkills || [];

    // Generate 5 structured questions
    const questions = await generateQuestions(
      targetRole,
      interviewType,
      interviewDifficulty,
      skills
    );

    const interview = await Interview.create({
      userId: req.user._id,
      role: targetRole,
      type: interviewType,
      difficulty: interviewDifficulty,
      questions,
      currentQuestionIndex: 0,
      completed: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Interview session started',
      interview,
    });
  } catch (error) {
    console.error('Error in startInterview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start interview session. Please try again.',
    });
  }
};

// @desc    Submit Answer for a Question and Get AI Evaluation
// @route   POST /api/interview/:id/answer
// @access  Private
export const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex, studentAnswer } = req.body;

    if (!studentAnswer || !studentAnswer.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an answer before submitting.',
      });
    }

    const interview = await Interview.findOne({ _id: id, userId: req.user._id });
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    const targetQuestion = interview.questions.find(
      (q) => q.questionIndex === Number(questionIndex)
    );

    if (!targetQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this interview session.',
      });
    }

    // Run AI Evaluation on the answer
    const evaluation = await evaluateStudentAnswer(
      targetQuestion.questionText,
      studentAnswer,
      interview.role,
      interview.type,
      interview.difficulty
    );

    // Save answer and scores into question document
    targetQuestion.studentAnswer = studentAnswer.trim();
    targetQuestion.isAnswered = true;
    targetQuestion.scores = evaluation.scores;
    targetQuestion.whatWentWell = evaluation.whatWentWell;
    targetQuestion.howToImprove = evaluation.howToImprove;
    targetQuestion.betterApproach = evaluation.betterApproach;

    // Check if all 5 questions are now answered
    const allAnswered = interview.questions.every((q) => q.isAnswered);

    if (allAnswered) {
      // Calculate overall average metrics
      const totalQuestions = interview.questions.length;
      const avgTech = Math.round(
        interview.questions.reduce((acc, q) => acc + (q.scores.technicalAccuracy || 0), 0) / totalQuestions
      );
      const avgComp = Math.round(
        interview.questions.reduce((acc, q) => acc + (q.scores.completeness || 0), 0) / totalQuestions
      );
      const avgClar = Math.round(
        interview.questions.reduce((acc, q) => acc + (q.scores.clarity || 0), 0) / totalQuestions
      );
      const avgRel = Math.round(
        interview.questions.reduce((acc, q) => acc + (q.scores.relevance || 0), 0) / totalQuestions
      );
      const avgOverall = Math.round(
        interview.questions.reduce((acc, q) => acc + (q.scores.overall || 0), 0) / totalQuestions
      );

      interview.overallScore = {
        overall: avgOverall,
        breakdown: {
          technicalAccuracy: avgTech,
          completeness: avgComp,
          clarity: avgClar,
          relevance: avgRel,
        },
      };
      interview.completed = true;

      // Update Profile model and recalculate Readiness Score
      const profile = await Profile.findOne({ user: req.user._id });
      const careerAnalysis = await CareerAnalysis.findOne({ userId: req.user._id });

      if (profile && profile.readiness) {
        profile.readiness.interviewScore = avgOverall;
        const newReadiness = calculateReadinessScore(profile, careerAnalysis, avgOverall);
        profile.readiness.readinessScore = newReadiness.overall;
        await profile.save();

        if (careerAnalysis) {
          careerAnalysis.readinessScore = newReadiness;
          await careerAnalysis.save();
        }
      }
    }

    interview.currentQuestionIndex = Math.min(
      interview.questions.length - 1,
      targetQuestion.questionIndex
    );

    await interview.save();

    return res.status(200).json({
      success: true,
      interview,
      currentEvaluation: evaluation,
    });
  } catch (error) {
    console.error('Error in submitAnswer:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while evaluating your answer. Please try again.',
    });
  }
};

// @desc    Get Latest Interview
// @route   GET /api/interview/latest
// @access  Private
export const getLatestInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      interview: interview || null,
    });
  } catch (error) {
    console.error('Error in getLatestInterview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve latest interview session.',
    });
  }
};
