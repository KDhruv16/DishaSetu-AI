import Education from '../models/Education.js';
import TargetRole from '../models/TargetRole.js';
import Skill from '../models/Skill.js';
import RoleSkillMapping from '../models/RoleSkillMapping.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import RoadmapTemplate from '../models/RoadmapTemplate.js';
import LearningResource from '../models/LearningResource.js';
import PlatformSetting from '../models/PlatformSetting.js';
import { ROLE_SKILL_BENCHMARKS } from '../utils/skillNormalization.js';

// @desc    Get all active meta options for candidate onboarding & forms
// @route   GET /api/meta/options
// @access  Public
export const getMetaOptions = async (req, res) => {
  try {
    const [educations, roles, skills, mappings, platformSettings] = await Promise.all([
      Education.find({ isActive: true }).sort({ order: 1, name: 1 }),
      TargetRole.find({ isActive: true }).sort({ order: 1, name: 1 }),
      Skill.find({ isActive: true }).sort({ name: 1 }),
      RoleSkillMapping.find({ isActive: true }).sort({ order: 1, priority: 1 }),
      PlatformSetting.find(),
    ]);

    // Build role to required skills map
    const roleSkillsMap = {};
    mappings.forEach((m) => {
      if (!roleSkillsMap[m.roleName]) {
        roleSkillsMap[m.roleName] = [];
      }
      roleSkillsMap[m.roleName].push(m.skillName);
    });

    // Fallback if DB not seeded yet
    const finalRoles = roles.length > 0
      ? roles.map((r) => r.name)
      : ['Data Analyst', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'AI / ML Engineer', 'Cloud / DevOps Engineer'];

    const finalEducations = educations.length > 0
      ? educations.map((e) => ({
          name: e.name,
          category: e.category,
          specializations: e.specializations,
        }))
      : [
          { name: 'B.Tech / B.E.', category: 'Undergraduate', specializations: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Data Science', 'Artificial Intelligence'] },
          { name: 'BCA', category: 'Undergraduate', specializations: ['General Computer Applications', 'Cloud & Security', 'Data Analytics'] },
          { name: 'MCA', category: 'Postgraduate', specializations: ['Software Engineering', 'Data Science', 'Full Stack'] },
          { name: 'B.Sc (IT / CS)', category: 'Undergraduate', specializations: ['Computer Science', 'Information Technology'] },
          { name: 'MBA', category: 'Postgraduate', specializations: ['Business Analytics', 'Information Systems', 'Operations'] },
          { name: 'M.Tech', category: 'Postgraduate', specializations: ['Computer Science', 'Data Science & AI', 'Software Systems'] },
        ];

    const finalSkills = skills.length > 0
      ? skills.map((s) => s.name)
      : [
          'React', 'Node.js', 'JavaScript', 'Python', 'Java', 'SQL', 'MongoDB',
          'Git', 'HTML/CSS', 'Tailwind CSS', 'Docker', 'Testing', 'Excel',
          'PowerBI/Tableau', 'Statistics', 'Data Cleaning', 'Reporting',
        ];

    const settingsObj = {};
    platformSettings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return res.status(200).json({
      success: true,
      education: finalEducations,
      targetRoles: finalRoles,
      skills: finalSkills,
      roleSkillsMap: Object.keys(roleSkillsMap).length > 0 ? roleSkillsMap : ROLE_SKILL_BENCHMARKS,
      settings: settingsObj,
    });
  } catch (error) {
    console.error('Error in getMetaOptions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch platform options',
    });
  }
};

// @desc    Get active education degrees
// @route   GET /api/meta/education
// @access  Public
export const getActiveEducation = async (req, res) => {
  try {
    const items = await Education.find({ isActive: true }).sort({ order: 1, name: 1 });
    return res.status(200).json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch education options.' });
  }
};

// @desc    Get active target roles
// @route   GET /api/meta/roles
// @access  Public
export const getActiveRoles = async (req, res) => {
  try {
    const items = await TargetRole.find({ isActive: true }).sort({ order: 1, name: 1 });
    return res.status(200).json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch target roles.' });
  }
};

// @desc    Get active skills
// @route   GET /api/meta/skills
// @access  Public
export const getActiveSkills = async (req, res) => {
  try {
    const items = await Skill.find({ isActive: true }).sort({ name: 1 });
    return res.status(200).json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch skills.' });
  }
};
