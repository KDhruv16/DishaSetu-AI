import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Education from '../models/Education.js';
import TargetRole from '../models/TargetRole.js';
import Skill from '../models/Skill.js';
import RoleSkillMapping from '../models/RoleSkillMapping.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import LearningResource from '../models/LearningResource.js';
import RoadmapTemplate from '../models/RoadmapTemplate.js';
import PlatformSetting from '../models/PlatformSetting.js';
import { normalizeSkillName } from '../utils/skillNormalization.js';

// ==========================================
// 1. DASHBOARD OVERVIEW & STATS
// ==========================================
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCandidates,
      activeCandidates,
      totalRoles,
      totalSkills,
      totalQuestions,
      totalLearning,
      totalRoadmaps,
      recentCandidates,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: { $ne: 'admin' }, isActive: true }),
      TargetRole.countDocuments(),
      Skill.countDocuments(),
      InterviewQuestion.countDocuments(),
      LearningResource.countDocuments(),
      RoadmapTemplate.countDocuments(),
      User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt isOnboarded isActive'),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalCandidates,
        activeCandidates,
        totalRoles,
        totalSkills,
        totalQuestions,
        totalLearning,
        totalRoadmaps,
      },
      recentCandidates,
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics.' });
  }
};

// ==========================================
// 2. EDUCATION MANAGEMENT
// ==========================================
export const getEducationList = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Education.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Education.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getEducationList:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch education degrees.' });
  }
};

export const createEducation = async (req, res) => {
  try {
    const { name, category, specializations, description, isActive, order } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Degree name is required.' });
    }

    const existing = await Education.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An education degree with this name already exists.' });
    }

    const item = await Education.create({
      name: name.trim(),
      category: category?.trim() || 'Undergraduate',
      specializations: Array.isArray(specializations)
        ? specializations.map((s) => s.trim()).filter(Boolean)
        : typeof specializations === 'string'
        ? specializations.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      description: description?.trim() || '',
      isActive: isActive !== false,
      order: Number(order) || 0,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Education option created successfully.', item });
  } catch (error) {
    console.error('Error in createEducation:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create education option.' });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, specializations, description, isActive, order } = req.body;

    const item = await Education.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Education option not found.' });
    }

    if (name && name.trim() !== item.name) {
      const duplicate = await Education.findOne({ name: name.trim(), _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Another degree with this name already exists.' });
      }
      item.name = name.trim();
    }

    if (category !== undefined) item.category = category.trim();
    if (specializations !== undefined) {
      item.specializations = Array.isArray(specializations)
        ? specializations.map((s) => s.trim()).filter(Boolean)
        : typeof specializations === 'string'
        ? specializations.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (description !== undefined) item.description = description.trim();
    if (isActive !== undefined) item.isActive = isActive;
    if (order !== undefined) item.order = Number(order);
    item.updatedBy = req.user._id;

    await item.save();
    return res.status(200).json({ success: true, message: 'Education option updated successfully.', item });
  } catch (error) {
    console.error('Error in updateEducation:', error);
    return res.status(500).json({ success: false, message: 'Failed to update education option.' });
  }
};

export const toggleEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Education.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Education option not found.' });

    item.isActive = !item.isActive;
    item.updatedBy = req.user._id;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `Education option is now ${item.isActive ? 'Active' : 'Disabled'}.`,
      item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle education status.' });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    await Education.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Education option deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete education option.' });
  }
};

// ==========================================
// 3. TARGET ROLE MANAGEMENT
// ==========================================
export const getTargetRoles = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      TargetRole.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      TargetRole.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getTargetRoles:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch target roles.' });
  }
};

export const createTargetRole = async (req, res) => {
  try {
    const { name, category, description, isActive, order } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Target role name is required.' });
    }

    const existing = await TargetRole.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A target role with this name already exists.' });
    }

    const item = await TargetRole.create({
      name: name.trim(),
      category: category?.trim() || 'Engineering',
      description: description?.trim() || '',
      isActive: isActive !== false,
      order: Number(order) || 0,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Target role created successfully.', item });
  } catch (error) {
    console.error('Error in createTargetRole:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create target role.' });
  }
};

export const updateTargetRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, isActive, order } = req.body;

    const item = await TargetRole.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Target role not found.' });

    if (name && name.trim() !== item.name) {
      const duplicate = await TargetRole.findOne({ name: name.trim(), _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Another role with this name already exists.' });
      }
      item.name = name.trim();
    }

    if (category !== undefined) item.category = category.trim();
    if (description !== undefined) item.description = description.trim();
    if (isActive !== undefined) item.isActive = isActive;
    if (order !== undefined) item.order = Number(order);
    item.updatedBy = req.user._id;

    await item.save();
    return res.status(200).json({ success: true, message: 'Target role updated successfully.', item });
  } catch (error) {
    console.error('Error in updateTargetRole:', error);
    return res.status(500).json({ success: false, message: 'Failed to update target role.' });
  }
};

export const toggleTargetRole = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await TargetRole.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Target role not found.' });

    item.isActive = !item.isActive;
    item.updatedBy = req.user._id;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `Target role is now ${item.isActive ? 'Active' : 'Disabled'}.`,
      item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle target role status.' });
  }
};

export const deleteTargetRole = async (req, res) => {
  try {
    const { id } = req.params;
    await TargetRole.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Target role deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete target role.' });
  }
};

// ==========================================
// 4. SKILL MANAGEMENT
// ==========================================
export const getSkills = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { canonicalName: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Skill.find(query).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      Skill.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getSkills:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch skills.' });
  }
};

export const createSkill = async (req, res) => {
  try {
    const { name, category, description, isActive } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    const canonicalName = normalizeSkillName(name.trim()).toLowerCase();
    const existing = await Skill.findOne({ canonicalName });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A skill with canonical representation "${canonicalName}" already exists as "${existing.name}".`,
      });
    }

    const item = await Skill.create({
      name: name.trim(),
      canonicalName,
      category: category?.trim() || 'Technical',
      description: description?.trim() || '',
      isActive: isActive !== false,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Skill created successfully.', item });
  } catch (error) {
    console.error('Error in createSkill:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create skill.' });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, isActive } = req.body;

    const item = await Skill.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Skill not found.' });

    if (name && name.trim() !== item.name) {
      const canonicalName = normalizeSkillName(name.trim()).toLowerCase();
      const duplicate = await Skill.findOne({ canonicalName, _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Another skill with canonical representation "${canonicalName}" already exists.`,
        });
      }
      item.name = name.trim();
      item.canonicalName = canonicalName;
    }

    if (category !== undefined) item.category = category.trim();
    if (description !== undefined) item.description = description.trim();
    if (isActive !== undefined) item.isActive = isActive;
    item.updatedBy = req.user._id;

    await item.save();
    return res.status(200).json({ success: true, message: 'Skill updated successfully.', item });
  } catch (error) {
    console.error('Error in updateSkill:', error);
    return res.status(500).json({ success: false, message: 'Failed to update skill.' });
  }
};

export const toggleSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Skill.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Skill not found.' });

    item.isActive = !item.isActive;
    item.updatedBy = req.user._id;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `Skill is now ${item.isActive ? 'Active' : 'Disabled'}.`,
      item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle skill status.' });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    await Skill.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Skill deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete skill.' });
  }
};

// ==========================================
// 5. ROLE -> SKILL MAPPING
// ==========================================
export const getRoleSkillMappings = async (req, res) => {
  try {
    const { roleName, search, page = 1, limit = 50, priority } = req.query;
    const query = {};

    if (roleName) query.roleName = roleName;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { roleName: { $regex: search, $options: 'i' } },
        { skillName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      RoleSkillMapping.find(query).sort({ roleName: 1, order: 1, skillName: 1 }).skip(skip).limit(Number(limit)),
      RoleSkillMapping.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getRoleSkillMappings:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch role-skill mappings.' });
  }
};

export const createRoleSkillMapping = async (req, res) => {
  try {
    const { roleName, skillName, priority, requiredLevel, reason, isActive, order } = req.body;
    if (!roleName || !skillName) {
      return res.status(400).json({ success: false, message: 'Both Role Name and Skill Name are required.' });
    }

    const canonicalSkill = normalizeSkillName(skillName.trim());
    const existing = await RoleSkillMapping.findOne({
      roleName: roleName.trim(),
      skillName: canonicalSkill,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Skill "${canonicalSkill}" is already mapped to role "${roleName.trim()}".`,
      });
    }

    const item = await RoleSkillMapping.create({
      roleName: roleName.trim(),
      skillName: canonicalSkill,
      priority: priority || 'High',
      requiredLevel: requiredLevel || 'Intermediate',
      reason: reason?.trim() || `Core requirement for ${roleName.trim()} workflow.`,
      isActive: isActive !== false,
      order: Number(order) || 0,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Role-skill mapping created successfully.', item });
  } catch (error) {
    console.error('Error in createRoleSkillMapping:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create mapping.' });
  }
};

export const updateRoleSkillMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority, requiredLevel, reason, isActive, order } = req.body;

    const item = await RoleSkillMapping.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Mapping not found.' });

    if (priority !== undefined) item.priority = priority;
    if (requiredLevel !== undefined) item.requiredLevel = requiredLevel;
    if (reason !== undefined) item.reason = reason.trim();
    if (isActive !== undefined) item.isActive = isActive;
    if (order !== undefined) item.order = Number(order);
    item.updatedBy = req.user._id;

    await item.save();
    return res.status(200).json({ success: true, message: 'Role-skill mapping updated successfully.', item });
  } catch (error) {
    console.error('Error in updateRoleSkillMapping:', error);
    return res.status(500).json({ success: false, message: 'Failed to update mapping.' });
  }
};

export const toggleRoleSkillMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await RoleSkillMapping.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Mapping not found.' });

    item.isActive = !item.isActive;
    item.updatedBy = req.user._id;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `Mapping is now ${item.isActive ? 'Active' : 'Disabled'}.`,
      item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle mapping status.' });
  }
};

export const deleteRoleSkillMapping = async (req, res) => {
  try {
    const { id } = req.params;
    await RoleSkillMapping.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Role-skill mapping removed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete mapping.' });
  }
};

// ==========================================
// 6. INTERVIEW QUESTION BANK
// ==========================================
export const getInterviewQuestions = async (req, res) => {
  try {
    const { role, skill, difficulty, search, page = 1, limit = 20, status } = req.query;
    const query = {};

    if (role) query.role = role;
    if (skill) query.skill = skill;
    if (difficulty) query.difficulty = difficulty;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { expectedRubric: { $regex: search, $options: 'i' } },
        { skill: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      InterviewQuestion.find(query).sort({ role: 1, skill: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      InterviewQuestion.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getInterviewQuestions:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch interview questions.' });
  }
};

export const createInterviewQuestion = async (req, res) => {
  try {
    const { questionText, role, skill, difficulty, type, expectedRubric, evaluationGuidance, isActive } = req.body;
    if (!questionText || !role || !skill || !expectedRubric) {
      return res.status(400).json({
        success: false,
        message: 'Question text, Target Role, Skill, and Expected Rubric are all required.',
      });
    }

    const item = await InterviewQuestion.create({
      questionText: questionText.trim(),
      role: role.trim(),
      skill: normalizeSkillName(skill.trim()),
      difficulty: difficulty || 'Medium',
      type: type || 'Technical',
      expectedRubric: expectedRubric.trim(),
      evaluationGuidance: evaluationGuidance?.trim() || '',
      isActive: isActive !== false,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Interview question created successfully.', item });
  } catch (error) {
    console.error('Error in createInterviewQuestion:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create question.' });
  }
};

export const updateInterviewQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, role, skill, difficulty, type, expectedRubric, evaluationGuidance, isActive } = req.body;

    const item = await InterviewQuestion.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Interview question not found.' });

    if (questionText !== undefined) item.questionText = questionText.trim();
    if (role !== undefined) item.role = role.trim();
    if (skill !== undefined) item.skill = normalizeSkillName(skill.trim());
    if (difficulty !== undefined) item.difficulty = difficulty;
    if (type !== undefined) item.type = type;
    if (expectedRubric !== undefined) item.expectedRubric = expectedRubric.trim();
    if (evaluationGuidance !== undefined) item.evaluationGuidance = evaluationGuidance.trim();
    if (isActive !== undefined) item.isActive = isActive;
    item.updatedBy = req.user._id;

    await item.save();
    return res.status(200).json({ success: true, message: 'Interview question updated successfully.', item });
  } catch (error) {
    console.error('Error in updateInterviewQuestion:', error);
    return res.status(500).json({ success: false, message: 'Failed to update interview question.' });
  }
};

export const toggleInterviewQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await InterviewQuestion.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Question not found.' });

    item.isActive = !item.isActive;
    item.updatedBy = req.user._id;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `Question is now ${item.isActive ? 'Active' : 'Disabled'}.`,
      item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle question status.' });
  }
};

export const deleteInterviewQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await InterviewQuestion.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Interview question deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete interview question.' });
  }
};

// ==========================================
// 7. LEARNING CONTENT MANAGEMENT
// ==========================================
export const getLearningResources = async (req, res) => {
  try {
    const { skill, resourceType, search, page = 1, limit = 20, status } = req.query;
    const query = {};

    if (skill) query.skill = skill;
    if (resourceType) query.resourceType = resourceType;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skill: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      LearningResource.find(query).sort({ skill: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      LearningResource.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getLearningResources:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch learning resources.' });
  }
};

export const createLearningResource = async (req, res) => {
  try {
    const { title, description, skill, difficulty, resourceType, url, platform, estimatedDuration, isActive } = req.body;
    if (!title || !skill) {
      return res.status(400).json({ success: false, message: 'Title and Skill are required.' });
    }

    const item = await LearningResource.create({
      title: title.trim(),
      description: description?.trim() || '',
      skill: normalizeSkillName(skill.trim()),
      difficulty: difficulty || 'Beginner',
      resourceType: resourceType || 'Course',
      url: url?.trim() || '',
      platform: platform?.trim() || 'DishaSetu Learning',
      estimatedDuration: estimatedDuration?.trim() || '2-4 hours',
      isActive: isActive !== false,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Learning resource created successfully.', item });
  } catch (error) {
    console.error('Error in createLearningResource:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create learning resource.' });
  }
};

export const updateLearningResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, skill, difficulty, resourceType, url, platform, estimatedDuration, isActive } = req.body;

    const item = await LearningResource.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Learning resource not found.' });

    if (title !== undefined) item.title = title.trim();
    if (description !== undefined) item.description = description.trim();
    if (skill !== undefined) item.skill = normalizeSkillName(skill.trim());
    if (difficulty !== undefined) item.difficulty = difficulty;
    if (resourceType !== undefined) item.resourceType = resourceType;
    if (url !== undefined) item.url = url.trim();
    if (platform !== undefined) item.platform = platform.trim();
    if (estimatedDuration !== undefined) item.estimatedDuration = estimatedDuration.trim();
    if (isActive !== undefined) item.isActive = isActive;
    item.updatedBy = req.user._id;

    await item.save();
    return res.status(200).json({ success: true, message: 'Learning resource updated successfully.', item });
  } catch (error) {
    console.error('Error in updateLearningResource:', error);
    return res.status(500).json({ success: false, message: 'Failed to update learning resource.' });
  }
};

export const toggleLearningResource = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LearningResource.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Resource not found.' });

    item.isActive = !item.isActive;
    item.updatedBy = req.user._id;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `Resource is now ${item.isActive ? 'Active' : 'Disabled'}.`,
      item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle resource status.' });
  }
};

export const deleteLearningResource = async (req, res) => {
  try {
    const { id } = req.params;
    await LearningResource.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Learning resource deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete resource.' });
  }
};

// ==========================================
// 8. ROADMAP TEMPLATES MANAGEMENT
// ==========================================
export const getRoadmapTemplates = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, status } = req.query;
    const query = {};

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { skill: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      RoadmapTemplate.find(query).sort({ skill: 1 }).skip(skip).limit(Number(limit)),
      RoadmapTemplate.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getRoadmapTemplates:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch roadmap templates.' });
  }
};

export const createRoadmapTemplate = async (req, res) => {
  try {
    const { skill, title, description, category, milestones, isActive } = req.body;
    if (!skill || !title) {
      return res.status(400).json({ success: false, message: 'Skill and Title are required.' });
    }

    const canonicalSkill = normalizeSkillName(skill.trim());
    const existing = await RoadmapTemplate.findOne({ skill: canonicalSkill });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A roadmap template for skill "${canonicalSkill}" already exists.`,
      });
    }

    const item = await RoadmapTemplate.create({
      skill: canonicalSkill,
      title: title.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'Technical',
      milestones: Array.isArray(milestones) ? milestones : [],
      isActive: isActive !== false,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Roadmap template created successfully.', item });
  } catch (error) {
    console.error('Error in createRoadmapTemplate:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create template.' });
  }
};

export const updateRoadmapTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, milestones, isActive } = req.body;

    const item = await RoadmapTemplate.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Roadmap template not found.' });

    if (title !== undefined) item.title = title.trim();
    if (description !== undefined) item.description = description.trim();
    if (category !== undefined) item.category = category.trim();
    if (milestones !== undefined && Array.isArray(milestones)) item.milestones = milestones;
    if (isActive !== undefined) item.isActive = isActive;
    item.updatedBy = req.user._id;

    await item.save();
    return res.status(200).json({ success: true, message: 'Roadmap template updated successfully.', item });
  } catch (error) {
    console.error('Error in updateRoadmapTemplate:', error);
    return res.status(500).json({ success: false, message: 'Failed to update roadmap template.' });
  }
};

export const toggleRoadmapTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await RoadmapTemplate.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Template not found.' });

    item.isActive = !item.isActive;
    item.updatedBy = req.user._id;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `Roadmap template is now ${item.isActive ? 'Active' : 'Disabled'}.`,
      item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle template status.' });
  }
};

export const deleteRoadmapTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await RoadmapTemplate.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Roadmap template deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete template.' });
  }
};

// ==========================================
// 9. CANDIDATE / USER MANAGEMENT
// ==========================================
export const getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const query = { role: { $ne: 'admin' } };

    if (role) query['career.targetRole'] = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-password'),
      User.countDocuments(query),
    ]);

    // Attach Profile summary for each candidate
    const userIds = users.map((u) => u._id);
    const profiles = await Profile.find({ user: { $in: userIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const candidates = users.map((u) => {
      const p = profileMap[u._id.toString()];
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        isActive: u.isActive !== false,
        isOnboarded: u.isOnboarded,
        role: u.role,
        createdAt: u.createdAt,
        targetRole: p?.career?.targetRole || p?.targetRole || 'Not Set',
        degree: p?.education?.degree || 'Not Set',
        college: p?.education?.college || '',
        skillMatch: p?.readiness?.skillMatchScore ?? 0,
        readinessScore: p?.readiness?.readinessScore ?? 0,
        interviewScore: p?.readiness?.interviewScore ?? 0,
        profileCompleted: u.isOnboarded,
      };
    });

    return res.status(200).json({
      success: true,
      users: candidates,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch candidate list.' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const profile = await Profile.findOne({ user: id });

    return res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch candidate details.' });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate an administrator account.' });
    }

    user.isActive = user.isActive === false ? true : false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account is now ${user.isActive ? 'Active' : 'Deactivated'}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle user status.' });
  }
};

// ==========================================
// 10. PLATFORM SETTINGS
// ==========================================
export const getSettings = async (req, res) => {
  try {
    const settings = await PlatformSetting.find().sort({ category: 1, key: 1 });
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch platform settings.' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body; // Array of { key, value, category, description }
    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Settings must be an array.' });
    }

    for (const item of settings) {
      if (item.key) {
        await PlatformSetting.findOneAndUpdate(
          { key: item.key },
          {
            value: item.value,
            category: item.category || 'general',
            description: item.description || '',
            updatedBy: req.user._id,
          },
          { upsert: true, new: true }
        );
      }
    }

    const updated = await PlatformSetting.find().sort({ category: 1, key: 1 });
    return res.status(200).json({ success: true, message: 'Platform settings updated successfully.', settings: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update platform settings.' });
  }
};
