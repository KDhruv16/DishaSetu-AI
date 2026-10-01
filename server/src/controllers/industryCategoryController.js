import IndustryCategory from '../models/IndustryCategory.js';
import TargetRole from '../models/TargetRole.js';

export const getIndustryCategories = async (req, res) => {
  try {
    const categories = await IndustryCategory.find().sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getActiveIndustryCategories = async (req, res) => {
  try {
    const categories = await IndustryCategory.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createIndustryCategory = async (req, res) => {
  try {
    const { name, description, isActive, displayOrder } = req.body;
    const existing = await IndustryCategory.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Industry category already exists' });
    }
    const category = await IndustryCategory.create({ name, description, isActive, displayOrder });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateIndustryCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, displayOrder } = req.body;
    
    const existing = await IndustryCategory.findOne({ name, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Name already in use' });
    }

    const category = await IndustryCategory.findByIdAndUpdate(
      id,
      { name, description, isActive, displayOrder },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateIndustryCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const category = await IndustryCategory.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteIndustryCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for references before deletion
    const category = await IndustryCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const inUseByRef = await TargetRole.exists({ categoryId: id });
    const inUseByName = await TargetRole.exists({ category: category.name });

    if (inUseByRef || inUseByName) {
      return res.status(400).json({
        success: false,
        message: 'This category is currently used by existing target roles. Deactivate it instead of deleting it.'
      });
    }

    await IndustryCategory.findByIdAndDelete(id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
