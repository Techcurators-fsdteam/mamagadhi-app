'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { updateUserProfile } from '../../lib/supabase';
import { sendEmailVerification, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    phone: '',
    role: 'passenger' as 'driver' | 'passenger' | 'both'
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Initialize form data when userProfile is loaded
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        display_name: userProfile.display_name,
        phone: userProfile.phone,
        role: userProfile.role
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user || !userProfile) return;

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      // Update display name in Firebase
      await updateFirebaseProfile(user, {
        displayName: formData.display_name
      });

      // Update profile in Supabase
      await updateUserProfile(user.uid, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
        phone: formData.phone,
        role: formData.role
      });

      setMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailVerification = async () => {
    if (!user) return;

    setIsVerifyingEmail(true);
    setError('');
    setMessage('');

    try {
      await sendEmailVerification(user);
      setMessage('Verification email sent! Please check your inbox and spam folder.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      setError('Failed to send verification email. Please try again.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        display_name: userProfile.display_name,
        phone: userProfile.phone,
        role: userProfile.role
      });
    }
    setIsEditing(false);
    setError('');
    setMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4AAAFF]"></div>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Manage your account information and preferences</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#4AAAFF] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#4AAAFF] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
              {message}
            </div>
          )}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <div className="flex items-center mt-1">
                    {userProfile.is_phone_verified ? (
                      <span className="text-green-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="text-amber-600 text-sm">Not verified</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="passenger">Passenger (Book rides)</option>
                    <option value="driver">Driver (Offer rides)</option>
                    <option value="both">Both (Book & Offer rides)</option>
                  </select>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      {user.emailVerified ? (
                        <span className="text-green-600 text-sm flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span className="text-amber-600 text-sm">Not verified</span>
                      )}
                    </div>
                    {!user.emailVerified && (
                      <button
                        onClick={handleEmailVerification}
                        disabled={isVerifyingEmail}
                        className="text-[#4AAAFF] text-sm hover:underline disabled:opacity-50"
                      >
                        {isVerifyingEmail ? 'Sending...' : 'Send verification email'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

