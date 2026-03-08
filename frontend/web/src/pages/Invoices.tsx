import { useState } from 'react';
import './shared-page.css';

const mockInvoices = [
  { id: 1, num: 'INV-2026-018', patient: 'Ekaterina Sokolova', initials: 'ES', services: 3, total: 12500, issued: '08 Mar 2026', due: '22 Mar 2026', status: 'unpaid' },
  { id: 2, num: 'INV-2026-017', patient: 'Mikhail Petrov', initials: 'MP', services: 1, total: 6000, issued: '07 Mar 2026', due: '21 Mar 2026', status: 'paid' },
  { id: 3, num: 'INV-2026-016', patient: 'Anna Volkova', initials: 'AV', services: 5, total: 58000, issued: '05 Mar 2026', due: '19 Mar 2026', status: 'unpaid' },
  { id: 4, num: 'INV-2026-015', patient: 'Dmitry Novikov', initials: 'DN', services: 2, total: 8500, issued: '01 Mar 2026', due: '15 Mar 2026', status: 'overdue' },
  { id: 5, num: 'INV-2026-014', patient: 'Olga Smirnova', initials: 'OS', services: 1, total: 3200, issued: '26 Feb 2026', due: '12 Mar 2026', status: 'paid' },
  { id: 6, num: 'INV-2026-013', patient: 'Pavel Kozlov', initials: 'PK', services: 4, total: 22000, issued: '20 Feb 2026', due: '06 Mar 2026', status: 'cancelled' },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  unpaid: { label: 'Unpaid', cls: 'sp-badge-orange' },
  paid: { label: 'Paid', cls: 'sp-badge-green' },
  overdue: { label: 'Overdue', cls: 'sp-badge-red' },
  cancelled: { label: 'Cancelled', cls: 'sp-badge-gray' },
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Invoices() {
  const [search, setSearch] = useState('');

  const filtered = mockInvoices.filter(i =>
    i.patient.toLowerCase().includes(search.toLowerCase()) ||
    i.num.toLowerCase().includes(search.toLowerCase())
  );

  const total = mockInvoices.reduce((s, i) => s + i.total, 0);
  const paid = mockInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const unpaid = mockInvoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.total, 0);
  const overdue = mockInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Invoices</h1>
          <p>Track and manage patient invoices and payments</p>
        </div>
        <button className="sp-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Invoice
        </button>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ fontSize: '20px' }}>{formatCurrency(total)}</div>
          <div className="sp-stat-label">Total Invoiced</div>
          <div className="sp-stat-trend up">This month</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ fontSize: '20px', color: '#1a7a4a' }}>{formatCurrency(paid)}</div>
          <div className="sp-stat-label">Paid</div>
          <div className="sp-stat-trend up">↑ On time</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ fontSize: '20px', color: '#aa5a1a' }}>{formatCurrency(unpaid)}</div>
          <div className="sp-stat-label">Unpaid</div>
          <div className="sp-stat-trend down">Awaiting payment</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ fontSize: '20px', color: '#aa1a1a' }}>{formatCurrency(overdue)}</div>
          <div className="sp-stat-label">Overdue</div>
          <div className="sp-stat-trend down">Action required</div>
        </div>
      </div>

      <div>
        <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
          <div className="sp-search">
            <SearchIcon />
            <input
              placeholder="Search invoices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sp-table-card">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient</th>
                <th>Services</th>
                <th>Total</th>
                <th>Issued</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="sp-empty">No invoices found</td></tr>
              ) : filtered.map(i => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary-deep-teal)' }}>{i.num}</td>
                  <td>
                    <div className="sp-patient-cell">
                      <div className="sp-avatar">{i.initials}</div>
                      <span className="sp-patient-name">{i.patient}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{i.services} {i.services === 1 ? 'service' : 'services'}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(i.total)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{i.issued}</td>
                  <td style={{ color: i.status === 'overdue' ? '#aa1a1a' : 'var(--text-secondary)' }}>{i.due}</td>
                  <td><span className={`sp-badge ${statusMap[i.status].cls}`}>{statusMap[i.status].label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="sp-action-btn">View</button>
                      {i.status === 'unpaid' && <button className="sp-action-btn">Mark Paid</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
