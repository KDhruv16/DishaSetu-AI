import Interview from '../models/Interview.js';
import Profile from '../models/Profile.js';
import CareerAnalysis from '../models/CareerAnalysis.js';
import { generateQuestions, evaluateStudentAnswer } from '../services/interviewService.js';
import { calculateReadinessScore } from '../services/readinessService.js';
import { normalizeSkillName, ROLE_SKILL_BENCHMARKS } from '../utils/skillNormalization.js';
import { evaluateLocalFallback } from '../services/interviewEvaluator.js';

// @desc    Start a New Mock Interview Session
// @route   POST /api/interview/start
// @access  Private
export const startInterview = async (req, res) => {
  try {
    const { role, type, difficulty } = req.body;

    const profile = await Profile.findOne({ user: req.user._id });
    const targetRole = role || profile?.career?.targetRole || profile?.targetRole || 'Full Stack Developer';
    const interviewType = type || 'Technical';
    const interviewDifficulty = difficulty || 'Medium';

    const currentSkills = (profile?.skills?.currentSkills || []).map((s) => normalizeSkillName(s));
    const readySkills = (profile?.skills?.readyForEvaluationSkills || []).map((s) => normalizeSkillName(s));
    const allRelevantSkills = Array.from(new Set([...currentSkills, ...readySkills]));

    // Generate 5 structured questions tailored to target role and candidate skills
    const questions = await generateQuestions(
      targetRole,
      interviewType,
      interviewDifficulty,
      allRelevantSkills,
      readySkills
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

    // Run AI / Gemini Evaluation on the actual student answer
    let evaluation;
    let evaluationSource = 'gemini';
    try {
      evaluation = await evaluateStudentAnswer(
        targetQuestion.questionText,
        studentAnswer,
        interview.role,
        interview.type,
        interview.difficulty,
        targetQuestion.category
      );
    } catch (evalError) {
      console.warn('Gemini Evaluation failed, using local fallback:', evalError.message);
      // Fallback to local evaluation
      evaluation = evaluateLocalFallback(targetQuestion.questionText, studentAnswer);
      evaluationSource = 'local_fallback';
    }

    // Save actual answer and granular evaluation into question document
    targetQuestion.studentAnswer = studentAnswer.trim();
    targetQuestion.isAnswered = true;
    targetQuestion.answerStatus = (evaluation.answerStatus || (evaluation.score === 0 ? 'INSUFFICIENT' : 'VALID')).toUpperCase();
    targetQuestion.isMeaningfulAnswer = evaluation.isMeaningfulAnswer !== undefined ? evaluation.isMeaningfulAnswer : (evaluation.score > 0);
    targetQuestion.isQuestionRestatement = evaluation.isQuestionRestatement === true;
    targetQuestion.validityReason = evaluation.validityReason || '';
    targetQuestion.verdict = (evaluation.verdict || 'unanswered').toLowerCase();
    targetQuestion.skillEvidence = (evaluation.skillEvidence || 'insufficient').toLowerCase();
    targetQuestion.feedback = evaluation.feedback || '';
    targetQuestion.scores = evaluation.scores || {
      technicalAccuracy: evaluation.score || 0,
      completeness: evaluation.score || 0,
      clarity: evaluation.score || 0,
      communicationClarity: evaluation.score || 0,
      relevance: evaluation.score || 0,
      depth: evaluation.score || 0,
      correctness: evaluation.score || 0,
      overall: evaluation.score || 0,
    };
    targetQuestion.strengths = evaluation.strengths || [];
    targetQuestion.weaknesses = evaluation.weaknesses || [];
    targetQuestion.whatWentWell = evaluation.whatWentWell || evaluation.strengths || [];
    targetQuestion.howToImprove = evaluation.howToImprove || [];
    targetQuestion.betterApproach = evaluation.betterApproach || '';

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

      // Update Profile model and perform per-skill evidence evaluation
      const profile = await Profile.findOne({ user: req.user._id });
      const careerAnalysis = await CareerAnalysis.findOne({
        $or: [{ userId: req.user._id }, { user: req.user._id }],
      });

      if (profile && profile.readiness) {
        profile.readiness.interviewScore = avgOverall;

        const targetRole = profile.career?.targetRole || profile.targetRole || interview.role || 'Full Stack Developer';
        const benchmarkSkills = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer'] || [];

        // 1. Group questions by assessed canonical skill and evaluate evidence
        const skillScoresMap = {};
        interview.questions.forEach((q) => {
          const canonicalSkill = normalizeSkillName(q.category);
          if (canonicalSkill && canonicalSkill !== 'Technical' && canonicalSkill !== 'HR' && canonicalSkill !== 'Mixed') {
            if (!skillScoresMap[canonicalSkill]) {
              skillScoresMap[canonicalSkill] = { totalScore: 0, count: 0 };
            }
            skillScoresMap[canonicalSkill].totalScore += (q.scores?.overall || 0);
            skillScoresMap[canonicalSkill].count += 1;
          }
        });

        const newlyPromotedSkills = new Set();

        // 2. Promote any evaluated skill with sufficient evidence (average score >= 60)
        Object.entries(skillScoresMap).forEach(([skill, stats]) => {
          const avgSkillScore = Math.round(stats.totalScore / stats.count);
          if (avgSkillScore >= 60) {
            newlyPromotedSkills.add(skill);
          }
        });

        // 3. If candidate scored high overall (>= 70) and had completed roadmap skills in readyForEvaluationSkills, promote them too
        if (avgOverall >= 70 && Array.isArray(profile.skills?.readyForEvaluationSkills)) {
          profile.skills.readyForEvaluationSkills.forEach((s) => {
            const canonical = normalizeSkillName(s);
            if (canonical) newlyPromotedSkills.add(canonical);
          });
        }

        // 4. Update Profile skills state
        const currentSet = new Set((profile.skills.currentSkills || []).map((s) => normalizeSkillName(s)));
        newlyPromotedSkills.forEach((s) => currentSet.add(s));

        profile.skills.currentSkills = Array.from(currentSet).filter(Boolean);
        profile.skills.readyForEvaluationSkills = (profile.skills.readyForEvaluationSkills || [])
          .map((s) => normalizeSkillName(s))
          .filter((s) => !currentSet.has(s));
        profile.skills.learningSkills = (profile.skills.learningSkills || [])
          .map((s) => normalizeSkillName(s))
          .filter((s) => !currentSet.has(s));

        // 5. Recalculate Skill Match Score
        const currentLower = Array.from(currentSet).map((s) => s.toLowerCase());
        const matchedCount = benchmarkSkills.filter((b) => currentLower.includes(b.toLowerCase())).length;
        const newSkillMatch = benchmarkSkills.length > 0
          ? Math.round((matchedCount / benchmarkSkills.length) * 100)
          : 60;
        profile.readiness.skillMatchScore = newSkillMatch;

        // 6. Recalculate remaining gaps
        const remaining = benchmarkSkills.filter((b) => !currentLower.includes(b.toLowerCase()));
        profile.readiness.topSkillGaps = remaining.slice(0, 3).map((skill, index) => ({
          name: skill,
          priority: index === 0 ? 'High' : 'Medium',
          reason: `Crucial competency required for ${targetRole} workflows.`,
        }));

        // 7. Sync to CareerAnalysis
        if (careerAnalysis && careerAnalysis.careers?.length > 0) {
          careerAnalysis.careers[0].matchPercentage = newSkillMatch;
          careerAnalysis.careers[0].missingSkills = remaining.map((skill, index) => ({
            skill,
            priority: index === 0 ? 'High' : 'Medium',
            reason: `Crucial competency required for ${targetRole} workflows.`,
          }));
        }

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
      evaluationSource,
      interview,
      currentEvaluation: evaluation,
    });
  } catch (error) {
    console.error('Error in submitAnswer:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while evaluating your answer. Please try again.',
      errorStack: error.stack,
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
