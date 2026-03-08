import { useState } from 'react';
import './shared-page.css';

const mockOrders = [
  { id: 1, orderNum: 'LAB-2026-041', patient: 'Ekaterina Sokolova', initials: 'ES', lab: 'DentaPro Lab', testType: 'Crown Fabrication', ordered: '05 Mar 2026', expected: '15 Mar 2026', status: 'in-progress' },
  { id: 2, orderNum: 'LAB-2026-040', patient: 'Mikhail Petrov', initials: 'MP', lab: 'OrthoTech', testType: 'Aligner Set', ordered: '04 Mar 2026', expected: '18 Mar 2026', status: 'sent' },
  { id: 3, orderNum: 'LAB-2026-039', patient: 'Anna Volkova', initials: 'AV', lab: 'DentaPro Lab', testType: 'Veneer Set (6 pcs)', ordered: '01 Mar 2026', expected: '10 Mar 2026', status: 'ready' },
  { id: 4, orderNum: 'LAB-2026-038', patient: 'Dmitry Novikov', initials: 'DN', lab: 'ImplantLab', testType: 'Implant Abutment', ordered: '28 Feb 2026', expected: '08 Mar 2026', status: 'delivered' },
  { id: 5, orderNum: 'LAB-2026-037', patient: 'Olga Smirnova', initials: 'OS', lab: 'OrthoTech', testType: 'Retainer Plate', ordered: '25 Feb 2026', expected: '07 Mar 2026', status: 'ready' },
  { id: 6, orderNum: 'LAB-2026-036', patient: 'Pavel Kozlov', initials: 'PK', lab: 'DentaPro Lab', testType: 'Partial Denture', ordered: '20 Feb 2026', expected: '12 Mar 2026', status: 'in-progress' },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  sent: { label: 'Sent', cls: 'sp-badge-blue' },
  'in-progress': { label: 'In Progress', cls: 'sp-badge-orange' },
  ready: { label: 'Ready', cls: 'sp-badge-green' },
  delivered: { label: 'Delivered', cls: 'sp-badge-gray' },
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Labs() {
  const [search, setSearch] = useState('');

  const filtered = mockOrders.filter(o =>
    o.patient.toLowerCase().includes(search.toLowerCase()) ||
    o.orderNum.toLowerCase().includes(search.toLowerCase()) ||
    o.lab.toLowerCase().includes(search.toLowerCase())
  );

  const activeOrders = mockOrders.filter(o => o.status === 'sent' || o.status === 'in-progress').length;
  const readyOrders = mockOrders.filter(o => o.status === 'ready').length;
  const thisMonth = mockOrders.length;

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Lab Orders</h1>
          <p>Track lab orders and receive results from dental laboratories</p>
        </div>
        <button className="sp-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Order
        </button>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{activeOrders}</div>
          <div className="sp-stat-label">Active Orders</div>
          <div className="sp-stat-trend up">In production</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{readyOrders}</div>
          <div className="sp-stat-label">Ready for Pickup</div>
          <div className="sp-stat-trend down">Awaiting delivery</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{thisMonth}</div>
          <div className="sp-stat-label">This Month</div>
          <div className="sp-stat-trend up">↑ 4 vs last month</div>
        </div>
      </div>

      <div>
        <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
          <div className="sp-search">
            <SearchIcon />
            <input
              placeholder="Search orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sp-table-card">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Patient</th>
                <th>Lab</th>
                <th>Test Type</th>
                <th>Ordered</th>
                <th>Expected</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="sp-empty">No lab orders found</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary-deep-teal)' }}>{o.orderNum}</td>
                  <td>
                    <div className="sp-patient-cell">
                      <div className="sp-avatar">{o.initials}</div>
                      <span className="sp-patient-name">{o.patient}</span>
                    </div>
                  </td>
                  <td>{o.lab}</td>
                  <td>{o.testType}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{o.ordered}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{o.expected}</td>
                  <td><span className={`sp-badge ${statusMap[o.status].cls}`}>{statusMap[o.status].label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
