import type { DashboardData } from '@/lib/db/dashboard';

import Link from 'next/link';
import { PageMotion } from '@/app/components/page-motion';

function money(minor: string, currency: string) {
  let amount: bigint;
  try {
    amount = BigInt(minor || '0');
  } catch {
    amount = 0n;
  }

  const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency });
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  const divisor = 10n ** BigInt(digits);
  const parts = formatter.formatToParts(0);
  const symbol = parts.find((part) => part.type === 'currency')?.value ?? currency;
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const whole = new Intl.NumberFormat('en-NG').format(amount / divisor);
  const fraction = digits ? `${decimal}${(amount % divisor).toString().padStart(digits, '0')}` : '';

  return `${symbol}${whole}${fraction}`;
}

function share(amount: string, total: string) {
  const totalValue = BigInt(total || '0');
  if (totalValue <= 0n) return 0;
  const ratio = (BigInt(amount || '0') * 100n) / totalValue;
  return Number(ratio > 100n ? 100n : ratio);
}

function activityLabel(action: string) {
  return action
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function activityEntityLabel(entityType: string) {
  return entityType.replace(/[._-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function MetricCard({ label, value, note, accent, icon }: { label: string; value: string; note: string; accent: string; icon: string }) {
  return (
    <article className="metric-card">
      <div className="metric-topline">
        <span className="metric-label">{label}</span>
        <span aria-hidden="true" className={`metric-icon metric-icon-${accent}`}>{icon}</span>
      </div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-note">{note}</span>
    </article>
  );
}

export function OverviewDashboard({ data }: { data: DashboardData }) {
  const netExposure = (BigInt(data.openMinor || '0') - BigInt(data.unappliedMinor || '0')).toString();
  const today = new Intl.DateTimeFormat('en-NG', { dateStyle: 'full' }).format(new Date());

  return (
    <div className="dashboard-page">
      <PageMotion />
      <div className="page-heading-row" data-reveal>
        <div>
          <p className="eyebrow">{today}</p>
          <h1>Receivables overview</h1>
          <p className="page-subtitle">A steady view of what is due, what is moving, and what needs attention.</p>
        </div>
        <div className="heading-actions">
          <button className="button button-secondary" type="button"><span aria-hidden="true">⇩</span> Export report</button>
          <Link className="button button-primary" href="/invoices"><span aria-hidden="true">＋</span> New invoice</Link>
        </div>
      </div>

      <section aria-label="Receivables summary" className="metric-grid" data-reveal>
        <MetricCard accent="teal" icon="↗" label="Open receivables" note="Across posted invoices" value={money(data.openMinor, data.currency)} />
        <MetricCard accent="gold" icon="◷" label="Overdue" note="Requires follow-up" value={money(data.overdueMinor, data.currency)} />
        <MetricCard accent="rose" icon="!" label="Disputed exposure" note="Open and under review" value={money(data.disputedMinor, data.currency)} />
        <MetricCard accent="blue" icon="↔" label="Unapplied cash" note="Confirmed receipts" value={money(data.unappliedMinor, data.currency)} />
      </section>

      <section aria-label="Receivables insights" className="insight-grid" data-reveal>
        <article className="panel aging-panel">
          <div className="panel-heading">
            <div><h2>Aging overview</h2><p>Outstanding balance by days past due</p></div>
            <span className="panel-period">As of today <span aria-hidden="true">⌄</span></span>
          </div>
          <div className="aging-summary">
            <div><span className="aging-total-label">Net exposure</span><strong>{money(netExposure, data.currency)}</strong></div>
            <span className="reconciled-badge"><i /> Ledger aligned</span>
          </div>
          {data.aging.length ? (
            <div aria-label="Aging distribution" className="aging-chart" role="img">
              {data.aging.map((bucket, index) => (
                <div className="aging-row" key={bucket.label}>
                  <span className="aging-label">{bucket.label}</span>
                  <div className="aging-track"><span className={`aging-fill aging-fill-${index + 1}`} style={{ width: `${share(bucket.amountMinor, data.openMinor)}%` }} /></div>
                  <strong className="aging-amount">{money(bucket.amountMinor, data.currency)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state compact-empty"><span className="empty-orbit">↗</span><strong>No receivables to age yet</strong><span>Posted invoices will appear here as balances are created.</span></div>
          )}
          <div className="panel-footnote"><span>Open AR</span><strong>{money(data.openMinor, data.currency)}</strong></div>
        </article>

        <article className="panel queue-panel">
          <div className="panel-heading">
            <div><h2>Collector queue</h2><p>Prioritized work for today</p></div>
            <Link className="text-link" href="/collections">View queue <span aria-hidden="true">→</span></Link>
          </div>
          {data.collectors.length ? (
            <div className="queue-list">
              {data.collectors.map((item, index) => (
                <Link className="queue-item" href={`/customers/${item.customerId}`} key={item.customerId}>
                  <span className={`queue-avatar queue-avatar-${index + 1}`}>{item.customerName.slice(0, 1).toUpperCase()}</span>
                  <span className="queue-customer"><strong>{item.customerName}</strong><small>{item.customerNumber} · {item.overdueInvoices} overdue invoice{item.overdueInvoices === 1 ? '' : 's'}</small></span>
                  <span className="queue-amount"><strong>{money(item.overdueMinor, data.currency)}</strong><small>overdue</small></span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state queue-empty"><span className="empty-orbit">✓</span><strong>Your queue is clear</strong><span>There are no overdue customer balances in this workspace.</span></div>
          )}
          <div className="queue-footer"><span>Net exposure</span><strong>{money(netExposure, data.currency)}</strong></div>
        </article>
      </section>

      <section className="bottom-grid" data-reveal>
        <article className="panel activity-panel">
          <div className="panel-heading"><div><h2>Recent activity</h2><p>Latest events across your ledger</p></div><button aria-label="More activity options" className="more-button" type="button">•••</button></div>
          {data.activity.length ? (
            <div aria-label="Latest tenant activity" className="activity-list">
              {data.activity.map((event) => (
                <article className="activity-item" key={event.id}>
                  <span aria-hidden="true" className="activity-marker">{activityEntityLabel(event.entityType).slice(0, 1) || '•'}</span>
                  <span className="activity-copy">
                    <strong>{activityLabel(event.action)}</strong>
                    <span>{activityEntityLabel(event.entityType)}</span>
                  </span>
                  <time className="activity-time" dateTime={event.createdAt}>
                    {new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.createdAt))}
                  </time>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state activity-empty"><strong>Nothing new, for now</strong><span>Ledger changes recorded for this workspace will appear here.</span></div>
          )}
        </article>
        <article className="panel cash-panel">
          <div className="panel-heading"><div><h2>Cash position</h2><p>Confirmed funds awaiting allocation</p></div><span className="cash-icon">↔</span></div>
          <strong className="cash-total">{money(data.unappliedMinor, data.currency)}</strong>
          <div className="cash-progress"><span style={{ width: data.unappliedMinor === '0' ? '0%' : '100%' }} /></div>
          <div className="cash-caption"><span>Available to allocate</span><span>Confirmed only</span></div>
          <Link className="text-link cash-link" href="/payments">Review payments <span aria-hidden="true">→</span></Link>
        </article>
      </section>
    </div>
  );
}
