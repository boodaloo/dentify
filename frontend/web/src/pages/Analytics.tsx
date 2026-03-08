
import './shared-page.css';

const visitsByDay = [
  { day: 'Mon', visits: 28 },
  { day: 'Tue', visits: 34 },
  { day: 'Wed', visits: 31 },
  { day: 'Thu', visits: 38 },
  { day: 'Fri', visits: 42 },
  { day: 'Sat', visits: 22 },
  { day: 'Sun', visits: 8 },
];

const maxVisits = Math.max(...visitsByDay.map(d => d.visits));

const topServices = [
  { name: 'Teeth Cleaning', count: 48, revenue: 153600, pct: 22 },
  { name: 'Composite Filling', count: 39, revenue: 175500, pct: 18 },
  { name: 'Root Canal Treatment', count: 24, revenue: 144000, pct: 14 },
  { name: 'Crown Placement', count: 18, revenue: 216000, pct: 12 },
  { name: 'Tooth Extraction', count: 22, revenue: 55000, pct: 10 },
  { name: 'Consultation', count: 33, revenue: 26400, pct: 8 },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

export default function Analytics() {
  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Analytics</h1>
          <p>Clinic performance metrics and trends</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="sp-btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            March 2026
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value">2,847</div>
          <div className="sp-stat-label">Total Patients</div>
          <div className="sp-stat-trend up">↑ +12% vs last month</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">184</div>
          <div className="sp-stat-label">Appointments This Month</div>
          <div className="sp-stat-trend up">↑ +8% vs last month</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">4,200 ₽</div>
          <div className="sp-stat-label">Avg Revenue per Visit</div>
          <div className="sp-stat-trend up">↑ +5% vs last month</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">68%</div>
          <div className="sp-stat-label">Repeat Visit Rate</div>
          <div className="sp-stat-trend up">↑ +3% vs last month</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 'var(--space-m)' }}>
        {/* Bar Chart */}
        <div className="sp-stat-card" style={{ padding: 'var(--space-l)' }}>
          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: 'var(--space-l)' }}>
            Visits by Day of Week
          </div>
          <div className="sp-chart-bar-group">
            {visitsByDay.map(d => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{d.visits}</div>
                <div
                  className="sp-chart-bar"
                  style={{ height: `${(d.visits / maxVisits) * 100}%`, width: '100%' }}
                  title={`${d.day}: ${d.visits} visits`}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services Table */}
        <div className="sp-stat-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-l)', fontWeight: 600, fontSize: '15px', borderBottom: '1px solid var(--border-light)' }}>
            Top Services
          </div>
          <table className="sp-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Visits</th>
                <th>Revenue</th>
                <th style={{ minWidth: '100px' }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {topServices.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td>{s.count}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(s.revenue)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="sp-progress-bar" style={{ flex: 1 }}>
                        <div className="sp-progress-fill" style={{ width: `${s.pct}%` }} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '30px' }}>{s.pct}%</span>
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
