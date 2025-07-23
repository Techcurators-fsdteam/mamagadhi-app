import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import Link from 'next/link';
import LoginPopup from './LoginPopup';
import SignupPopup from './SignupPopup';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';
import LoginRequiredPopup from './LoginRequiredPopup';

const Navbar = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const [showDriverPopup, setShowDriverPopup] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  // Handler for Book a ride
  const handleBookRide = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginRequired(true);
      return;
    }
    router.push('/book');
  };

  // Handler for Post a ride
  const handlePostRide = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginRequired(true);
      return;
    }
    if (typeof window !== 'undefined' && localStorage.getItem('driverVerified') !== 'true') {
      setShowDriverPopup(true);
      return;
    }
    router.push('/publish');
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (userProfile?.display_name) {
      return userProfile.display_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <>
      <nav className="w-full flex items-center justify-between px-2 sm:px-6 md:px-10 bg-white h-12 sm:h-14 md:h-14 min-h-0  sm:mt-2" style={{marginBottom: 0}}>
        {/* Logo */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-[80px] h-full relative">
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={180} 
              height={60} 
              className="h-8 sm:h-10 md:h-12 object-contain relative top-0 left-0" 
              style={{ maxWidth: 180, zIndex: 10 }} 
            />
          </Link>
        </div>

        {/* Center: Book and Post a ride */}
        <div className="flex items-center gap-3 sm:gap-5 md:gap-7 flex-1 justify-end h-full">
          {/* Book a ride */}
          <Button
            variant="outline"
            className="rounded-full px-2 sm:px-4 py-0 flex items-center gap-1 sm:gap-2 text-xs sm:text-base font-medium h-8 sm:h-10 min-w-[80px] sm:min-w-[110px]"
            onClick={handleBookRide}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-700"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span className="text-gray-500 xs:inline">Book a ride</span>
            </span>
          </Button>

          {/* Post a ride */}
          <Button
            variant="outline"
            className="rounded-full px-2 sm:px-4 py-0 flex items-center gap-1 sm:gap-2 text-xs sm:text-base font-medium h-8 sm:h-10 min-w-[80px] sm:min-w-[110px]"
            onClick={handlePostRide}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-700"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span className="text-gray-500 xs:inline">Post a ride</span>
            </span>
          </Button>

          {/* User Auth */}
          <div className="ml-2 flex items-center relative h-full">
            {loading ? (
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : !user ? (
              <button
                className="bg-[#2196f3] text-white font-bold text-xs sm:text-sm px-4 py-1 rounded-full shadow-sm hover:bg-[#1769aa] transition h-8 sm:h-10"
                onClick={() => setShowLogin(true)}
              >
                Sign in
              </button>
            ) : (
              <div className="flex items-center gap-2 h-full">
                {/* User name (hidden on mobile) */}
                <span className="hidden sm:block text-xs sm:text-sm font-medium text-gray-700">
                  {userProfile?.display_name || user.email?.split('@')[0] || 'User'}
                </span>
                
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center h-8 sm:h-10"
                >
                  <Avatar className="w-8 sm:w-10 h-8 sm:h-10">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback className="bg-[#4AAAFF] text-white font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-64 min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 truncate">
                        {userProfile?.display_name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-2 px-2 flex flex-col gap-1">
                      <Link
                        href="/profile"
                        className="block rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/rides"
                        className="block rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        My Rides
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left rounded px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dropdown arrow (only if signed in) */}
          {user && !loading && (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 ml-1 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          )}
        </div>
      </nav>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Popups */}
      <LoginPopup
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }}
      />
      {/* Login Required Popup for protected actions */}
      <LoginRequiredPopup
        isOpen={showLoginRequired}
        onClose={() => setShowLoginRequired(false)}
        setShowLogin={setShowLogin}
      />
      <SignupPopup
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
      />

      {/* Driver Verification Popup */}
      {showDriverPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/30">
          <div className="relative bg-gradient-to-br from-[#4AAAFF] to-white rounded-2xl shadow-2xl max-w-xs w-full text-center p-8" style={{backdropFilter: 'blur(16px)'}}>
            <button
              className="absolute top-3 right-3 text-white hover:text-[#2196f3] text-xl font-bold focus:outline-none transition-colors"
              onClick={() => setShowDriverPopup(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="mb-4 text-2xl font-bold text-white">You are not verified as a Driver</div>
            <div className="mb-6 text-base text-black/50">Update your profile to publish a ride.</div>
            <button
              className="bg-[#4AAAFF] text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 w-full mb-2 transition"
              onClick={() => { setShowDriverPopup(false); router.push('/profile'); }}
            >
              Go to Profile
            </button>
            <button
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-white hover:bg-gray-100 hover:text-black/80 transition"
              onClick={() => setShowDriverPopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
