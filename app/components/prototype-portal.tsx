'use client';

import type { FormEvent } from 'react';

import seed from '@/data/kredia-prototype.json';
import { useMemo, useState, useEffect } from 'react';

type Role = 'platform_admin' | 'tenant_admin';
type DemoUser = { id: string; name: string; email: string; password: string; role: Role; organizationId: string | null };
type Organization = {
  id: string; name: string; slug: string; ownerEmail: string; status: 'active'; customerCount: number;
  openMinor: string; overdueMinor: string; disputedMinor: string; unappliedMinor: string; currency: string; createdAt: string;
};
type PrototypeData = { users: DemoUser[]; organizations: Organization[] };
type ActiveUser = Pick<DemoUser, 'id' | 'name' | 'email' | 'role' | 'organizationId'>;

type NavItem = { label: string; glyph: string };
const tenantNavigation: NavItem[] = [
  { label: 'Overview', glyph: '◫' }, { label: 'Collections', glyph: '↗' }, { label: 'Customers', glyph: '◎' },
  { label: 'Invoices', glyph: '▤' }, { label: 'Payments', glyph: '↔' }, { label: 'Imports', glyph: '⇧' },
  { label: 'Disputes', glyph: '!' }, { label: 'Approvals', glyph: '✓' },
];
const adminNavigation: NavItem[] = [{ label: 'Overview', glyph: '◫' }, { label: 'Organizations', glyph: '▦' }, { label: 'Access', glyph: '♙' }];

function formatMoney(minor: string, currency = 'NGN') {
  const amount = BigInt(minor || '0');
  const divisor = 100n;
  return `${currency === 'NGN' ? '₦' : `${currency} `}${new Intl.NumberFormat('en-NG').format(amount / divisor)}.${(amount % divisor).toString().padStart(2, '0')}`;
}

function seedState(): PrototypeData {
  return JSON.parse(JSON.stringify(seed)) as PrototypeData;
}

export function PrototypePortal() {
  const [data, setData] = useState<PrototypeData>(seedState);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState('admin@kredia.demo');
  const [password, setPassword] = useState('Kredia2026!');
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [activePage, setActivePage] = useState('Overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProvision, setShowProvision] = useState(false);
  const [provisionError, setProvisionError] = useState('');
  const [provisionedLogin, setProvisionedLogin] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('kredia-prototype-json');
      if (saved) setData(JSON.parse(saved) as PrototypeData);
      const savedSession = window.localStorage.getItem('kredia-prototype-session');
      if (savedSession) setActiveUser(JSON.parse(savedSession) as ActiveUser);
    } catch {
      window.localStorage.removeItem('kredia-prototype-json');
      window.localStorage.removeItem('kredia-prototype-session');
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem('kredia-prototype-json', JSON.stringify(data));
  }, [data, hydrated]);

  const currentOrganization = useMemo(
    () => data.organizations.find((organization) => organization.id === activeUser?.organizationId) ?? null,
    [activeUser?.organizationId, data.organizations],
  );
  const nav = activeUser?.role === 'platform_admin' ? adminNavigation : tenantNavigation;

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loginBusy) return;
    setLoginBusy(true);
    setLoginError('');
    window.setTimeout(() => {
      const user = data.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
      if (!user) {
        setLoginError('That email and password do not match a demo account.');
        setLoginBusy(false);
        return;
      }
      const session: ActiveUser = { id: user.id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId };
      setActiveUser(session);
      window.localStorage.setItem('kredia-prototype-session', JSON.stringify(session));
      setActivePage('Overview');
      setLoginBusy(false);
    }, 220);
  }

  function signOut() {
    setActiveUser(null);
    setProvisionedLogin(null);
    setMobileMenuOpen(false);
    window.localStorage.removeItem('kredia-prototype-session');
  }

  function provisionOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProvisionError('');
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('organization') ?? '').trim();
    const ownerName = String(formData.get('owner') ?? '').trim();
    const ownerEmail = String(formData.get('ownerEmail') ?? '').trim().toLowerCase();
    const slug = name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!name || !ownerName || !ownerEmail) return;
    if (data.users.some((user) => user.email.toLowerCase() === ownerEmail)) {
      setProvisionError('That email already has a Kredia demo login. Use another email address.');
      return;
    }
    const temporaryPassword = `Kredia-${Math.floor(1000 + Math.random() * 9000)}!`;
    const organizationId = `org-${Date.now()}`;
    const organization: Organization = {
      id: organizationId, name, slug, ownerEmail, status: 'active', customerCount: 0,
      openMinor: '0', overdueMinor: '0', disputedMinor: '0', unappliedMinor: '0', currency: 'NGN', createdAt: new Date().toISOString(),
    };
    const user: DemoUser = {
      id: `user-${Date.now()}`, name: ownerName, email: ownerEmail, password: temporaryPassword,
      role: 'tenant_admin', organizationId,
    };
    setData((previous) => ({ organizations: [organization, ...previous.organizations], users: [user, ...previous.users] }));
    setProvisionedLogin({ email: ownerEmail, password: temporaryPassword });
    setShowProvision(false);
    event.currentTarget.reset();
  }

  function exportJson() {
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'kredia-prototype-data.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function fillDemoAccount(role: Role) {
    const demoUser = data.users.find((user) => user.role === role);
    if (demoUser) { setEmail(demoUser.email); setPassword(demoUser.password); setLoginError(''); }
  }

  if (!hydrated) return <main className="prototype-loading" aria-label="Loading Kredia prototype"><span className="loading-orbit" /></main>;

  if (!activeUser || (activeUser.role === 'tenant_admin' && !currentOrganization)) {
    return (
      <main className="prototype-login-page">
        <section aria-labelledby="prototype-login-title" className="prototype-login-card">
          <a className="prototype-brand" href="/" aria-label="Kredia home"><img alt="Kredia" src="/branding/kredia-logo.png" /></a>
          <span className="prototype-kicker"><i /> FRONTEND PREVIEW</span>
          <h1 id="prototype-login-title">Welcome back</h1>
          <p className="prototype-login-copy">Sign in to your Kredia finance workspace.</p>
          <form className="prototype-form" onSubmit={login}>
            <label>Email address<input autoComplete="username" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
            <label>Password<input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
            {loginError && <p className="prototype-error" role="alert">{loginError}</p>}
            <button className="prototype-primary-button" disabled={loginBusy} type="submit">{loginBusy ? 'Opening workspace…' : 'Sign in'}</button>
          </form>
          <div className="demo-access">
            <span className="demo-access-title">EXPLORE A DEMO WORKSPACE</span>
            <button onClick={() => fillDemoAccount('platform_admin')} type="button"><span className="demo-role-mark admin-mark">K</span><span><strong>Kredia admin</strong><small>Provision tenant organizations</small></span><span className="demo-arrow">→</span></button>
            <button onClick={() => fillDemoAccount('tenant_admin')} type="button"><span className="demo-role-mark tenant-mark">N</span><span><strong>Tenant organization</strong><small>Northstar Foods finance team</small></span><span className="demo-arrow">→</span></button>
          </div>
          <p className="prototype-demo-note">Prototype only · Demo credentials are stored in this browser, not secured for real accounts.</p>
        </section>
        <aside aria-label="Kredia platform introduction" className="prototype-login-aside">
          <div className="login-aside-orbit" />
          <div className="login-aside-content"><span>ONE PLATFORM. DISTINCT WORKSPACES.</span><h2>Clear receivables.<br />Confident next steps.</h2><p>Explore the platform administrator experience, then sign into a tenant workspace provisioned from the admin dashboard.</p><div className="preview-pill"><i /> JSON-backed frontend prototype</div></div>
        </aside>
      </main>
    );
  }

  const isPlatformAdmin = activeUser.role === 'platform_admin';
  const selectedNavigation = nav.some((item) => item.label === activePage) ? activePage : 'Overview';
  const platformOpen = data.organizations.reduce((sum, org) => sum + BigInt(org.openMinor), 0n);
  const platformOverdue = data.organizations.reduce((sum, org) => sum + BigInt(org.overdueMinor), 0n);

  return (
    <div className="prototype-app-frame">
      <aside className={`prototype-sidebar ${mobileMenuOpen ? 'prototype-sidebar-open' : ''}`}>
        <a className="prototype-sidebar-brand" href="#overview" onClick={() => setActivePage('Overview')}><img alt="Kredia" src="/branding/kredia-logo.png" /></a>
        <div className="prototype-space-card"><span className={`prototype-workspace-initial ${isPlatformAdmin ? 'platform-initial' : ''}`}>{isPlatformAdmin ? 'K' : currentOrganization?.name.slice(0, 1)}</span><span><strong>{isPlatformAdmin ? 'Kredia' : currentOrganization?.name}</strong><small>{isPlatformAdmin ? 'Platform workspace' : 'Tenant workspace'}</small></span><span className="workspace-chevron">⌄</span></div>
        <p className="prototype-nav-heading">{isPlatformAdmin ? 'PLATFORM' : 'WORKSPACE'}</p>
        <nav aria-label="Workspace navigation" className="prototype-navigation">
          {nav.map((item) => <button aria-current={selectedNavigation === item.label ? 'page' : undefined} className={`prototype-nav-item ${selectedNavigation === item.label ? 'prototype-nav-active' : ''}`} key={item.label} onClick={() => { setActivePage(item.label); setMobileMenuOpen(false); }} type="button"><span aria-hidden="true">{item.glyph}</span>{item.label}{item.label === 'Organizations' && <small>{data.organizations.length}</small>}</button>)}
        </nav>
        <div className="prototype-sidebar-bottom"><div className="prototype-sidebar-callout"><span>?</span><div><strong>Prototype mode</strong><small>Changes stay in this browser</small></div></div><button className="prototype-profile" onClick={signOut} type="button"><span className="prototype-avatar">{activeUser.name.slice(0, 1).toUpperCase()}</span><span><strong>{activeUser.name}</strong><small>{isPlatformAdmin ? 'Platform admin · Sign out' : 'Tenant admin · Sign out'}</small></span><span aria-hidden="true" className="profile-dots">•••</span></button></div>
      </aside>
      {mobileMenuOpen && <button aria-label="Close menu" className="prototype-scrim" onClick={() => setMobileMenuOpen(false)} type="button" />}
      <div className="prototype-main-column">
        <header className="prototype-topbar"><button aria-label="Toggle navigation" aria-expanded={mobileMenuOpen} className="prototype-menu-toggle" onClick={() => setMobileMenuOpen((value) => !value)} type="button"><span /><span /><span /></button><div className="prototype-breadcrumb"><span>Kredia</span><b>/</b><strong>{selectedNavigation}</strong></div><div className="prototype-top-actions"><span className="prototype-environment">DEMO</span><button aria-label="Export prototype data as JSON" className="prototype-export-button" onClick={exportJson} type="button">Export JSON</button><span className="prototype-top-avatar">{activeUser.name.slice(0, 1).toUpperCase()}</span></div></header>
        <main className="prototype-main-content">
          {isPlatformAdmin ? (
            <>
              <div className="prototype-heading-row"><div><p className="prototype-eyebrow">PLATFORM CONTROL</p><h1>{selectedNavigation === 'Overview' ? 'Good morning, Kredia' : selectedNavigation === 'Organizations' ? 'Tenant organizations' : 'Access directory'}</h1><p className="prototype-subtitle">{selectedNavigation === 'Overview' ? 'A clear view across every Kredia tenant workspace.' : selectedNavigation === 'Organizations' ? 'Provision and manage organizations using Kredia.' : 'Demo logins provisioned across your platform workspaces.'}</p></div><button className="prototype-primary-button prototype-heading-button" onClick={() => { setShowProvision(true); setProvisionedLogin(null); }} type="button">＋ Add organization</button></div>
              {provisionedLogin && <section aria-live="polite" className="provision-success"><div><span className="success-check">✓</span><div><strong>Tenant workspace provisioned</strong><p>Share this demo login with the organization owner. It is visible only in this browser session.</p></div></div><div className="provision-credentials"><span><small>EMAIL</small><strong>{provisionedLogin.email}</strong></span><span><small>TEMPORARY PASSWORD</small><strong>{provisionedLogin.password}</strong></span><button className="prototype-secondary-button" onClick={() => navigator.clipboard?.writeText(`Email: ${provisionedLogin.email}\nTemporary password: ${provisionedLogin.password}`)} type="button">Copy login</button><button aria-label="Dismiss provisioned login details" className="dismiss-provision" onClick={() => setProvisionedLogin(null)} type="button">×</button></div></section>}
              <section aria-label="Platform summary" className="prototype-metric-grid">
                <Metric label="Tenant organizations" value={String(data.organizations.length)} note="Active workspaces" symbol="▦" tone="teal" />
                <Metric label="Open receivables" value={formatMoney(platformOpen.toString())} note="Across tenant workspaces" symbol="↗" tone="gold" />
                <Metric label="Overdue exposure" value={formatMoney(platformOverdue.toString())} note="Requires follow-up" symbol="◷" tone="rose" />
                <Metric label="Provisioned logins" value={String(data.users.length)} note="Admin and tenant access" symbol="♙" tone="blue" />
              </section>
              {selectedNavigation === 'Access' ? <AccessDirectory users={data.users} organizations={data.organizations} /> : <OrganizationTable organizations={data.organizations} onProvision={() => setShowProvision(true)} />}
              <p className="prototype-data-caption"><span className="json-dot" />Demo data · Stored locally as JSON in this browser. Export a JSON snapshot any time.</p>
            </>
          ) : currentOrganization ? (
            <TenantWorkspace organization={currentOrganization} user={activeUser} selectedPage={selectedNavigation} setActivePage={setActivePage} />
          ) : null}
        </main>
      </div>
      {showProvision && <ProvisionModal onClose={() => { setShowProvision(false); setProvisionError(''); }} onSubmit={provisionOrganization} error={provisionError} />}
    </div>
  );
}

function Metric({ label, value, note, symbol, tone }: { label: string; value: string; note: string; symbol: string; tone: string }) {
  return <article className="prototype-metric-card"><div className="prototype-metric-head"><span>{label}</span><i className={`prototype-metric-icon tone-${tone}`}>{symbol}</i></div><strong className="prototype-metric-value">{value}</strong><small>{note}</small></article>;
}

function OrganizationTable({ organizations, onProvision }: { organizations: Organization[]; onProvision: () => void }) {
  return <section aria-labelledby="organizations-title" className="prototype-data-panel"><div className="prototype-panel-heading"><div><h2 id="organizations-title">Your organizations</h2><p>Workspace access and receivables at a glance</p></div><button className="prototype-link-button" onClick={onProvision} type="button">＋ Provision tenant</button></div>{organizations.length ? <div className="prototype-table-wrap"><table className="prototype-table"><thead><tr><th scope="col">ORGANIZATION</th><th scope="col">WORKSPACE OWNER</th><th scope="col">CUSTOMERS</th><th scope="col">OPEN AR</th><th scope="col">STATUS</th></tr></thead><tbody>{organizations.map((organization) => <tr key={organization.id}><td><span className="org-cell"><i>{organization.name.slice(0, 1).toUpperCase()}</i><span><strong>{organization.name}</strong><small>/{organization.slug}</small></span></span></td><td>{organization.ownerEmail}</td><td>{organization.customerCount}</td><td className="table-money">{formatMoney(organization.openMinor)}</td><td><span className="status-active"><i />Active</span></td></tr>)}</tbody></table></div> : <div className="prototype-empty"><span>▦</span><strong>Your first tenant starts here</strong><p>Provision an organization and its first admin login to get started.</p><button className="prototype-primary-button" onClick={onProvision} type="button">Add organization</button></div>}<div className="prototype-table-footer">Showing {organizations.length} tenant workspace{organizations.length === 1 ? '' : 's'} <span>Amounts use NGN minor-unit demo data</span></div></section>;
}

function AccessDirectory({ users, organizations }: { users: DemoUser[]; organizations: Organization[] }) {
  return <section className="prototype-data-panel"><div className="prototype-panel-heading"><div><h2>Access directory</h2><p>Prototype accounts attached to Kredia workspaces</p></div></div><div className="prototype-table-wrap"><table className="prototype-table"><thead><tr><th scope="col">USER</th><th scope="col">EMAIL</th><th scope="col">ACCESS ROLE</th><th scope="col">WORKSPACE</th><th scope="col">STATUS</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><span className="user-cell"><i>{user.name.slice(0, 1).toUpperCase()}</i><strong>{user.name}</strong></span></td><td>{user.email}</td><td>{user.role === 'platform_admin' ? 'Kredia platform admin' : 'Tenant organization admin'}</td><td>{user.organizationId ? organizations.find((organization) => organization.id === user.organizationId)?.name ?? '—' : 'Kredia platform'}</td><td><span className="status-active"><i />Active</span></td></tr>)}</tbody></table></div><p className="prototype-table-footer">Demo access only. Passwords are not shown in the access directory.</p></section>;
}

function ProvisionModal({ onClose, onSubmit, error }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; error: string }) {
  return <div className="prototype-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section aria-labelledby="provision-title" aria-modal="true" className="prototype-modal" role="dialog"><button aria-label="Close dialog" className="prototype-modal-close" onClick={onClose} type="button">×</button><span className="prototype-modal-mark">＋</span><p className="prototype-eyebrow">NEW TENANT</p><h2 id="provision-title">Provision an organization</h2><p className="prototype-modal-copy">Create a workspace and its first tenant admin login. A temporary demo password will be generated for you.</p><form className="prototype-form" onSubmit={onSubmit}><label>Organization name<input autoComplete="organization" name="organization" placeholder="e.g. Acme Distribution" required /></label><label>Organization admin<input autoComplete="name" name="owner" placeholder="e.g. Ada Okafor" required /></label><label>Admin work email<input autoComplete="email" name="ownerEmail" placeholder="ada@acme.com" required type="email" /></label>{error && <p className="prototype-error" role="alert">{error}</p>}<div className="prototype-modal-actions"><button className="prototype-secondary-button" onClick={onClose} type="button">Cancel</button><button className="prototype-primary-button" type="submit">Create workspace</button></div></form><p className="prototype-modal-note">This creates local demo data only. No real email or account is created.</p></section></div>;
}

function TenantWorkspace({ organization, user, selectedPage, setActivePage }: { organization: Organization; user: ActiveUser; selectedPage: string; setActivePage: (page: string) => void }) {
  const open = BigInt(organization.openMinor);
  const overdue = BigInt(organization.overdueMinor);
  const net = open - BigInt(organization.unappliedMinor);
  const isOverview = selectedPage === 'Overview';
  const hasDemoLedger = organization.customerCount > 0;
  return <div className="tenant-dashboard"><div className="prototype-heading-row"><div><p className="prototype-eyebrow">{organization.name.toUpperCase()} · FINANCE WORKSPACE</p><h1>{isOverview ? `Good morning, ${user.name.split(' ')[0]}` : selectedPage}</h1><p className="prototype-subtitle">{isOverview ? 'Your receivables, cash position, and next actions in one place.' : `${selectedPage} workspace · Explore the ${organization.name} demo experience.`}</p></div><button className="prototype-secondary-button tenant-export" onClick={() => setActivePage('Invoices')} type="button">View invoices <span>→</span></button></div>
    <div className="tenant-status-banner"><span className="tenant-live-dot" /><span><strong>Workspace ready</strong><small>Demo tenant data · NGN · Africa/Lagos</small></span><span className="tenant-banner-tag">TENANT ADMIN</span></div>
    <section aria-label="Receivables summary" className="prototype-metric-grid tenant-metric-grid"><Metric label="Open receivables" value={formatMoney(organization.openMinor)} note="Across posted invoices" symbol="↗" tone="teal" /><Metric label="Overdue" value={formatMoney(organization.overdueMinor)} note="Requires follow-up" symbol="◷" tone="gold" /><Metric label="Disputed exposure" value={formatMoney(organization.disputedMinor)} note="Open and under review" symbol="!" tone="rose" /><Metric label="Unapplied cash" value={formatMoney(organization.unappliedMinor)} note="Confirmed receipts" symbol="↔" tone="blue" /></section>
    {isOverview ? <section className="tenant-content-grid"><article className="prototype-data-panel tenant-aging-panel"><div className="prototype-panel-heading"><div><h2>Aging overview</h2><p>Open balance by days past due</p></div><span className="ledger-aligned"><i />Ledger aligned</span></div><p className="tenant-net-label">Net exposure</p><strong className="tenant-net-value">{formatMoney(net.toString())}</strong><div className="aging-bars">{[{ label: 'Current', amount: open - overdue, color: 'age-current' }, { label: '1–30 days', amount: overdue * 48n / 100n, color: 'age-one' }, { label: '31–60 days', amount: overdue * 29n / 100n, color: 'age-two' }, { label: '61–90 days', amount: overdue * 15n / 100n, color: 'age-three' }, { label: '90+ days', amount: overdue - overdue * 48n / 100n - overdue * 29n / 100n - overdue * 15n / 100n, color: 'age-four' }].map((bucket) => <div className="aging-bar-row" key={bucket.label}><span>{bucket.label}</span><div><i className={bucket.color} style={{ width: `${open > 0n ? Number(bucket.amount * 100n / open) : 0}%` }} /></div><strong>{formatMoney(bucket.amount.toString())}</strong></div>)}</div><div className="tenant-panel-foot"><span>Open AR</span><strong>{formatMoney(organization.openMinor)}</strong></div></article><article className="prototype-data-panel tenant-queue-panel"><div className="prototype-panel-heading"><div><h2>Collector queue</h2><p>Prioritized for your team</p></div><button className="prototype-link-button" onClick={() => setActivePage('Collections')} type="button">View queue →</button></div>{hasDemoLedger ? <><QueueRow name="Apex Retail Group" details="3 invoices · 42 days overdue" amount="₦8,240,000" initials="A" tone="queue-sand" /><QueueRow name="Meridian Wholesale" details="Broken promise · 28 days overdue" amount="₦4,120,000" initials="M" tone="queue-blue" /><QueueRow name="Coastal Supply Co." details="2 invoices · 16 days overdue" amount="₦2,460,000" initials="C" tone="queue-green" /></> : <div className="prototype-queue-empty">Your team&apos;s next actions will appear here once you import receivables.</div>}<div className="tenant-panel-foot"><span>Net exposure</span><strong>{formatMoney(net.toString())}</strong></div></article><article className="prototype-data-panel tenant-activity-panel"><div className="prototype-panel-heading"><div><h2>Recent activity</h2><p>Across your finance workspace</p></div><span className="activity-period">Today</span></div>{hasDemoLedger ? <><ActivityRow time="09:42" title="Receipt confirmed" detail="₦2,450,000 · Apex Retail Group" /><ActivityRow time="09:18" title="Promise to pay logged" detail="Meridian Wholesale · 28 Nov" /><ActivityRow time="Yesterday" title="Invoice import reconciled" detail="42 invoices · November cutoff" /></> : <div className="prototype-queue-empty">Imports, receipts, and team actions will appear here.</div>}</article><article className="prototype-data-panel tenant-cash-panel"><div className="prototype-panel-heading"><div><h2>Cash position</h2><p>Confirmed funds awaiting allocation</p></div><span className="cash-mark">↔</span></div><strong className="tenant-cash-value">{formatMoney(organization.unappliedMinor)}</strong><div className="tenant-cash-bar"><i style={{ width: organization.unappliedMinor === '0' ? '0%' : '62%' }} /></div><div className="tenant-cash-foot"><span>Available to allocate</span><span>Confirmed only</span></div><button className="prototype-link-button" onClick={() => setActivePage('Payments')} type="button">Review payments →</button></article></section> : <section className="prototype-data-panel tenant-section-panel"><div className="prototype-panel-heading"><div><h2>{selectedPage} at a glance</h2><p>Explore this workspace with sample data and responsive controls.</p></div><span className="prototype-section-icon">{tenantNavigation.find((item) => item.label === selectedPage)?.glyph ?? '◫'}</span></div><div className="tenant-section-highlights"><div><small>WORKSPACE</small><strong>{organization.name}</strong></div><div><small>OPEN RECEIVABLES</small><strong>{formatMoney(organization.openMinor)}</strong></div><div><small>TEAM ACCESS</small><strong>{user.name} · Admin</strong></div></div><div className="tenant-section-empty"><span>↗</span><strong>{selectedPage} demo view</strong><p>This section is ready for the next prototype pass. Your tenant context and sample ledger remain available here.</p><button className="prototype-secondary-button" onClick={() => setActivePage('Overview')} type="button">Back to overview</button></div></section>}
    <p className="prototype-data-caption"><span className="json-dot" />Organization-scoped demo data · Prototype only, not connected to live financial records.</p>
  </div>;
}

function QueueRow({ name, details, amount, initials, tone }: { name: string; details: string; amount: string; initials: string; tone: string }) {
  return <div className="tenant-queue-row"><span className={`tenant-queue-avatar ${tone}`}>{initials}</span><span className="tenant-queue-copy"><strong>{name}</strong><small>{details}</small></span><strong className="tenant-queue-amount">{amount}</strong></div>;
}

function ActivityRow({ time, title, detail }: { time: string; title: string; detail: string }) {
  return <div className="tenant-activity-row"><span className="activity-check">✓</span><span><strong>{title}</strong><small>{detail}</small></span><time>{time}</time></div>;
}
