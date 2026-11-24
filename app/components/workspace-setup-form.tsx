'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth/client';

type OrganizationOption = { id: string; name: string };

export function WorkspaceSetupForm({ organizations }: { organizations: OrganizationOption[] }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function activateOrganization(organizationId: string) {
    setError('');
    setPending(true);
    try {
      const result = await authClient.organization.setActive({ organizationId });
      if (result.error) {
        setError('We couldn’t open that workspace. Try again.');
        return;
      }
      router.replace('/');
      router.refresh();
    } catch {
      setError('We couldn’t open that workspace. Try again.');
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const name = String(form.get('organization') ?? '').trim();
    const slug = name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    setError('');
    setPending(true);
    try {
      const result = await authClient.organization.create({ name, slug });
      if (result.error) {
        setError('We couldn’t create that workspace. Try a different name.');
        return;
      }
      router.replace('/');
      router.refresh();
    } catch {
      setError('We couldn’t create that workspace. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="workspace-setup-content">
      {organizations.length > 0 && (
        <section aria-labelledby="existing-workspaces-title" className="organization-options">
          <h2 id="existing-workspaces-title">Your workspaces</h2>
          <div className="organization-list">
            {organizations.map((organization) => (
              <button className="organization-option" disabled={pending} key={organization.id} onClick={() => activateOrganization(organization.id)} type="button">
                <span className="workspace-mark">{organization.name.slice(0, 1).toUpperCase()}</span>
                <span>{organization.name}</span>
                <span aria-hidden="true" className="organization-arrow">→</span>
              </button>
            ))}
          </div>
          <div className="setup-divider"><span>or create a workspace</span></div>
        </section>
      )}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field-label">
          Organization name
          <input autoComplete="organization" name="organization" placeholder="Acme Distribution" required />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary auth-submit" disabled={pending} type="submit">
          {pending ? 'Please wait…' : 'Create workspace'}
        </button>
      </form>
      {error && organizations.length > 0 && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
