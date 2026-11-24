import 'server-only';

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export type CollectorItem = {
  customerId: string;
  customerName: string;
  customerNumber: string;
  openMinor: string;
  overdueMinor: string;
  overdueInvoices: number;
};

export type DashboardData = {
  currency: string;
  openMinor: string;
  overdueMinor: string;
  disputedMinor: string;
  unappliedMinor: string;
  aging: { label: string; amountMinor: string }[];
  collectors: CollectorItem[];
  activity: { id: string; action: string; entityType: string; createdAt: string }[];
};

export async function getDashboardData(organizationId: string): Promise<DashboardData> {

  const result = await db.execute(sql`
    WITH allocation_totals AS (
      SELECT invoice_id, organization_id, SUM(amount_minor) AS allocated_minor
      FROM kredia_allocations
      WHERE organization_id = ${organizationId}::uuid
      GROUP BY invoice_id, organization_id
    ),
    credit_totals AS (
      SELECT invoice_id, organization_id, SUM(amount_minor) AS credited_minor
      FROM kredia_credit_notes
      WHERE organization_id = ${organizationId}::uuid
        AND status = 'issued'
        AND invoice_id IS NOT NULL
      GROUP BY invoice_id, organization_id
    ),
    invoice_balances AS (
      SELECT
        i.id,
        i.customer_id,
        i.due_at,
        GREATEST(i.total_minor - COALESCE(a.allocated_minor, 0) - COALESCE(c.credited_minor, 0), 0)::bigint AS balance_minor
      FROM kredia_invoices AS i
      LEFT JOIN allocation_totals AS a
        ON a.invoice_id = i.id AND a.organization_id = i.organization_id
      LEFT JOIN credit_totals AS c
        ON c.invoice_id = i.id AND c.organization_id = i.organization_id
      WHERE i.organization_id = ${organizationId}::uuid
        AND i.status NOT IN ('draft', 'void')
    ),
    aging AS (
      SELECT
        CASE
          WHEN due_at >= CURRENT_DATE THEN 'Current'
          WHEN due_at >= CURRENT_DATE - 30 THEN '1–30 days'
          WHEN due_at >= CURRENT_DATE - 60 THEN '31–60 days'
          WHEN due_at >= CURRENT_DATE - 90 THEN '61–90 days'
          ELSE '90+ days'
        END AS label,
        SUM(GREATEST(balance_minor, 0))::text AS amount_minor,
        CASE
          WHEN due_at >= CURRENT_DATE THEN 1
          WHEN due_at >= CURRENT_DATE - 30 THEN 2
          WHEN due_at >= CURRENT_DATE - 60 THEN 3
          WHEN due_at >= CURRENT_DATE - 90 THEN 4
          ELSE 5
        END AS sort_order
      FROM invoice_balances
      WHERE balance_minor > 0
      GROUP BY label, sort_order
    ),
    collector_queue AS (
      SELECT
        c.id AS customer_id,
        c.name AS customer_name,
        c.customer_number,
        SUM(GREATEST(b.balance_minor, 0))::text AS open_minor,
        SUM(CASE WHEN b.due_at < CURRENT_DATE THEN GREATEST(b.balance_minor, 0) ELSE 0 END)::text AS overdue_minor,
        COUNT(*) FILTER (WHERE b.due_at < CURRENT_DATE AND b.balance_minor > 0)::int AS overdue_invoices
      FROM invoice_balances AS b
      JOIN kredia_customers AS c
        ON c.id = b.customer_id
        AND c.organization_id = ${organizationId}::uuid
      WHERE b.balance_minor > 0
      GROUP BY c.id, c.name, c.customer_number
      ORDER BY SUM(CASE WHEN b.due_at < CURRENT_DATE THEN GREATEST(b.balance_minor, 0) ELSE 0 END) DESC,
        SUM(GREATEST(b.balance_minor, 0)) DESC
      LIMIT 5
    )
    SELECT
      COALESCE((SELECT base_currency FROM kredia_organization_settings WHERE organization_id = ${organizationId}::uuid), 'NGN') AS currency,
      COALESCE((SELECT SUM(balance_minor) FROM invoice_balances WHERE balance_minor > 0), 0)::text AS open_minor,
      COALESCE((SELECT SUM(balance_minor) FROM invoice_balances WHERE balance_minor > 0 AND due_at < CURRENT_DATE), 0)::text AS overdue_minor,
      COALESCE((
        SELECT SUM(d.amount_minor)
        FROM kredia_disputes AS d
        WHERE d.organization_id = ${organizationId}::uuid
          AND d.status IN ('open', 'under_review')
      ), 0)::text AS disputed_minor,
      COALESCE((
        SELECT SUM(r.amount_minor - COALESCE(a.allocated_minor, 0))
        FROM kredia_receipts AS r
        LEFT JOIN (
          SELECT receipt_id, SUM(amount_minor) AS allocated_minor
          FROM kredia_allocations
          WHERE organization_id = ${organizationId}::uuid
          GROUP BY receipt_id
        ) AS a ON a.receipt_id = r.id
        WHERE r.organization_id = ${organizationId}::uuid
          AND r.status = 'confirmed'
          AND r.amount_minor > COALESCE(a.allocated_minor, 0)
      ), 0)::text AS unapplied_minor,
      COALESCE((SELECT json_agg(json_build_object('label', label, 'amountMinor', amount_minor) ORDER BY sort_order) FROM aging), '[]'::json) AS aging,
      COALESCE((SELECT json_agg(json_build_object(
        'customerId', customer_id,
        'customerName', customer_name,
        'customerNumber', customer_number,
        'openMinor', open_minor,
        'overdueMinor', overdue_minor,
        'overdueInvoices', overdue_invoices
      )) FROM collector_queue), '[]'::json) AS collectors
  `);

  const activityResult = await db.execute(sql`
    SELECT id::text AS id, action, entity_type, created_at::text AS created_at
    FROM kredia_audit_events
    WHERE organization_id = ${organizationId}::uuid
    ORDER BY created_at DESC
    LIMIT 5
  `);

  const row = result.rows[0] as {
    currency: string;
    open_minor: string;
    overdue_minor: string;
    disputed_minor: string;
    unapplied_minor: string;
    aging: { label: string; amountMinor: string }[];
    collectors: CollectorItem[];
  };

  return {
    currency: row.currency.trim(),
    openMinor: row.open_minor,
    overdueMinor: row.overdue_minor,
    disputedMinor: row.disputed_minor,
    unappliedMinor: row.unapplied_minor,
    aging: row.aging,
    collectors: row.collectors,
    activity: activityResult.rows.map((event) => {
      const activity = event as { id: string; action: string; entity_type: string; created_at: string };
      return {
        id: activity.id,
        action: activity.action,
        entityType: activity.entity_type,
        createdAt: activity.created_at,
      };
    }),
  };
}
