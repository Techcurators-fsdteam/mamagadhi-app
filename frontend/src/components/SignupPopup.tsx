'use client';

import { useState } from 'react';

interface SignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupPopup({ isOpen, onClose, onSwitchToLogin }: SignupPopupProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup attempt:', formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-[8px] flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-[#4AAAFF] to-white/70 rounded-2xl p-8 w-full max-w-md mx-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
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
          <p className="text-sm text-white/90 mt-2">Create your account</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
              placeholder="john.doe@email.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35a4c9] focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
              placeholder="Confirm your password"
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 rounded border-gray-300 text-[#35a4c9] focus:ring-[#35a4c9]"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-white">
              I agree to the{' '}
              <a href="#" className="text-white font-medium hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-white font-medium hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4aaaff] text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors shadow-lg"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-white/50"></div>
          <span className="px-4 text-sm text-white">OR</span>
          <div className="flex-1 border-t border-white/50"></div>
        </div>

        {/* Login link */}
        <div className="text-center">
          <p className="text-sm text-white">
            Already have an account?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-white font-medium hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
