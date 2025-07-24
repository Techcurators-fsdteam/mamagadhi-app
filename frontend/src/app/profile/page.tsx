'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '../../lib/auth';
import { updateUserProfile } from '../../lib/supabase';
import { sendEmailVerification, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';
import Footer from '../../components/Footer';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  // All hooks at the top
  const router = useRouter();
  const { user, loading } = useAuth();
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

  // Driver profile state
  const [driverData, setDriverData] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    phone: '',
    role: 'driver' as 'driver' | 'passenger' | 'both'
  });
  const [drivingLicenceFile, setDrivingLicenceFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  // Upload status
  const [dlUploadStatus, setDlUploadStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle');
  const [idUploadStatus, setIdUploadStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle');
  const [photoUploadStatus, setPhotoUploadStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle');
  // Driver verification (for testing)
  const [driverVerified, setDriverVerified] = useState(false);
  const [driverProfile, setDriverProfile] = useState<unknown>(null);
  const [userProfile, setUserProfile] = useState<unknown>(null);

  // Fetch driver_profiles on load and after upload
  useEffect(() => {
    const fetchDriverProfile = async () => {
      if (user?.uid) {
        const { data } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('user_profile_id', user.uid)
          .single();
        setDriverProfile(data);
      }
    };
    fetchDriverProfile();
  }, [user]);

  useEffect(() => {
    const flag = typeof window !== 'undefined' ? localStorage.getItem('driverVerified') : null;
    setDriverVerified(flag === 'true');
  }, []);
  const handleToggleDriverVerified = () => {
    const newVal = !driverVerified;
    setDriverVerified(newVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('driverVerified', newVal ? 'true' : 'false');
    }
  };

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
        first_name: (userProfile as { [key: string]: unknown }).first_name as string,
        last_name: (userProfile as { [key: string]: unknown }).last_name as string,
        display_name: (userProfile as { [key: string]: unknown }).display_name as string,
        phone: (userProfile as { [key: string]: unknown }).phone as string,
        role: (userProfile as { [key: string]: unknown }).role as 'driver' | 'passenger' | 'both'
      });
      setDriverData({
        first_name: (userProfile as { [key: string]: unknown }).first_name as string,
        last_name: (userProfile as { [key: string]: unknown }).last_name as string,
        display_name: (userProfile as { [key: string]: unknown }).display_name as string,
        phone: (userProfile as { [key: string]: unknown }).phone as string,
        role: ((userProfile as { [key: string]: unknown }).role as string) === 'driver' ? 'driver' : 'both'
      });
      if (userProfile && typeof (userProfile as { [key: string]: unknown }).photo_url === 'string' && (userProfile as { [key: string]: unknown }).photo_url) {
        setPhotoPreview((userProfile as { [key: string]: unknown }).photo_url as string);
      } else {
        setPhotoPreview(null);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.uid)
          .single();
        setUserProfile(data);
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Removed unused handleDriverInputChange

  // Helper to upload a file to R2 using pre-signed URL and update DB
  const uploadDocument = async (file: File, documentType: 'profile' | 'dl' | 'id') => {
    if (!user) return { success: false, url: '' };
    const uuid = uuidv4();
    // Step 1: Get pre-signed URL
    const urlRes = await fetch('/api/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.uid,
        document_type: documentType,
        uuid,
        filetype: file.type,
      }),
    });
    const urlData = await urlRes.json();
    if (!urlData.uploadUrl) return { success: false, error: urlData.error };
    // Step 2: Upload file to R2
    const putRes = await fetch(urlData.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!putRes.ok) return { success: false, error: 'Failed to upload to R2' };
    // Step 3: Record in DB
    const dbRes = await fetch('/api/upload-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.uid,
        document_type: documentType,
        publicUrl: urlData.publicUrl,
      }),
    });
    const dbData = await dbRes.json();
    if (!dbData.success) return { success: false, error: dbData.error };
    return { success: true, url: urlData.publicUrl };
  };

  // File upload handlers
  const handleDrivingLicenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDrivingLicenceFile(e.target.files[0]);
      setDlUploadStatus('idle');
    }
  };
  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdCardFile(e.target.files[0]);
      setIdUploadStatus('idle');
    }
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Lock logic
  const isProfileImageLocked = !!(userProfile && (userProfile as { [key: string]: unknown }).profile_url);
  const isDLFieldLocked = !!(driverProfile && (driverProfile as { [key: string]: unknown }).dl_url);
  const isIDFieldLocked = !!(driverProfile && (driverProfile as { [key: string]: unknown }).id_url);

  const handleUploadDL = async () => {
    if (!drivingLicenceFile) return;
    setDlUploadStatus('uploading');
    const result = await uploadDocument(drivingLicenceFile, 'dl');
    if (result.success) {
      setDlUploadStatus('uploaded');
      setMessage('Driving Licence uploaded successfully!');
      setDrivingLicenceFile(null); // Clear file input
      // Refetch driver profile to persist lock state
      if (user?.uid) {
        const { data } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('user_profile_id', user.uid)
          .single();
        setDriverProfile(data);
      }
    } else {
      setDlUploadStatus('error');
      setError(result.error || 'Failed to upload Driving Licence.');
    }
  };
  const handleUploadID = async () => {
    if (!idCardFile) return;
    setIdUploadStatus('uploading');
    const result = await uploadDocument(idCardFile, 'id');
    if (result.success) {
      setIdUploadStatus('uploaded');
      setMessage('ID Card uploaded successfully!');
      setIdCardFile(null); // Clear file input
      // Refetch driver profile to persist lock state
      if (user?.uid) {
        const { data } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('user_profile_id', user.uid)
          .single();
        setDriverProfile(data);
      }
    } else {
      setIdUploadStatus('error');
      setError(result.error || 'Failed to upload ID Card.');
    }
  };
  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    setPhotoUploadStatus('uploading');
    const result = await uploadDocument(photoFile, 'profile');
    if (result.success) {
      setPhotoUploadStatus('uploaded');
      setMessage('Profile photo uploaded successfully!');
      setPhotoFile(null); // Clear file input
      setPhotoPreview(null);
      // Refetch user profile to update avatar and lock state
      if (user?.uid) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.uid)
          .single();
        setUserProfile(data);
      }
    } else {
      setPhotoUploadStatus('error');
      // Optionally set error message
    }
  };

  const handleSave = async () => {
    if (!user || !userProfile) return;
    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      await updateFirebaseProfile(user, {
        displayName: formData.display_name
      });
      await updateUserProfile(user.uid, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
        phone: formData.phone,
        role: formData.role
      });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch {
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
    } catch {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        first_name: (userProfile as { [key: string]: unknown }).first_name as string,
        last_name: (userProfile as { [key: string]: unknown }).last_name as string,
        display_name: (userProfile as { [key: string]: unknown }).display_name as string,
        phone: (userProfile as { [key: string]: unknown }).phone as string,
        role: (userProfile as { [key: string]: unknown }).role as 'driver' | 'passenger' | 'both'
      });
      setDriverData({
        first_name: (userProfile as { [key: string]: unknown }).first_name as string,
        last_name: (userProfile as { [key: string]: unknown }).last_name as string,
        display_name: (userProfile as { [key: string]: unknown }).display_name as string,
        phone: (userProfile as { [key: string]: unknown }).phone as string,
        role: ((userProfile as { [key: string]: unknown }).role as string) === 'driver' ? 'driver' : 'both'
      });
      if (userProfile && typeof (userProfile as { [key: string]: unknown }).photo_url === 'string' && (userProfile as { [key: string]: unknown }).photo_url) {
        setPhotoPreview((userProfile as { [key: string]: unknown }).photo_url as string);
      } else {
        setPhotoPreview(null);
      }
    }
    setIsEditing(false);
    setError('');
    setMessage('');
  };

  // Helper for initials
  const getInitials = () => {
    if (formData.display_name) {
      return formData.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
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

  // EARLY RETURN after all hooks
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white w-full">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 flex flex-col justify-start">
        <section className="w-full flex flex-col flex-1">
          {/* Header */}
          <header className="w-full flex flex-row items-center justify-between mb-10 mt-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Profile Settings</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#4AAAFF] text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#4AAAFF] text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </header>

          {/* Messages */}
          {message && (
            <div className="w-full max-w-2xl mx-auto mb-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
              {message}
            </div>
          )}
          {error && (
            <div className="w-full max-w-2xl mx-auto mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Main Profile Content */}
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-xl shadow p-8">
            {/* Left: Avatar and Personal Info */}
            <div className="flex flex-col items-center md:items-start gap-8">
              {/* Profile Photo Avatar */}
              <div className="flex flex-col items-center w-full">
                <div
                  className="relative group cursor-pointer mb-2"
                  onClick={() => !isProfileImageLocked && photoInputRef.current?.click()}
                  title="Click to upload photo"
                  style={{ pointerEvents: isProfileImageLocked ? 'none' : 'auto' }}
                >
                  {(userProfile && (userProfile as { [key: string]: unknown }).profile_url) ? (
                    <Image
                      src={(userProfile as { [key: string]: unknown }).profile_url as string}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#4AAAFF] shadow"
                    />
                  ) : photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Profile Preview"
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#4AAAFF] shadow"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-[#4AAAFF] border-4 border-[#4AAAFF] shadow">
                      {getInitials()}
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.bmp"
                    ref={photoInputRef}
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={isProfileImageLocked}
                  />
                  <div className="absolute bottom-0 right-0 bg-[#4AAAFF] text-white rounded-full p-1 border border-white shadow text-xs group-hover:scale-110 transition-transform">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5"/></svg>
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-500">Click avatar to upload photo</div>
                {isProfileImageLocked && (
                  <div className="text-xs text-blue-600 mt-1">
                    Profile photo uploaded. You cannot change it again.
                  </div>
                )}
                {!isProfileImageLocked && photoFile && photoUploadStatus !== 'uploaded' && (
                  <button
                    type="button"
                    onClick={handleUploadPhoto}
                    className="bg-[#4AAAFF] text-white px-3 py-1 rounded hover:bg-blue-600 text-xs disabled:opacity-50 mt-2"
                    disabled={photoUploadStatus === 'uploading'}
                  >
                    {photoUploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
              {/* Personal Information */}
              <div className="w-full grid grid-cols-1 gap-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  />
                  <div className="flex items-center mt-1">
                    {(userProfile && (userProfile as { [key: string]: unknown }).is_phone_verified) ? (
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
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  >
                    <option value="passenger">Passenger (Book rides)</option>
                    <option value="driver">Driver (Offer rides)</option>
                    <option value="both">Both (Book & Offer rides)</option>
                  </select>
                </label>
              </div>
            </div>
            {/* Right: Account and Driver Info */}
            <div className="flex flex-col gap-8">
              {/* Account Information */}
              <div className="w-full grid grid-cols-1 gap-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 mt-1"
                  />
                </label>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    {user?.emailVerified ? (
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
                  {!user?.emailVerified && (
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
              {/* Driver Profile Section */}
              <div className="w-full grid grid-cols-1 gap-4 border-t border-gray-200 pt-8">
                <div className="mb-4 flex items-center gap-4">
                  <span className={driverVerified ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {driverVerified ? 'Driver Verified' : 'Not Verified as Driver'}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleDriverVerified}
                    className="px-3 py-1 rounded bg-[#4AAAFF] text-white text-xs hover:bg-blue-600"
                  >
                    {driverVerified ? 'Unverify (Test)' : 'Verify as Driver (Test)'}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Driver Profile</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name
                    <input
                      type="text"
                      name="first_name"
                      value={driverData.first_name}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name
                    <input
                      type="text"
                      name="last_name"
                      value={driverData.last_name}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name
                    <input
                      type="text"
                      name="display_name"
                      value={driverData.display_name}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number
                    <input
                      type="tel"
                      name="phone"
                      value={driverData.phone}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role
                    <select
                      name="role"
                      value={driverData.role}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                    >
                      <option value="driver">Driver (Offer rides)</option>
                      <option value="both">Both (Book & Offer rides)</option>
                    </select>
                  </label>
                </div>
                {/* File Uploads (always enabled) */}
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driving Licence (png, jpg, jpeg, pdf, etc.)
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf,.webp,.bmp"
                        onChange={handleDrivingLicenceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none"
                        disabled={isDLFieldLocked}
                      />
                      {!isDLFieldLocked && drivingLicenceFile && dlUploadStatus !== 'uploaded' && (
                        <button
                          type="button"
                          onClick={handleUploadDL}
                          className="bg-[#4AAAFF] text-white px-3 py-1 rounded hover:bg-blue-600 text-xs disabled:opacity-50"
                          disabled={dlUploadStatus === 'uploading'}
                        >
                          {dlUploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
                    </div>
                    {drivingLicenceFile && (
                      <div className="text-xs text-gray-600 mt-1">
                        Selected: {drivingLicenceFile.name}
                        {dlUploadStatus === 'uploaded' && <span className="ml-2 text-green-600">(Uploaded)</span>}
                      </div>
                    )}
                    {isDLFieldLocked && <div className="text-xs text-blue-600 mt-1">File uploaded. You cannot change it again.</div>}
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar / PAN Card (png, jpg, jpeg, pdf, etc.)
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf,.webp,.bmp"
                        onChange={handleIdCardChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none"
                        disabled={isIDFieldLocked}
                      />
                      {!isIDFieldLocked && idCardFile && idUploadStatus !== 'uploaded' && (
                        <button
                          type="button"
                          onClick={handleUploadID}
                          className="bg-[#4AAAFF] text-white px-3 py-1 rounded hover:bg-blue-600 text-xs disabled:opacity-50"
                          disabled={idUploadStatus === 'uploading'}
                        >
                          {idUploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
                    </div>
                    {idCardFile && (
                      <div className="text-xs text-gray-600 mt-1">
                        Selected: {idCardFile.name}
                        {idUploadStatus === 'uploaded' && <span className="ml-2 text-green-600">(Uploaded)</span>}
                      </div>
                    )}
                    {isIDFieldLocked && <div className="text-xs text-blue-600 mt-1">File uploaded. You cannot change it again.</div>}
                  </label>
                  {/* Photo Upload */}
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo (png, jpg, jpeg, etc.)
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.bmp"
                        onChange={handlePhotoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#4AAAFF] focus:border-transparent outline-none"
                        disabled={isProfileImageLocked}
                      />
                      {photoFile && photoUploadStatus !== 'uploaded' && (
                        <button
                          type="button"
                          onClick={handleUploadPhoto}
                          className="bg-[#4AAAFF] text-white px-3 py-1 rounded hover:bg-blue-600 text-xs disabled:opacity-50"
                          disabled={photoUploadStatus === 'uploading'}
                        >
                          {photoUploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
                    </div>
                    {photoFile && (
                      <div className="text-xs text-gray-600 mt-1">
                        Selected: {photoFile.name}
                        {photoUploadStatus === 'uploaded' && <span className="ml-2 text-green-600">(Uploaded)</span>}
                      </div>
                    )}
                    {isProfileImageLocked && <div className="text-xs text-blue-600 mt-1">Profile photo uploaded. You cannot change it again.</div>}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
