
import './shared-page.css';

interface ReportCard {
  id: number;
  icon: string;
  iconBg: string;
  name: string;
  description: string;
  lastGenerated: string;
}

const reportCards: ReportCard[] = [
  {
    id: 1,
    icon: '💰',
    iconBg: '#e6f9f0',
    name: 'Financial Report',
    description: 'Revenue, expenses, profit and loss breakdown by period. Includes payment methods and outstanding balances.',
    lastGenerated: '01 Mar 2026',
  },
  {
    id: 2,
    icon: '📅',
    iconBg: '#e6f0ff',
    name: 'Attendance Report',
    description: 'Appointment statistics: completed, cancelled, no-shows. Breakdown by doctor, weekday, and time slot.',
    lastGenerated: '01 Mar 2026',
  },
  {
    id: 3,
    icon: '👨‍⚕️',
    iconBg: '#e6f7f8',
    name: 'Doctor Performance',
    description: 'KPIs per doctor: appointments handled, revenue generated, average treatment duration and patient satisfaction.',
    lastGenerated: '28 Feb 2026',
  },
  {
    id: 4,
    icon: '🦷',
    iconBg: '#fff4e6',
    name: 'Revenue by Service',
    description: 'Top services by revenue and volume. Identify most and least profitable treatments across all categories.',
    lastGenerated: '01 Mar 2026',
  },
  {
    id: 5,
    icon: '👥',
    iconBg: '#f0f0f5',
    name: 'Patient Statistics',
    description: 'Patient demographics, new vs. returning, acquisition sources, retention rate and visit frequency.',
    lastGenerated: '25 Feb 2026',
  },
  {
    id: 6,
    icon: '📋',
    iconBg: '#ffe6e6',
    name: 'Debt Report',
    description: 'Outstanding patient balances, overdue invoices by aging period, and collection effectiveness metrics.',
    lastGenerated: '05 Mar 2026',
  },
];

export default function Reports() {
  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Reports</h1>
          <p>Generate and schedule analytical reports for your clinic</p>
        </div>
      </div>

      <div className="sp-card-grid">
        {reportCards.map(card => (
          <div key={card.id} className="sp-integration-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div
                className="sp-integration-icon"
                style={{ background: card.iconBg, fontSize: '24px', flexShrink: 0 }}
              >
                {card.icon}
              </div>
              <div>
                <div className="sp-integration-name">{card.name}</div>
                <div className="sp-integration-desc" style={{ marginTop: '6px' }}>{card.description}</div>
              </div>
            </div>

            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Last generated: {card.lastGenerated}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <button className="sp-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '8px 12px', fontSize: '13px' }}>
                Generate
              </button>
              <button className="sp-btn-secondary" style={{ fontSize: '13px', padding: '8px 12px' }}>
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
