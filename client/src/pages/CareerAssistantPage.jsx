import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { TopHeader } from '../components/common/TopHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  ArrowRight,
  BookOpen,
  Milestone,
  FileCheck,
  Briefcase,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const CareerAssistantPage = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I am your **DishaSetu AI Career Copilot**.\n\nI have reviewed your target career path (**${
        profile?.career?.targetRole || profile?.targetRole || 'Full Stack Developer'
      }**), your verified skills, and your current roadmap sprint.\n\nHow can I help you move your career forward today?`,
      suggestedActions: [
        'What should I learn next?',
        'Why is my readiness score low?',
        'How can I improve my resume?',
        'What should I complete this week?',
      ],
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Analyzing your career context...');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const starterQuestions = [
    'What should I learn next?',
    'Why is my readiness score low?',
    'How can I improve my resume?',
    'Which skills should I prioritize?',
    'Am I ready for internships?',
    'What should I complete this week?',
  ];

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query || !query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);
    setLoadingStep('Analyzing your career context...');

    // Subtle stage animation
    setTimeout(() => {
      setLoadingStep('Building your next actionable steps...');
    }, 450);

    try {
      const res = await api.post('/career-assistant/chat', {
        message: query.trim(),
      });

      if (res.data?.success) {
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.data.reply,
          suggestedActions: res.data.suggestedActions || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(res.data?.message || 'Guidance unavailable');
      }
    } catch (err) {
      console.error('Career copilot error:', err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I encountered an issue connecting to career intelligence. Please verify your connection or try asking another question.',
        suggestedActions: ['What should I learn next?', 'Open Roadmap Sprint'],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    // Check if action corresponds to a page navigation
    const lower = action.toLowerCase();
    if (lower.includes('roadmap') || lower.includes('sprint')) {
      navigate('/roadmap');
      return;
    }
    if (lower.includes('learning') || lower.includes('course')) {
      navigate('/learning');
      return;
    }
    if (lower.includes('resume') || lower.includes('ats')) {
      navigate('/resume');
      return;
    }
    if (lower.includes('interview') || lower.includes('mock')) {
      navigate('/interview');
      return;
    }
    if (lower.includes('opportunity') || lower.includes('internship') || lower.includes('job')) {
      navigate('/opportunities');
      return;
    }
    if (lower.includes('skill') || lower.includes('matrix')) {
      navigate('/skills');
      return;
    }

    // Otherwise, treat as follow-up question
    handleSendMessage(action);
  };

  // Helper to format markdown text simply
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Process bold markers **
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx} className="text-slate-800">
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} className="font-bold text-slate-900">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col">
      <TopHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-4">
        {/* =========================================================
            HEADER
            ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                  AI Career Copilot
                </h1>
                <Badge variant="brand" size="sm">
                  Personalized Mentor
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeting: <strong className="text-slate-800">{profile?.career?.targetRole || profile?.targetRole || 'Full Stack Developer'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/roadmap')}
              className="text-xs text-slate-700"
            >
              <Milestone className="w-3.5 h-3.5 mr-1 text-brand-600" />
              My Sprint
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs text-slate-700"
            >
              Dashboard
            </Button>
          </div>
        </div>

        {/* =========================================================
            QUICK PROMPT CHIPS
            ========================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Ask:
          </span>
          {starterQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all whitespace-nowrap shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* =========================================================
            CHAT MESSAGE STREAM AREA
            ========================================================= */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-6 overflow-y-auto space-y-6 min-h-[460px] max-h-[580px]">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white shadow-xs rounded-tr-xs'
                    : 'bg-slate-50/90 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="text-xs sm:text-sm font-medium text-white leading-relaxed">
                    {msg.text}
                  </p>
                ) : (
                  <>
                    {renderFormattedText(msg.text)}

                    {/* Action chips for assistant suggestions */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-3 border-t border-slate-200/60 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Suggested Actions / Follow-ups:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedActions.map((action, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleActionClick(action)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white text-brand-700 border border-brand-200/80 hover:bg-brand-50 px-2.5 py-1 rounded-lg transition-all shadow-2xs"
                            >
                              <Sparkles className="w-3 h-3 text-brand-600" />
                              {action}
                              <ArrowRight className="w-2.5 h-2.5 text-brand-400 ml-0.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
                  <div className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  {loadingStep}
                </div>
                <p className="text-[11px] text-slate-400">
                  Cross-referencing verified skills, ATS keywords, and roadmap milestones...
                </p>
              </div>
            </motion.div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* =========================================================
            CHAT INPUT BOX
            ========================================================= */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            placeholder="Ask anything (e.g. 'What should I learn next?', 'How do I prepare for technical round?')..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-transparent focus:outline-hidden text-slate-800 placeholder-slate-400"
          />

          <Button
            type="submit"
            variant="primary"
            disabled={!inputMessage.trim() || loading}
            className="rounded-xl px-4 py-2.5 text-xs font-bold shrink-0 shadow-xs"
          >
            <span>Ask Mentor</span>
            <Send className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </form>
      </main>
    </div>
  );
};
