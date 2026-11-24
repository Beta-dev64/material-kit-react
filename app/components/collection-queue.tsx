'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { SectionRecords } from '@/lib/db/sections';

function money(value: string, currency: string) {
  try {
    const minor = BigInt(value || '0');
    const digits = new Intl.NumberFormat('en-NG', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
    const scale = 10n ** BigInt(digits);
    const symbol = new Intl.NumberFormat('en-NG', { style: 'currency', currency }).formatToParts(0).find((part) => part.type === 'currency')?.value ?? currency;
    const decimal = new Intl.NumberFormat('en-NG', { style: 'currency', currency }).formatToParts(0).find((part) => part.type === 'decimal')?.value ?? '.';
    const whole = new Intl.NumberFormat('en-NG').format(minor / scale);
    return `${symbol}${whole}${digits ? `${decimal}${(minor % scale).toString().padStart(digits, '0')}` : ''}`;
  } catch {
    return '—';
  }
}

export function CollectionQueue({ records }: { records: SectionRecords }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue'>('all');
  const customers = useMemo(() => records.rows.filter((row) => {
    const matchesQuery = `${row.customerName} ${row.customerNumber}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (filter === 'all' || Number(row.overdueInvoices) > 0);
  }), [filter, query, records.rows]);
  const overdueCount = records.rows.filter((row) => Number(row.overdueInvoices) > 0).length;

  return (
    <section aria-label="Collections work queue" className="collection-workspace">
      <div className="collection-toolbar">
        <div className="collection-filters" aria-label="Queue filter" role="group">
          <button aria-pressed={filter === 'all'} className={filter === 'all' ? 'collection-filter-active' : ''} onClick={() => setFilter('all')} type="button">All customers <span>{records.rows.length}</span></button>
          <button aria-pressed={filter === 'overdue'} className={filter === 'overdue' ? 'collection-filter-active' : ''} onClick={() => setFilter('overdue')} type="button">Past due <span>{overdueCount}</span></button>
        </div>
        <label className="collection-search"><span className="sr-only">Search customers</span><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg><input onChange={(event) => setQuery(event.target.value)} placeholder="Find a customer" type="search" value={query} /></label>
      </div>
      {customers.length ? (
        <div className="records-scroll">
          <table className="records-table collection-table">
            <thead><tr><th scope="col">Customer</th><th scope="col">Past-due invoices</th><th scope="col">Open balance</th><th scope="col">Past due</th><th scope="col">Queue status</th><th scope="col"><span className="sr-only">Customer details</span></th></tr></thead>
            <tbody>{customers.map((row) => {
              const overdue = Number(row.overdueInvoices) > 0;
              return <tr key={row.customerId}>
                <td><Link className="collection-customer" href={`/customers/${row.customerId}`}><span className="collection-avatar">{row.customerName.slice(0, 1).toUpperCase()}</span><span><strong>{row.customerName}</strong><small>{row.customerNumber}</small></span></Link></td>
                <td>{row.overdueInvoices} past-due</td>
                <td className="collection-money">{money(row.openMinor, records.currency)}</td>
                <td className="collection-money">{money(row.overdueMinor, records.currency)}</td>
                <td><span className={`status-pill ${overdue ? 'status-open' : 'status-active'}`}>{overdue ? 'Follow up' : 'Current'}</span></td>
                <td><Link aria-label={`View ${row.customerName}`} className="collection-row-link" href={`/customers/${row.customerId}`}>View <span aria-hidden="true">→</span></Link></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      ) : (
        <div className="collection-empty"><span aria-hidden="true">✓</span><strong>{query ? 'No matching customers' : filter === 'overdue' ? 'No overdue customers' : 'Your queue is clear'}</strong><p>{query ? 'Try another customer name or ID.' : filter === 'overdue' ? 'There are no past-due balances to follow up today.' : 'Customers with open receivables will appear here.'}</p></div>
      )}
      <p className="records-note">Prioritized by past-due exposure. Customer balances are derived from posted invoices, allocations, and issued credits.</p>
    </section>
  );
}
