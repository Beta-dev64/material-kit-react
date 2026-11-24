import { notFound } from 'next/navigation';

import { AppShell } from '@/app/components/app-shell';
import { CollectionQueue } from '@/app/components/collection-queue';
import { SectionRecords } from '@/app/components/section-records';
import { getActiveOrganizationContext } from '@/lib/auth/organization';
import { getSectionRecords } from '@/lib/db/sections';

export const dynamic = 'force-dynamic';

const sections: Record<string, { title: string; description: string; icon: string; action?: string }> = {
  collections: { title: 'Collections', description: 'A focused daily queue for follow-ups, promises to pay, and customer activity.', icon: '↗' },
  customers: { title: 'Customers', description: 'Customer profiles, account balances, wallet details, and relationship history.', icon: '◎' },
  invoices: { title: 'Invoices', description: 'Create, review, and track frozen receivables with a complete payment trail.', icon: '▤', action: 'Create invoice' },
  payments: { title: 'Payments', description: 'Review incoming receipts, confirm funds, and allocate cash to open invoices.', icon: '↔', action: 'Record receipt' },
  imports: { title: 'Imports & reconciliation', description: 'Preview a customer or invoice file, correct row-level issues, then reconcile to a declared cutoff balance.', icon: '⇧', action: 'Start an import' },
  disputes: { title: 'Disputes', description: 'Track contested balances, owners, deadlines, and resolution history.', icon: '!' },
  approvals: { title: 'Approvals', description: 'Review staged financial actions before they are applied to the ledger.', icon: '✓' },
};

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const content = sections[section];
  if (!content) notFound();

  const organization = await getActiveOrganizationContext();
  const records = await getSectionRecords(section, organization.organizationId);

  return (
    <AppShell organizationName={organization.organizationName} userName={organization.userName}>
      <div className="section-page">
        <div className="page-heading-row">
          <div><p className="eyebrow">WORKSPACE</p><h1>{content.title}</h1><p className="page-subtitle">{content.description}</p></div>
          {content.action && <button className="button button-primary" type="button"><span aria-hidden="true">＋</span> {content.action}</button>}
        </div>
        {section === 'collections' ? <CollectionQueue records={records} /> : <SectionRecords records={records} title={content.title} />}
      </div>
    </AppShell>
  );
}
