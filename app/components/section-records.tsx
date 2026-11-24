import type { SectionRecords } from '@/lib/db/sections';

function formatMoney(value: string, currency: string) {
  try {
    const minor = BigInt(value || '0');
    const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency });
    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    const scale = 10n ** BigInt(digits);
    const parts = formatter.formatToParts(0);
    const symbol = parts.find((part) => part.type === 'currency')?.value ?? currency;
    const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
    return `${symbol}${new Intl.NumberFormat('en-NG').format(minor / scale)}${digits ? `${decimal}${(minor % scale).toString().padStart(digits, '0')}` : ''}`;
  } catch {
    return '—';
  }
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

export function SectionRecords({ records, title }: { records: SectionRecords; title: string }) {
  if (!records.rows.length) {
    return (
      <section className="section-card records-empty" aria-label={`${title} records`}>
        <span aria-hidden="true" className="section-illustration">✓</span>
        <h2>No {title.toLowerCase()} yet</h2>
        <p>When your organization has verified {title.toLowerCase()} records, they will appear here.</p>
      </section>
    );
  }

  return (
    <section className="records-card" aria-label={`${title} records`}>
      <div className="records-summary"><span>{records.rows.length} recent records</span><span>Organization-scoped ledger</span></div>
      <div className="records-scroll">
        <table className="records-table">
          <thead><tr>{records.columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
          <tbody>
            {records.rows.map((row, index) => (
              <tr key={row.id ?? `${row[records.columns[0]?.key] ?? title}-${index}`}>
                {records.columns.map((column) => {
                  const value = row[column.key] || '—';
                  return (
                    <td key={column.key}>
                      {column.kind === 'currency' ? formatMoney(value, records.currency) :
                        column.kind === 'status' ? <span className={`status-pill status-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{formatStatus(value)}</span> : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="records-note">Amounts use integer minor units and are formatted in {records.currency}. Results are limited to the latest 100 records.</p>
    </section>
  );
}
