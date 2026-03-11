
import './shared-page.css';

const mockRegistries = [
  { id: 1, regNum: 'INS-2026-003', period: 'February 2026', type: 'Public', records: 142, amount: 284000, submitted: '01 Mar 2026', status: 'accepted' },
  { id: 2, regNum: 'INS-2026-009', period: 'February 2026', type: 'Private', records: 38, amount: 95000, submitted: '02 Mar 2026', status: 'submitted' },
  { id: 3, regNum: 'INS-2026-002', period: 'January 2026', type: 'Public', records: 156, amount: 312000, submitted: '01 Feb 2026', status: 'accepted' },
  { id: 4, regNum: 'INS-2026-008', period: 'January 2026', type: 'Private', records: 45, amount: 112500, submitted: '03 Feb 2026', status: 'rejected' },
  { id: 5, regNum: 'INS-2026-001', period: 'December 2025', type: 'Public', records: 134, amount: 268000, submitted: '02 Jan 2026', status: 'accepted' },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'sp-badge-gray' },
  submitted: { label: 'Submitted', cls: 'sp-badge-blue' },
  accepted:  { label: 'Accepted',  cls: 'sp-badge-green' },
  rejected:  { label: 'Rejected',  cls: 'sp-badge-red' },
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

export default function Insurance() {
  const thisMonth = mockRegistries.filter(r => r.period === 'February 2026').length;
  const accepted = mockRegistries.filter(r => r.status === 'accepted').length;
  const totalAmount = mockRegistries.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Insurance</h1>
          <p>Submission registries for public and private medical insurance</p>
        </div>
        <button className="sp-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Registry
        </button>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{thisMonth}</div>
          <div className="sp-stat-label">This Month Submissions</div>
          <div className="sp-stat-trend up">February 2026</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{accepted}</div>
          <div className="sp-stat-label">Accepted</div>
          <div className="sp-stat-trend up">↑ 100% acceptance rate</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{formatCurrency(totalAmount)}</div>
          <div className="sp-stat-label">Total Amount</div>
          <div className="sp-stat-trend up">↑ 8% vs last year</div>
        </div>
      </div>

      <div className="sp-table-card">
        <table className="sp-table">
          <thead>
            <tr>
              <th>Registry #</th>
              <th>Period</th>
              <th>Type</th>
              <th>Records</th>
              <th>Total Amount</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockRegistries.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, color: 'var(--primary-deep-teal)' }}>{r.regNum}</td>
                <td>{r.period}</td>
                <td>
                  <span className={`sp-badge ${r.type === 'Public' ? 'sp-badge-teal' : 'sp-badge-blue'}`}>
                    {r.type}
                  </span>
                </td>
                <td>{r.records}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(r.amount)}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.submitted}</td>
                <td><span className={`sp-badge ${statusMap[r.status].cls}`}>{statusMap[r.status].label}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="sp-action-btn">View</button>
                    {r.status === 'rejected' && <button className="sp-action-btn">Resubmit</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
