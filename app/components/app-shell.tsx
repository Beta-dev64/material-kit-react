'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { authClient } from '@/lib/auth/client';

const navigation = [
  { label: 'Overview', href: '/overview', icon: 'grid' },
  { label: 'Collections', href: '/collections', icon: 'layers' },
  { label: 'Customers', href: '/customers', icon: 'users' },
  { label: 'Invoices', href: '/invoices', icon: 'file' },
  { label: 'Payments', href: '/payments', icon: 'card' },
  { label: 'Imports & reconciliation', href: '/imports', icon: 'import' },
  { label: 'Disputes', href: '/disputes', icon: 'alert' },
  { label: 'Approvals', href: '/approvals', icon: 'check' },
];

function NavigationIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.3" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.3" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.3" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.3" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" /><circle cx="9.5" cy="7" r="3.5" /><path d="M17 11a3.5 3.5 0 1 0-1-6.9M21 20v-1.5a4 4 0 0 0-3-3.9" /></>,
    file: <><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" /><path d="M13 3v7h7M8 15h8M8 18h6" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
    import: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /></>,
    alert: <><path d="M10.3 4.3 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 3h.01" /></>,
    check: <><path d="M20 11.1V12a8 8 0 1 1-4.7-7.3" /><path d="m8.5 11.5 3.2 3.2L21 5.5" /></>,
  };
  return <svg aria-hidden="true" className="nav-icon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">{paths[name]}</svg>;
}

export function AppShell({ children, organizationName, userName }: { children: React.ReactNode; organizationName: string; userName: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    await authClient.signOut();
    window.location.assign('/auth/sign-in');
  }

  return (
    <div className="app-frame">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <Link aria-label="Kredia overview" className="brand-lockup" href="/overview">
          <Image alt="" height={44} priority src="/branding/kredia-logo.png" width={155} />
        </Link>
        <div className="workspace-switcher">
          <span className="workspace-mark">{organizationName.slice(0, 1).toUpperCase()}</span>
          <span className="workspace-copy"><strong>{organizationName}</strong><small>Finance workspace</small></span>
          <span aria-hidden="true" className="switch-chevron">⌄</span>
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav aria-label="Main navigation" className="primary-nav">
          {navigation.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link aria-current={active ? 'page' : undefined} className={`nav-link ${active ? 'nav-link-active' : ''}`} href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
                <NavigationIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">?</span>
            <div><strong>Need a hand?</strong><span>Visit the help centre</span></div>
            <span aria-hidden="true">↗</span>
          </div>
          <button aria-label="Sign out from Kredia" className="profile-button" onClick={signOut} type="button">
            <span aria-hidden="true" className="profile-avatar">{userName.slice(0, 1).toUpperCase()}</span>
            <span className="profile-copy"><strong>{userName}</strong><small>Sign out</small></span>
            <span aria-hidden="true" className="profile-menu">•••</span>
          </button>
        </div>
      </aside>
      {menuOpen && <button aria-label="Close navigation" className="sidebar-scrim" onClick={() => setMenuOpen(false)} type="button" />}
      <div className="main-column">
        <header className="topbar">
          <button aria-expanded={menuOpen} aria-label="Toggle navigation" className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} type="button"><span /><span /><span /></button>
          <div aria-label="Breadcrumb" className="breadcrumb"><span>Kredia</span><span className="breadcrumb-divider">/</span><strong>{navigation.find((item) => item.href === pathname)?.label ?? 'Workspace'}</strong></div>
          <div className="topbar-actions">
            <button aria-label="Search" className="icon-button" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg></button>
            <button aria-label="Notifications" className="icon-button notification-button" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg><i /></button>
            <button aria-label="Sign out from Kredia" className="topbar-signout" onClick={signOut} type="button">Sign out</button>
            <span aria-hidden="true" className="topbar-avatar">{userName.slice(0, 1).toUpperCase()}</span>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
