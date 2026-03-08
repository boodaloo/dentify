
import './shared-page.css';

interface Integration {
  id: number;
  icon: string;
  iconBg: string;
  name: string;
  description: string;
  connected: boolean;
}

const integrations: Integration[] = [
  {
    id: 1,
    icon: '💬',
    iconBg: '#e6f9f0',
    name: 'WhatsApp Business',
    description: 'Send appointment reminders, confirmations and promotional messages to patients via WhatsApp.',
    connected: true,
  },
  {
    id: 2,
    icon: '📅',
    iconBg: '#e6f0ff',
    name: 'Google Calendar',
    description: 'Sync clinic appointments with Google Calendar. Doctors see their schedule in their personal calendar.',
    connected: true,
  },
  {
    id: 3,
    icon: '📱',
    iconBg: '#e6f7f8',
    name: 'SMS.ru',
    description: 'Automated SMS notifications for appointment reminders, confirmations and marketing campaigns.',
    connected: true,
  },
  {
    id: 4,
    icon: '🗺️',
    iconBg: '#f0f0f5',
    name: 'Яндекс.Карты',
    description: 'Display your clinic on Yandex Maps and allow patients to book appointments directly from the map.',
    connected: false,
  },
  {
    id: 5,
    icon: '📸',
    iconBg: '#fff0f5',
    name: 'Instagram',
    description: 'Connect Instagram account to receive booking requests from the "Book" button on your profile.',
    connected: false,
  },
  {
    id: 6,
    icon: '📊',
    iconBg: '#fff4e6',
    name: '1С Бухгалтерия',
    description: 'Sync financial data with 1C Accounting. Automatic export of invoices, payments and salary data.',
    connected: false,
  },
  {
    id: 7,
    icon: '📞',
    iconBg: '#f5e6ff',
    name: 'CallTouch',
    description: 'Call tracking and analytics. Identify which marketing channels are driving phone calls to your clinic.',
    connected: false,
  },
  {
    id: 8,
    icon: '🏥',
    iconBg: '#e6f0ff',
    name: 'ЕГИСЗ',
    description: 'Integration with the Unified State Health Information System for mandatory medical reporting.',
    connected: true,
  },
];

export default function Integrations() {
  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Integrations</h1>
          <p>Manage your clinic's external service connections</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sp-badge sp-badge-green">
            {integrations.filter(i => i.connected).length} Connected
          </span>
          <span className="sp-badge sp-badge-gray">
            {integrations.filter(i => !i.connected).length} Available
          </span>
        </div>
      </div>

      <div className="sp-card-grid">
        {integrations.map(integration => (
          <div key={integration.id} className="sp-integration-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                className="sp-integration-icon"
                style={{ background: integration.iconBg }}
              >
                {integration.icon}
              </div>
              <span className={`sp-badge ${integration.connected ? 'sp-badge-green' : 'sp-badge-gray'}`}>
                {integration.connected ? '● Connected' : '○ Not connected'}
              </span>
            </div>

            <div>
              <div className="sp-integration-name">{integration.name}</div>
              <div className="sp-integration-desc">{integration.description}</div>
            </div>

            <button
              className={`sp-connect-btn ${integration.connected ? 'connected' : 'not-connected'}`}
            >
              {integration.connected ? '✓ Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
