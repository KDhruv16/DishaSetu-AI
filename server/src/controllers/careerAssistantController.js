import { processCareerCopilotChat } from '../services/careerAssistantService.js';

// @desc    Chat with DishaSetu AI Career Copilot
// @route   POST /api/career-assistant/chat
// @access  Private
export const chatWithCopilot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid question or message for your Career Copilot.',
      });
    }

    const result = await processCareerCopilotChat(req.user._id, message.trim());

    res.status(200).json({
      success: true,
      reply: result.reply,
      message: result.reply,
      suggestedActions: result.suggestedActions || [],
    });
  } catch (error) {
    console.error('chatWithCopilot error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process Career Copilot guidance',
    });
  }
};
