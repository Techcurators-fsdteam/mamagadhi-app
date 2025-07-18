import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import Link from 'next/link';
import LoginPopup from './LoginPopup';
import SignupPopup from './SignupPopup';

const Navbar = () => {
  // Simulated auth state
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Handle login success
  const handleLoginSuccess = () => {
    setIsSignedIn(true);
    setShowLogin(false);
    setShowSignup(false);
  };

  // Handle logout (optional, for demo)
  // const handleLogout = () => setIsSignedIn(false);

  return (
    <>
      <nav className="w-full flex items-center justify-between px-2 sm:px-4 md:px-6 pt-4 sm:pt-6 bg-white h-16 sm:h-20 min-h-0" style={{marginBottom: 0}}>
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-[80px] h-full relative">
          <Link href="/">
            <img src="/logo.png" alt="Logo" className="h-14 sm:h-16 md:h-20 object-contain relative top-0 left-0" style={{ maxWidth: 180, zIndex: 10 }} />
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
          <div className="ml-1 sm:ml-2 flex items-center">
            {!isSignedIn ? (
              <button
                className="bg-[#2196f3] text-white font-bold text-base px-6 py-2 rounded-full shadow-sm hover:bg-[#1769aa] transition"
                onClick={() => setShowLogin(true)}
              >
                Sign in
              </button>
            ) : (
              <Avatar className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-gray-400"><circle cx="16" cy="16" r="16" fill="#E5E7EB"/><ellipse cx="16" cy="13" rx="5" ry="5" fill="#A3A3A3"/><ellipse cx="16" cy="24" rx="8" ry="5" fill="#A3A3A3"/></svg>
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          {/* Dropdown arrow (only if signed in) */}
          {isSignedIn && (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 ml-1"><path d="M6 9l6 6 6-6"/></svg>
          )}
        </div>
      </nav>
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
      {/* Simulate login success by passing handleLoginSuccess to LoginPopup/SignupPopup if needed */}
      {/* You can add a prop to LoginPopup/SignupPopup to call handleLoginSuccess on successful login/signup */}
    </>
  );
};

export default Navbar;
