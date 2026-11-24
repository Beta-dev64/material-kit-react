import 'server-only';

import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { getDashboardData } from '@/lib/db/dashboard';

export type SectionColumn = { key: string; label: string; kind?: 'currency' | 'status' | 'date' };
export type SectionRow = Record<string, string>;
export type SectionRecords = { currency: string; columns: SectionColumn[]; rows: SectionRow[] };

function rowsOf<T extends SectionRow>(rows: unknown): T[] {
  return (rows ?? []) as T[];
}

export async function getSectionRecords(section: string, organizationId: string): Promise<SectionRecords> {
  const settings = await db.execute(sql`
    SELECT COALESCE((SELECT base_currency FROM kredia_organization_settings WHERE organization_id = ${organizationId}::uuid), 'NGN') AS currency
  `);
  const currency = String((settings.rows[0] as { currency: string }).currency).trim();

  if (section === 'customers') {
    const result = await db.execute(sql`
      WITH balances AS (
        SELECT i.customer_id,
          GREATEST(i.total_minor - COALESCE(a.allocated_minor, 0) - COALESCE(c.credited_minor, 0), 0)::text AS open_minor
        FROM kredia_invoices i
        LEFT JOIN (
          SELECT invoice_id, SUM(amount_minor) AS allocated_minor
          FROM kredia_allocations WHERE organization_id = ${organizationId}::uuid GROUP BY invoice_id
        ) a ON a.invoice_id = i.id
        LEFT JOIN (
          SELECT invoice_id, SUM(amount_minor) AS credited_minor
          FROM kredia_credit_notes WHERE organization_id = ${organizationId}::uuid AND status = 'issued' AND invoice_id IS NOT NULL GROUP BY invoice_id
        ) c ON c.invoice_id = i.id
        WHERE i.organization_id = ${organizationId}::uuid AND i.status NOT IN ('draft', 'void')
      )
      SELECT c.id::text AS id, c.customer_number, c.name, COALESCE(c.email, c.billing_email, '—') AS email,
        c.status, c.payment_terms_days::text AS terms,
        COALESCE(SUM(b.open_minor::bigint), 0)::text AS balance
      FROM kredia_customers c LEFT JOIN balances b ON b.customer_id = c.id
      WHERE c.organization_id = ${organizationId}::uuid
      GROUP BY c.id ORDER BY c.name LIMIT 100
    `);
    return {
      currency,
      columns: [
        { key: 'customer_number', label: 'Customer ID' }, { key: 'name', label: 'Customer' },
        { key: 'email', label: 'Contact' }, { key: 'terms', label: 'Terms' },
        { key: 'balance', label: 'Open balance', kind: 'currency' }, { key: 'status', label: 'Status', kind: 'status' },
      ],
      rows: rowsOf(result.rows),
    };
  }

  if (section === 'invoices') {
    const result = await db.execute(sql`
      SELECT i.id::text AS id, i.invoice_number, c.name AS customer,
        COALESCE(to_char(i.issued_at, 'DD Mon YYYY'), 'Draft') AS issued,
        to_char(i.due_at, 'DD Mon YYYY') AS due,
        GREATEST(i.total_minor - COALESCE(a.allocated_minor, 0) - COALESCE(cn.credited_minor, 0), 0)::text AS balance,
        i.status
      FROM kredia_invoices i
      JOIN kredia_customers c ON c.id = i.customer_id AND c.organization_id = i.organization_id
      LEFT JOIN (
        SELECT invoice_id, SUM(amount_minor) AS allocated_minor
        FROM kredia_allocations WHERE organization_id = ${organizationId}::uuid GROUP BY invoice_id
      ) a ON a.invoice_id = i.id
      LEFT JOIN (
        SELECT invoice_id, SUM(amount_minor) AS credited_minor
        FROM kredia_credit_notes WHERE organization_id = ${organizationId}::uuid AND status = 'issued' AND invoice_id IS NOT NULL GROUP BY invoice_id
      ) cn ON cn.invoice_id = i.id
      WHERE i.organization_id = ${organizationId}::uuid
      ORDER BY i.created_at DESC LIMIT 100
    `);
    return {
      currency,
      columns: [
        { key: 'invoice_number', label: 'Invoice' }, { key: 'customer', label: 'Customer' },
        { key: 'issued', label: 'Issued', kind: 'date' }, { key: 'due', label: 'Due date', kind: 'date' },
        { key: 'balance', label: 'Open balance', kind: 'currency' }, { key: 'status', label: 'Status', kind: 'status' },
      ],
      rows: rowsOf(result.rows),
    };
  }

  if (section === 'payments') {
    const result = await db.execute(sql`
      SELECT r.id::text AS id, COALESCE(c.name, 'Unmatched customer') AS customer,
        r.reference, r.method, to_char(r.received_at, 'DD Mon YYYY') AS received,
        r.amount_minor::text AS amount, r.status,
        COALESCE(a.allocated_minor, 0)::text AS allocated
      FROM kredia_receipts r
      LEFT JOIN kredia_customers c ON c.id = r.customer_id AND c.organization_id = r.organization_id
      LEFT JOIN (
        SELECT receipt_id, SUM(amount_minor) AS allocated_minor
        FROM kredia_allocations WHERE organization_id = ${organizationId}::uuid GROUP BY receipt_id
      ) a ON a.receipt_id = r.id
      WHERE r.organization_id = ${organizationId}::uuid
      ORDER BY r.received_at DESC LIMIT 100
    `);
    return {
      currency,
      columns: [
        { key: 'reference', label: 'Reference' }, { key: 'customer', label: 'Customer' },
        { key: 'received', label: 'Received', kind: 'date' }, { key: 'method', label: 'Method' },
        { key: 'amount', label: 'Amount', kind: 'currency' }, { key: 'allocated', label: 'Allocated', kind: 'currency' },
        { key: 'status', label: 'Status', kind: 'status' },
      ],
      rows: rowsOf(result.rows),
    };
  }

  if (section === 'disputes') {
    const result = await db.execute(sql`
      SELECT d.id::text AS id, i.invoice_number, c.name AS customer, d.reason,
        d.amount_minor::text AS amount, d.status, to_char(d.opened_at, 'DD Mon YYYY') AS opened
      FROM kredia_disputes d
      JOIN kredia_invoices i ON i.id = d.invoice_id AND i.organization_id = d.organization_id
      JOIN kredia_customers c ON c.id = i.customer_id AND c.organization_id = i.organization_id
      WHERE d.organization_id = ${organizationId}::uuid
      ORDER BY d.opened_at DESC LIMIT 100
    `);
    return {
      currency,
      columns: [
        { key: 'invoice_number', label: 'Invoice' }, { key: 'customer', label: 'Customer' },
        { key: 'reason', label: 'Reason' }, { key: 'amount', label: 'Contested amount', kind: 'currency' },
        { key: 'opened', label: 'Opened', kind: 'date' }, { key: 'status', label: 'Status', kind: 'status' },
      ],
      rows: rowsOf(result.rows),
    };
  }

  if (section === 'approvals') {
    const result = await db.execute(sql`
      SELECT id::text AS id, action_type, entity_type, entity_id::text AS entity_id,
        state, to_char(created_at, 'DD Mon YYYY') AS requested
      FROM kredia_approval_queue
      WHERE organization_id = ${organizationId}::uuid
      ORDER BY created_at DESC LIMIT 100
    `);
    return {
      currency,
      columns: [
        { key: 'action_type', label: 'Requested action' }, { key: 'entity_type', label: 'Record type' },
        { key: 'entity_id', label: 'Record ID' }, { key: 'requested', label: 'Requested', kind: 'date' },
        { key: 'state', label: 'Review status', kind: 'status' },
      ],
      rows: rowsOf(result.rows),
    };
  }

  if (section === 'imports') {
    const result = await db.execute(sql`
      SELECT id::text AS id, filename, currency, declared_total_minor::text AS declared_total,
        row_count::text AS row_count, valid_count::text AS valid_count, state,
        COALESCE(to_char(cutoff_date, 'DD Mon YYYY'), '—') AS cutoff,
        to_char(created_at, 'DD Mon YYYY') AS created
      FROM kredia_import_batches
      WHERE organization_id = ${organizationId}::uuid
      ORDER BY created_at DESC LIMIT 100
    `);
    return {
      currency,
      columns: [
        { key: 'filename', label: 'File' }, { key: 'created', label: 'Uploaded', kind: 'date' },
        { key: 'row_count', label: 'Rows' }, { key: 'valid_count', label: 'Valid' },
        { key: 'declared_total', label: 'Declared total', kind: 'currency' },
        { key: 'cutoff', label: 'Cutoff' }, { key: 'state', label: 'State', kind: 'status' },
      ],
      rows: rowsOf(result.rows),
    };
  }

  if (section === 'collections') {
    const data = await getDashboardData(organizationId);
    return {
      currency,
      columns: [
        { key: 'customerName', label: 'Customer' }, { key: 'customerNumber', label: 'Customer ID' },
        { key: 'overdueInvoices', label: 'Past-due invoices' }, { key: 'openMinor', label: 'Total open', kind: 'currency' },
        { key: 'overdueMinor', label: 'Past due', kind: 'currency' },
      ],
      rows: data.collectors.map((item) => ({
        customerId: item.customerId,
        customerName: item.customerName,
        customerNumber: item.customerNumber,
        overdueInvoices: String(item.overdueInvoices),
        openMinor: item.openMinor,
        overdueMinor: item.overdueMinor,
      })),
    };
  }

  return { currency, columns: [], rows: [] };
}
