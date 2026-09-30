import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else if (res.user?.role === 'organization') {
        navigate('/organization');
      } else {
        if (res.user?.isOnboarded) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    } else {
      setError(res.message);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await demoLogin();
      if (res?.success) {
        navigate('/dashboard');
      } else {
        setError(res?.message || 'Failed to load demo profile.');
      }
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred during demo login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold font-display tracking-tight text-slate-900">
            DishaSetu<span className="text-brand-600">.AI</span>
          </span>
        </Link>

        <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to check your career progress and next action steps
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-6 sm:p-8 border border-slate-200/80 shadow-premium">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/70 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="you@college.edu or gmail.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Hackathon Demo Fast-Track Section */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Hackathon Evaluation Fast-Track</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Judges & evaluators: Experience the complete 9-stage career intelligence flow with 1-click synthetic demo data.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDemoLogin}
                isLoading={isLoading}
                className="w-full bg-white text-amber-900 border-amber-300 hover:bg-amber-100 font-bold text-xs shadow-2xs"
              >
                ★ Load Verified Demo Profile
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Register now
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

