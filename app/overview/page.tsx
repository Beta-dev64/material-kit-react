import { AppShell } from '@/app/components/app-shell';
import { OverviewDashboard } from '@/app/components/overview-dashboard';
import { getActiveOrganizationContext } from '@/lib/auth/organization';
import { getDashboardData } from '@/lib/db/dashboard';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const organization = await getActiveOrganizationContext();
  const data = await getDashboardData(organization.organizationId);

  return (
    <AppShell organizationName={organization.organizationName} userName={organization.userName}>
      <OverviewDashboard data={data} />
    </AppShell>
  );
}
