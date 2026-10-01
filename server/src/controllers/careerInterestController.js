import CareerInterest from '../models/CareerInterest.js';

export const getCareerInterests = async (req, res) => {
  try {
    const interests = await CareerInterest.find().sort({ order: 1, name: 1 });
    res.status(200).json({ success: true, data: interests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getActiveCareerInterests = async (req, res) => {
  try {
    const interests = await CareerInterest.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.status(200).json({ success: true, data: interests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createCareerInterest = async (req, res) => {
  try {
    const { name, description, isActive, order } = req.body;
    const existing = await CareerInterest.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Career interest already exists' });
    }
    const interest = await CareerInterest.create({ name, description, isActive, order });
    res.status(201).json({ success: true, data: interest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCareerInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, order } = req.body;
    
    // allow rename but check collision
    const existing = await CareerInterest.findOne({ name, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Name already in use' });
    }

    const interest = await CareerInterest.findByIdAndUpdate(
      id,
      { name, description, isActive, order },
      { new: true, runValidators: true }
    );
    if (!interest) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.status(200).json({ success: true, data: interest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCareerInterestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const interest = await CareerInterest.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );
    if (!interest) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.status(200).json({ success: true, data: interest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteCareerInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const interest = await CareerInterest.findByIdAndDelete(id);
    if (!interest) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
