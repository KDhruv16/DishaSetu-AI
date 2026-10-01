import SkillCategory from '../models/SkillCategory.js';
import Skill from '../models/Skill.js';

export const getSkillCategories = async (req, res) => {
  try {
    const categories = await SkillCategory.find().sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch skill categories' });
  }
};

export const getActiveSkillCategories = async (req, res) => {
  try {
    const categories = await SkillCategory.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch active skill categories' });
  }
};

export const createSkillCategory = async (req, res) => {
  try {
    const { name, description, displayOrder, isActive } = req.body;
    
    const existing = await SkillCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Skill category with this name already exists' });
    }

    const category = await SkillCategory.create({
      name,
      description,
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
    });
    
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create skill category' });
  }
};

export const updateSkillCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder, isActive } = req.body;
    
    const category = await SkillCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Skill category not found' });
    }

    if (name && name !== category.name) {
      const existing = await SkillCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Skill category with this name already exists' });
      }
    }

    category.name = name || category.name;
    if (description !== undefined) category.description = description;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update skill category' });
  }
};

export const deleteSkillCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await SkillCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Skill category not found' });
    }

    // Prevent deletion if used by Skills
    const inUse = await Skill.exists({
      $or: [
        { categoryId: id },
        { category: category.name }
      ]
    });

    if (inUse) {
      return res.status(400).json({ 
        success: false, 
        message: 'This category is currently used by existing skills. Deactivate it instead of deleting it.' 
      });
    }

    await SkillCategory.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: 'Skill category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete skill category' });
  }
};

export const toggleSkillCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const category = await SkillCategory.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Skill category not found' });
    }
    
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update skill category status' });
  }
};
