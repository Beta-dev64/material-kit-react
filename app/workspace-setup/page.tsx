import Image from 'next/image';
import { redirect } from 'next/navigation';

import { WorkspaceSetupForm } from '@/app/components/workspace-setup-form';
import { getOrganizationsForCurrentUser } from '@/lib/auth/organization';
import { auth } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export default async function WorkspaceSetupPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  const activeOrganizationId = (session.session as typeof session.session & { activeOrganizationId?: string | null })
    .activeOrganizationId;
  if (activeOrganizationId) redirect('/');
  const organizations = await getOrganizationsForCurrentUser();

  return (
    <main className="auth-page auth-page-centered">
      <section aria-labelledby="setup-title" className="auth-card">
        <a aria-label="Kredia home" className="auth-brand" href="/">
          <Image alt="" height={44} priority src="/branding/kredia-logo.png" width={44} />
          <span>Kredia</span>
        </a>
        <p className="eyebrow">Your organization</p>
        <h1 id="setup-title">Set up your workspace</h1>
        <p className="auth-intro">Your organization is the private home for customers, invoices, and payment activity.</p>
        <WorkspaceSetupForm organizations={organizations} />
      </section>
    </main>
  );
}
