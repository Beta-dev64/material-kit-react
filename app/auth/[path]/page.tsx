import Image from 'next/image';
import { notFound } from 'next/navigation';

import { AuthForm } from '@/app/components/auth-form';

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  if (path !== 'sign-in' && path !== 'sign-up') notFound();

  return (
    <main className="auth-page">
      <section aria-labelledby="auth-title" className="auth-card">
        <a aria-label="Kredia home" className="auth-brand" href="/">
          <Image alt="" height={44} priority src="/branding/kredia-logo.png" width={155} />
        </a>
        <p className="eyebrow">Receivables, in rhythm</p>
        <h1 id="auth-title">{path === 'sign-in' ? 'Welcome back' : 'Start with clarity'}</h1>
        <p className="auth-intro">
          {path === 'sign-in' ? 'Sign in to your finance workspace.' : 'Create a secure account for your team.'}
        </p>
        <AuthForm mode={path} />
        <p className="auth-footnote">Secure access powered by Neon Auth</p>
      </section>
      <aside aria-hidden="true" className="auth-aside">
        <div className="auth-aside-inner">
          <span className="eyebrow eyebrow-light">CONTROL THE CURRENT</span>
          <p>Every receipt has a place. Every balance has a story.</p>
          <span className="auth-aside-caption">A calmer way to move cash forward.</span>
        </div>
      </aside>
    </main>
  );
}
