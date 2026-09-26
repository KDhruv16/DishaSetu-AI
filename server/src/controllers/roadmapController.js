import Roadmap from '../models/Roadmap.js';
import Profile from '../models/Profile.js';
import CareerAnalysis from '../models/CareerAnalysis.js';
import { generatePersonalizedRoadmap, calculateNextBestStep } from '../services/roadmapService.js';

// @desc    Get user's personalized career roadmap
// @route   GET /api/roadmap
// @access  Private
export const getRoadmap = async (req, res) => {
  try {
    let roadmap = await Roadmap.findOne({ user: req.user._id });

    if (!roadmap) {
      // If student has a profile and career analysis, auto-generate roadmap
      const profile = await Profile.findOne({ user: req.user._id });
      const careerAnalysis = await CareerAnalysis.findOne({ user: req.user._id });

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
    const careerAnalysis = await CareerAnalysis.findOne({ user: req.user._id });

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

    roadmap.weeks.forEach((w) => {
      w.tasks.forEach((t) => {
        totalCount++;
        if (t.completed) completedCount++;
      });
    });

    roadmap.totalTasks = totalCount;
    roadmap.completedTasks = completedCount;
    roadmap.overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    roadmap.nextBestStep = calculateNextBestStep(roadmap.weeks);

    await roadmap.save();

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
