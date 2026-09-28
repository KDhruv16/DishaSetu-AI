import Roadmap from '../models/Roadmap.js';
import Profile from '../models/Profile.js';
import CareerAnalysis from '../models/CareerAnalysis.js';
import { generatePersonalizedRoadmap, calculateNextBestStep } from '../services/roadmapService.js';
import { normalizeSkillName, ROLE_SKILL_BENCHMARKS } from '../utils/skillNormalization.js';

// @desc    Get user's personalized career roadmap
// @route   GET /api/roadmap
// @access  Private
export const getRoadmap = async (req, res) => {
  try {
    let roadmap = await Roadmap.findOne({ user: req.user._id });

    if (!roadmap) {
      // If student has a profile and career analysis, auto-generate roadmap
      const profile = await Profile.findOne({ user: req.user._id });
      const careerAnalysis = await CareerAnalysis.findOne({
        $or: [{ userId: req.user._id }, { user: req.user._id }],
      });

      if (profile) {
        const generated = generatePersonalizedRoadmap(profile, careerAnalysis);
        roadmap = await Roadmap.create({
          user: req.user._id,
          ...generated,
        });
      }
    }

    res.status(200).json({
      success: true,
      hasRoadmap: !!roadmap,
      roadmap,
    });
  } catch (error) {
    console.error('getRoadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roadmap',
      error: error.message,
    });
  }
};

// @desc    Generate or regenerate personalized roadmap
// @route   POST /api/roadmap/generate
// @access  Private
export const generateRoadmap = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const careerAnalysis = await CareerAnalysis.findOne({
      $or: [{ userId: req.user._id }, { user: req.user._id }],
    });

    const generated = generatePersonalizedRoadmap(profile, careerAnalysis);

    let roadmap = await Roadmap.findOne({ user: req.user._id });
    if (roadmap) {
      roadmap.targetRole = generated.targetRole;
      roadmap.weeks = generated.weeks;
      roadmap.totalTasks = generated.totalTasks;
      roadmap.completedTasks = 0;
      roadmap.overallProgress = 0;
      roadmap.nextBestStep = generated.nextBestStep;
      await roadmap.save();
    } else {
      roadmap = await Roadmap.create({
        user: req.user._id,
        ...generated,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Roadmap generated successfully based on your current skill gaps',
      roadmap,
    });
  } catch (error) {
    console.error('generateRoadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate roadmap',
      error: error.message,
    });
  }
};

// @desc    Toggle roadmap task completion
// @route   PATCH /api/roadmap/task/:taskId
// @access  Private
export const toggleTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const roadmap = await Roadmap.findOne({ user: req.user._id });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found',
      });
    }

    let found = false;
    let newCompletedState = false;

    for (const week of roadmap.weeks) {
      for (const task of week.tasks) {
        if (task.taskId === taskId) {
          task.completed = !task.completed;
          task.completedAt = task.completed ? new Date() : null;
          newCompletedState = task.completed;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in roadmap',
      });
    }

    // Recalculate progress deterministically
    let completedCount = 0;
    let totalCount = 0;
    const skillTasksMap = {};

    roadmap.weeks.forEach((w) => {
      w.tasks.forEach((t) => {
        totalCount++;
        if (t.completed) completedCount++;

        const skillName = normalizeSkillName(t.skill?.trim());
        if (skillName) {
          if (!skillTasksMap[skillName]) {
            skillTasksMap[skillName] = { total: 0, completed: 0 };
          }
          skillTasksMap[skillName].total++;
          if (t.completed) skillTasksMap[skillName].completed++;
        }
      });
    });

    roadmap.totalTasks = totalCount;
    roadmap.completedTasks = completedCount;
    roadmap.overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    roadmap.nextBestStep = calculateNextBestStep(roadmap.weeks);

    await roadmap.save();

    // Propagate skill completion to Profile and CareerAnalysis
    const profile = await Profile.findOne({ user: req.user._id });
    if (profile) {
      if (!profile.skills) profile.skills = {};
      const currentSkills = (profile.skills.currentSkills || []).map((s) => normalizeSkillName(s));
      const currentLower = currentSkills.map((s) => s.toLowerCase());

      const readySkillsSet = new Set(
        (profile.skills.readyForEvaluationSkills || []).map((s) => normalizeSkillName(s))
      );
      const learningSkillsSet = new Set(
        (profile.skills.learningSkills || []).map((s) => normalizeSkillName(s))
      );

      // Evaluate each skill present in the roadmap
      Object.entries(skillTasksMap).forEach(([skill, stats]) => {
        const canonical = normalizeSkillName(skill);
        if (currentLower.includes(canonical.toLowerCase())) return;

        if (stats.completed === stats.total && stats.total > 0) {
          // All tasks for this skill in the roadmap are finished
          readySkillsSet.add(canonical);
          learningSkillsSet.delete(canonical);
        } else if (stats.completed > 0) {
          // In progress
          learningSkillsSet.add(canonical);
          readySkillsSet.delete(canonical);
        } else {
          // 0 tasks completed
          readySkillsSet.delete(canonical);
          learningSkillsSet.delete(canonical);
        }
      });

      profile.skills.readyForEvaluationSkills = Array.from(readySkillsSet).filter(Boolean);
      profile.skills.learningSkills = Array.from(learningSkillsSet).filter(Boolean);

      // Update remaining top skill gaps
      const targetRole = profile.career?.targetRole || profile.targetRole || 'Full Stack Developer';
      const benchmarkSkills = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer'] || [];

      const readyLower = Array.from(readySkillsSet).map((s) => s.toLowerCase());
      const remainingGaps = benchmarkSkills.filter(
        (b) => !currentLower.includes(b.toLowerCase()) && !readyLower.includes(b.toLowerCase())
      );

      profile.readiness.topSkillGaps = remainingGaps.slice(0, 3).map((skill, index) => ({
        name: normalizeSkillName(skill),
        priority: index === 0 ? 'High' : 'Medium',
        reason: `Crucial competency required for ${targetRole} workflows.`,
      }));

      await profile.save();

      // Update CareerAnalysis missingSkills
      const careerAnalysis = await CareerAnalysis.findOne({
        $or: [{ userId: req.user._id }, { user: req.user._id }],
      });
      if (careerAnalysis && careerAnalysis.careers?.length > 0) {
        careerAnalysis.careers[0].missingSkills = remainingGaps.map((skill, index) => ({
          skill: normalizeSkillName(skill),
          priority: index === 0 ? 'High' : 'Medium',
          reason: `Crucial competency required for ${targetRole} workflows.`,
        }));
        await careerAnalysis.save();
      }
    }

    res.status(200).json({
      success: true,
      message: newCompletedState ? 'Task marked complete' : 'Task marked incomplete',
      roadmap,
    });
  } catch (error) {
    console.error('toggleTask error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message,
    });
  }
};
