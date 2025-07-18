'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../../firebase/config';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const verifyEmailLink = async () => {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          let email = localStorage.getItem('emailForSignIn');
          
          // If email is not in localStorage, prompt user
          if (!email) {
            const urlParams = new URLSearchParams(window.location.search);
            email = urlParams.get('email');
            
            if (!email) {
              email = window.prompt('Please provide your email for confirmation');
            }
          }

          if (email) {
            await signInWithEmailLink(auth, email, window.location.href);
            localStorage.removeItem('emailForSignIn');
            setStatus('success');
            
            // Redirect after 2 seconds
            setTimeout(() => {
              router.push('/dashboard'); // Change to your desired redirect
            }, 2000);
          } else {
            throw new Error('Email is required for verification');
          }
        } else {
          throw new Error('Invalid verification link');
        }
      } catch (error: any) {
        console.error('Email verification failed:', error);
        setError(error.message);
        setStatus('error');
      }
    };

    verifyEmailLink();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4AAAFF] to-white/70 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 text-center shadow-2xl">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4AAAFF] mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h2>
            <p className="text-gray-600">Please wait while we verify your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600">Redirecting you to the dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#4AAAFF] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}