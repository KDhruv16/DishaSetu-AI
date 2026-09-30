import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const res = await register(name, email, password, role);
    setIsLoading(false);

    if (res.success) {
      if (res.user?.role === 'organization') {
        navigate('/organization/profile');
      } else {
        // New registered user goes straight to onboarding
        navigate('/onboarding');
      }
    } else {
      setError(res.message);
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
          Create your account
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Start your personalized path from campus to corporate
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
              label="Full Name"
              id="name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer p-3 border rounded-lg flex-1 border-slate-200">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                />
                Candidate
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer p-3 border rounded-lg flex-1 border-slate-200">
                <input
                  type="radio"
                  name="role"
                  value="organization"
                  checked={role === 'organization'}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                />
                Organization
              </label>
            </div>

            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="rahul@college.edu or name@gmail.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Create Password"
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
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
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
