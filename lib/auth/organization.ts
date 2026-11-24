import 'server-only';

import { sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';

export async function getOrganizationsForCurrentUser() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  const result = await db.execute(sql`
    SELECT o.id::text AS id, o.name
    FROM neon_auth.organization AS o
    INNER JOIN neon_auth.member AS m
      ON m."organizationId" = o.id
    WHERE m."userId" = ${session.user.id}::uuid
    ORDER BY o.name
  `);

  return result.rows as { id: string; name: string }[];
}

export async function getActiveOrganizationContext() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  const activeOrganizationId = (session.session as typeof session.session & { activeOrganizationId?: string | null })
    .activeOrganizationId;
  if (!activeOrganizationId) redirect('/workspace-setup');

  const membership = await db.execute(sql`
    SELECT o.id::text AS id, o.name, m.role
    FROM neon_auth.organization AS o
    INNER JOIN neon_auth.member AS m
      ON m."organizationId" = o.id
    WHERE o.id = ${activeOrganizationId}::uuid
      AND m."userId" = ${session.user.id}::uuid
    LIMIT 1
  `);

  const row = membership.rows[0] as { id: string; name: string; role: string } | undefined;
  if (!row) redirect('/workspace-setup');

  return {
    userId: session.user.id,
    organizationId: row.id,
    organizationName: row.name,
    userName: session.user.name,
    role: row.role,
  };
}
