import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import Link from 'next/link';
import LoginPopup from './LoginPopup';
import SignupPopup from './SignupPopup';
import { useAuth } from '../lib/auth';

const Navbar = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
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
      <nav className="w-full flex items-center justify-between px-2 sm:px-4 md:px-6 pt-4 sm:pt-6 bg-white h-16 sm:h-20 min-h-0" style={{marginBottom: 0}}>
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-[80px] h-full relative">
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={180} 
              height={80} 
              className="h-14 sm:h-16 md:h-20 object-contain relative top-0 left-0" 
              style={{ maxWidth: 180, zIndex: 10 }} 
            />
          </Link>
        </div>

        {/* Center: Search and Post a ride */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-1 justify-end">
          {/* Search */}
          <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full border border-gray-200 shadow-sm h-8 sm:h-10 md:h-12 px-2 sm:px-3 w-24 sm:w-36 md:w-56 transition-all">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-500"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <Input className="border-0 focus:ring-0 h-6 sm:h-8 md:h-10 text-xs sm:text-base px-0 bg-transparent" placeholder="Search" style={{ boxShadow: 'none' }} />
          </div>

          {/* Post a ride */}
          <Link href="/publish">
            <Button asChild variant="outline" className="rounded-full px-2 sm:px-4 py-0 flex items-center gap-1 sm:gap-2 text-xs sm:text-base font-medium h-8 sm:h-10 md:h-12 min-w-[80px] sm:min-w-[120px]">
              <span className="flex items-center gap-1 sm:gap-2">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-700"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <span className=" text-gray-500 xs:inline">Post a ride</span>
              </span>
            </Button>
          </Link>

          {/* User Auth */}
          <div className="ml-1 sm:ml-2 flex items-center relative">
            {loading ? (
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-200 animate-pulse"></div>
            ) : !user ? (
              <button
                className="bg-[#2196f3] text-white font-bold text-base px-6 py-2 rounded-full shadow-sm hover:bg-[#1769aa] transition"
                onClick={() => setShowLogin(true)}
              >
                Sign in
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {/* User name (hidden on mobile) */}
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {userProfile?.display_name || user.email?.split('@')[0] || 'User'}
                </span>
                
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center"
                >
                  <Avatar className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback className="bg-[#4AAAFF] text-white font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">
                        {userProfile?.display_name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {userProfile?.role || 'passenger'}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/rides"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        My Rides
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
      <SignupPopup
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
      />
    </>
  );
};

export default Navbar;
