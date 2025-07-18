'use client';

import { useState } from 'react';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginPopup({ isOpen, onClose, onSwitchToSignup }: LoginPopupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-[8px] flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-[#4AAAFF] to-white/70 rounded-2xl p-8 w-full max-w-md mx-4 relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
        >
          ×
        </button>

        {/* Company Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Mamagadhi
          </h1>
          <div className="w-16 h-1 bg-white mx-auto rounded-full"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-[#35a4c9] focus:ring-[#35a4c9]"
              />
              <span className="ml-2 text-sm text-white">Remember me</span>
            </label>
            <a href="#" className="text-sm text-white hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4aaaff] text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors shadow-lg"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-white/50"></div>
          <span className="px-4 text-sm text-white">OR</span>
          <div className="flex-1 border-t border-white/50"></div>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-white">
            Don't have an account?{' '}
            <button 
              onClick={onSwitchToSignup}
              className="text-white font-medium hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
