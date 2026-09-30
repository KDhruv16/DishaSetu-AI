import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'dishasetu_super_secret_jwt_key_2026_hackathon',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    let assignedRole = 'user';
    if (role === 'organization') {
      assignedRole = 'organization';
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isActive: user.isActive !== false,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc    Quick Hackathon Demo Login
// @route   POST /api/auth/demo-login
// @access  Public
export const demoLogin = async (req, res) => {
  try {
    const demoEmail = 'demo@dishasetu.ai';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const { seedDemoProfile } = await import('../seed/demoProfile.js');
      const seedRes = await seedDemoProfile();
      user = seedRes.user;
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      isDemo: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isActive: user.isActive !== false,
        isOnboarded: true,
        isDemo: true,
      },
    });
  } catch (error) {
    console.error('Demo Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error initiating demo session',
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isActive: user.isActive !== false,
        isOnboarded: user.isOnboarded,
        isDemo: user.email === 'demo@dishasetu.ai',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user details',
    });
  }
};


