import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Compass,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'JavaScript',
  'Python',
  'Java',
  'SQL',
  'MongoDB',
  'Git',
  'HTML/CSS',
  'Tailwind CSS',
  'C++',
  'Express.js',
];

const TARGET_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'AI / ML Engineer',
  'Data Analyst',
  'Cloud / DevOps Engineer',
];

export const OnboardingPage = () => {
  const { user, saveOnboarding } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: About You
    name: user?.name || '',
    college: '',
    degree: 'B.Tech / B.E.',
    branch: 'Computer Science & Engineering',

    // Step 2: Academics
    semester: '6th Semester (Year 3)',
    cgpa: '8.2',
    graduationYear: '2026',

    // Step 3: Career
    careerInterest: 'Software Development & Web Technologies',
    targetRole: 'Full Stack Developer',

    // Step 4: Skills & Experience
    currentSkills: ['React', 'JavaScript', 'HTML/CSS', 'Git', 'Node.js', 'MongoDB'],
    customSkillInput: '',
    projectInput: 'Full Stack E-Commerce Web App',
    internshipInput: '',
    certificationInput: 'NPTEL / Swayam Web Fundamentals',
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleSkill = (skill) => {
    if (formData.currentSkills.includes(skill)) {
      setFormData({
        ...formData,
        currentSkills: formData.currentSkills.filter((s) => s !== skill),
      });
    } else {
      setFormData({
        ...formData,
        currentSkills: [...formData.currentSkills, skill],
      });
    }
  };

  const addCustomSkill = () => {
    if (
      formData.customSkillInput.trim() &&
      !formData.currentSkills.includes(formData.customSkillInput.trim())
    ) {
      setFormData({
        ...formData,
        currentSkills: [...formData.currentSkills, formData.customSkillInput.trim()],
        customSkillInput: '',
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
      personal: {
        name: formData.name,
        college: formData.college || 'MP Engineering College',
        degree: formData.degree,
        branch: formData.branch,
      },
      academics: {
        semester: formData.semester,
        cgpa: formData.cgpa,
        graduationYear: formData.graduationYear,
      },
      career: {
        careerInterest: formData.careerInterest,
        targetRole: formData.targetRole,
      },
      skills: {
        currentSkills: formData.currentSkills,
        projects: formData.projectInput ? [formData.projectInput] : [],
        internships: formData.internshipInput ? [formData.internshipInput] : [],
        certifications: formData.certificationInput ? [formData.certificationInput] : [],
      },
    };

    const res = await saveOnboarding(payload);
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  // Success Modal Animation Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#fafcff] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-premium"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mb-1">
            Career Profile Ready!
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            "Your career journey starts here."
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Calculating your Career Readiness Index...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  const stepTitles = [
    { num: 1, title: 'About You', icon: User },
    { num: 2, title: 'Academics', icon: GraduationCap },
    { num: 3, title: 'Career', icon: Compass },
    { num: 4, title: 'Skills', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-[#fafcff] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-slate-900">
              DishaSetu<span className="text-brand-600">.AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Student Profile Setup • Campus to Corporate
          </p>
        </div>

        {/* Multi-step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-3 px-1">
            <span>Step {step} of 4</span>
            <span className="text-brand-600 font-bold">{stepTitles[step - 1].title}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-brand-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content Card with Animation */}
        <Card className="p-6 sm:p-8 border border-slate-200/80 shadow-premium bg-white">
          <form onSubmit={handleNext}>
            <AnimatePresence mode="wait">
              {/* STEP 1: ABOUT YOU */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-xl font-bold font-display text-slate-900">
                      Let's start with the basics
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tell us about your background and institution.
                    </p>
                  </div>

                  <Input
                    label="Full Name"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    required
                  />

                  <Input
                    label="College / University"
                    id="college"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="e.g. UIT RGPV, MANIT Bhopal, SGSITS Indore"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Degree
                      </label>
                      <select
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      >
                        <option>B.Tech / B.E.</option>
                        <option>BCA</option>
                        <option>MCA</option>
                        <option>B.Sc (CS / IT)</option>
                        <option>Diploma / Polytechnic</option>
                        <option>Other Graduation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Branch / Stream
                      </label>
                      <select
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      >
                        <option>Computer Science & Engineering</option>
                        <option>Information Technology</option>
                        <option>Artificial Intelligence & Data Science</option>
                        <option>Electronics & Communication</option>
                        <option>Electrical Engineering</option>
                        <option>Mechanical / Civil</option>
                        <option>Non-Tech / Other</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: ACADEMICS */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-xl font-bold font-display text-slate-900">
                      Academic details
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Helps us recommend timeline-accurate roadmaps and eligibility.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Current Semester
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option>1st Semester (Year 1)</option>
                      <option>2nd Semester (Year 1)</option>
                      <option>3rd Semester (Year 2)</option>
                      <option>4th Semester (Year 2)</option>
                      <option>5th Semester (Year 3)</option>
                      <option>6th Semester (Year 3)</option>
                      <option>7th Semester (Year 4)</option>
                      <option>8th Semester (Year 4)</option>
                      <option>Recent Graduate</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="CGPA / Percentage"
                      id="cgpa"
                      type="text"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      placeholder="e.g. 8.4 or 78%"
                      required
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Graduation Year
                      </label>
                      <select
                        value={formData.graduationYear}
                        onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      >
                        <option>2025</option>
                        <option>2026</option>
                        <option>2027</option>
                        <option>2028</option>
                        <option>2029</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CAREER DIRECTION */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-xl font-bold font-display text-slate-900">
                      Your Career Ambition
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select your target role. You can update this anytime.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Target Role
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {TARGET_ROLES.map((role) => {
                        const isSelected = formData.targetRole === role;
                        return (
                          <div
                            key={role}
                            onClick={() => setFormData({ ...formData, targetRole: role })}
                            className={`p-3.5 rounded-xl border text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? 'border-brand-600 bg-brand-50/80 text-brand-800 font-semibold shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <span>{role}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Broad Career Interest
                    </label>
                    <select
                      value={formData.careerInterest}
                      onChange={(e) => setFormData({ ...formData, careerInterest: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option>Software Development & Web Technologies</option>
                      <option>Data Science, AI & Machine Learning</option>
                      <option>Cloud Computing, DevOps & Infrastructure</option>
                      <option>Government & Public Sector Tech Exams (MP Online / SSC)</option>
                      <option>Cybersecurity & Network Defense</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: SKILLS & EXPERIENCE */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-xl font-bold font-display text-slate-900">
                      Skills & Experience
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select the skills you already have hands-on experience with.
                    </p>
                  </div>

                  {/* Skill Badges */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Popular Skills (Click to select)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {POPULAR_SKILLS.map((skill) => {
                        const isSelected = formData.currentSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Skill Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add other skill (e.g. Next.js, Flutter, Docker)"
                        value={formData.customSkillInput}
                        onChange={(e) =>
                          setFormData({ ...formData, customSkillInput: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomSkill();
                          }
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addCustomSkill}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                      </Button>
                    </div>

                    {/* Selected skills preview */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {formData.currentSkills.map((sk) => (
                        <span
                          key={sk}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md border border-brand-200/60"
                        >
                          {sk}
                          <button
                            type="button"
                            onClick={() => toggleSkill(sk)}
                            className="text-brand-400 hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Key Project (Optional)"
                    id="project"
                    value={formData.projectInput}
                    onChange={(e) =>
                      setFormData({ ...formData, projectInput: e.target.value })
                    }
                    placeholder="e.g. College Management System, Weather App"
                  />

                  <Input
                    label="Certifications / Courses (Optional)"
                    id="cert"
                    value={formData.certificationInput}
                    onChange={(e) =>
                      setFormData({ ...formData, certificationInput: e.target.value })
                    }
                    placeholder="e.g. NPTEL Swayam, Coursera, Skill India"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Actions */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button type="submit" variant="primary" size="md">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                >
                  Create My Career Profile
                  <Sparkles className="w-4 h-4 ml-1.5" />
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
