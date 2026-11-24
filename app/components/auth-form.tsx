'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth/client';

type AuthFormProps = {
  mode: 'sign-in' | 'sign-up';
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const isSignUp = mode === 'sign-up';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const name = String(form.get('name') ?? '').trim();

    setError('');
    setPending(true);
    try {
      const result = isSignUp
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError('We couldn’t complete that request. Check your details and try again.');
        return;
      }

      router.replace(isSignUp ? '/workspace-setup' : '/');
      router.refresh();
    } catch {
      setError('We couldn’t complete that request. Check your details and try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isSignUp && (
        <label className="field-label">
          Your name
          <input autoComplete="name" name="name" placeholder="Ada Okafor" required />
        </label>
      )}
      <label className="field-label">
        Work email
        <input autoComplete="email" name="email" placeholder="you@company.com" required type="email" />
      </label>
      <label className="field-label">
        Password
        <input autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={8} name="password" required type="password" />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary auth-submit" disabled={pending} type="submit">
        {pending ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
      </button>
      <p className="auth-switch">
        {isSignUp ? 'Already have an account?' : 'New to Kredia?'}{' '}
        <a href={isSignUp ? '/auth/sign-in' : '/auth/sign-up'}>
          {isSignUp ? 'Sign in' : 'Create an account'}
        </a>
      </p>
    </form>
  );
}
