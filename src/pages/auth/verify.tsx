import { useEffect, useState } from 'react';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import auth from '@/firebase/auth';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const verifyEmail = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }

        try {
          await signInWithEmailLink(auth, email || '', window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          setStatus('success');
          window.location.href = '/';
        } catch (error) {
          console.error('Error signing in with email link:', error);
          setStatus('error');
        }
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="flex min-h-screen flex-1 bg-[#202020]">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center">
            {status === 'verifying' && (
              <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-neutral-200">
                Verifying your email...
              </h2>
            )}
            {status === 'success' && (
              <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-neutral-200">
                Email verified! Redirecting...
              </h2>
            )}
            {status === 'error' && (
              <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-neutral-200">
                Error verifying email. Please try again.
              </h2>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 