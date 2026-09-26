import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp, Compass, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';

export const HeroSection = () => {
  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/40 via-[#fafcff] to-[#fafcff]">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/70 text-brand-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>MP Online Hackathon 2026 • AI CareerTech</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-slate-900 leading-[1.12]">
              Know Where You Stand.{' '}
              <span className="gradient-text block mt-1">Know What Comes Next.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Your AI-powered career companion for discovering the right path, building high-demand skills, and transitioning seamlessly from campus to career.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Your Career Journey
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-amber-900 bg-amber-50/80 border-amber-300 hover:bg-amber-100 font-bold"
                >
                  <Sparkles className="w-4 h-4 mr-1.5 text-amber-600" />
                  Fast-Track Demo Profile
                </Button>
              </Link>
            </div>


            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Guesswork</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Personalized Roadmaps</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>NEP 2020 Aligned</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Animated Career Readiness Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Outer Decorative Glow Card */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-500 to-indigo-500 rounded-3xl blur opacity-20 transition duration-1000 group-hover:opacity-100"></div>

              <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-premium">
                {/* Header of preview card */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-display">Student Readiness Pulse</h4>
                      <p className="text-[11px] text-slate-400">Live AI Assessment</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/60">
                    Active
                  </span>
                </div>

                {/* Target Role & Big Readiness Score */}
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-brand-50/70 to-indigo-50/40 border border-brand-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                      Target Role
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      Full Stack Developer
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                      Top 8% Candidate Fit
                    </p>
                  </div>

                  {/* Circular Score Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-white border border-brand-200 shadow-sm flex flex-col items-center justify-center shrink-0">
                    <span className="text-xl font-extrabold font-display text-brand-600 leading-none">
                      78%
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">
                      Ready
                    </span>
                  </div>
                </div>

                {/* 3 Metric Progress Breakdown */}
                <div className="mt-5 space-y-3.5">
                  {/* Skills Match */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Skills Match</span>
                      <span className="text-brand-600">82%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-brand-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '82%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Resume Health */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Resume ATS Score</span>
                      <span className="text-indigo-600">88%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-indigo-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '88%' }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                  </div>

                  {/* Interview Readiness */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Mock Interview Score</span>
                      <span className="text-emerald-600">70%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-emerald-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '70%' }}
                        transition={{ duration: 1, delay: 0.9 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Next Step Pill */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Next: <strong>Learn Docker Basics</strong></span>
                  </div>
                  <span className="text-brand-600 font-semibold cursor-pointer hover:underline">
                    Roadmap →
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
