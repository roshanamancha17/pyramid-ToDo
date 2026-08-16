'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { api } from '@/lib/api';
import { useApp } from '@/lib/app-context';
import { getFirebaseAuth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuest() {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/guest');
      await refreshUser();
      router.push('/tasks');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    if (!isFirebaseConfigured()) {
      setError('Google login isn\u2019t configured yet — set the NEXT_PUBLIC_FIREBASE_* values in frontend/.env.local.');
      return;
    }
    setGoogleLoading(true);
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await api.post('/auth/google', { idToken });
      await refreshUser();
      router.push('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-2 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-7 w-7 rounded-md bg-foreground flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-surface">
              <path d="M12 2 L22 20 L2 20 Z" />
            </svg>
          </div>
          <span className="font-semibold text-lg">Pyramid</span>
        </div>

        <div className="bg-surface border border-border rounded-2xl px-8 py-8">
          <h1 className="text-2xl font-semibold text-center mb-2">
            Let&apos;s get back on track
          </h1>
          <p className="text-muted text-center text-sm mb-6">
            Enter your email below to login to your account.
          </p>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
              {error}
            </p>
          )}

          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full h-11 rounded-full bg-foreground text-surface font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Continue as Guest'}
          </button>

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full h-11 mt-3 rounded-full border border-border font-medium flex items-center justify-center gap-2 hover:bg-surface-2 transition disabled:opacity-60"
          >
            <GoogleIcon />
            {googleLoading ? 'Signing in…' : 'Login with Google'}
          </button>
        </div>

        <p className="text-xs text-muted text-center mt-5">
          By clicking continue, you agree to our{' '}
          <a href="#" className="underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.998 11.998 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}
