'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile, UserProfile, updateUserProfile } from './supabase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.uid || 'null');
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log('Fetching user profile for:', firebaseUser.uid);
          const profile = await getUserProfile(firebaseUser.uid);
          console.log('Profile fetched successfully:', profile?.email);
          setUserProfile(profile);

          // Update email verification status in Supabase if it changed
          if (profile && profile.is_email_verified !== firebaseUser.emailVerified) {
            try {
              await updateUserProfile(firebaseUser.uid, {
                is_email_verified: firebaseUser.emailVerified
              });
              // Update local state
              setUserProfile(prev => prev ? {
                ...prev,
                is_email_verified: firebaseUser.emailVerified
              } : null);
            } catch (error) {
              console.error('Error updating email verification status:', error);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Only set profile to null if user genuinely doesn't exist
          // Don't fail for server errors
          if (error && typeof error === 'object' && 'code' in error) {
            // Supabase error codes
            if ((error as { code: string }).code === 'PGRST116') {
              // No rows returned - user profile doesn't exist
              console.log('User profile not found - user may need to complete signup');
              setUserProfile(null);
            }
          } else {
            // Keep existing profile if it's just a fetch error
            console.log('Keeping existing profile due to fetch error');
          }
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};


