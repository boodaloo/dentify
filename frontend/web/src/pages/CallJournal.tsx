import { useState } from 'react';
import './shared-page.css';

const mockCalls = [
  { id: 1, datetime: '08 Mar 2026, 09:14', patient: 'Ekaterina Sokolova', initials: 'ES', phone: '+7 (916) 234-56-78', type: 'incoming', duration: '4:32', outcome: 'appointment', manager: 'Irina K.' },
  { id: 2, datetime: '08 Mar 2026, 10:05', patient: 'Mikhail Petrov', initials: 'MP', phone: '+7 (903) 345-67-89', type: 'outgoing', duration: '2:18', outcome: 'spoke', manager: 'Irina K.' },
  { id: 3, datetime: '08 Mar 2026, 10:47', patient: 'Unknown', initials: '?', phone: '+7 (926) 000-11-22', type: 'incoming', duration: '0:00', outcome: 'no-answer', manager: '—' },
  { id: 4, datetime: '08 Mar 2026, 11:30', patient: 'Anna Volkova', initials: 'AV', phone: '+7 (926) 456-78-90', type: 'outgoing', duration: '6:05', outcome: 'appointment', manager: 'Marina S.' },
  { id: 5, datetime: '08 Mar 2026, 12:15', patient: 'Dmitry Novikov', initials: 'DN', phone: '+7 (985) 567-89-01', type: 'incoming', duration: '1:44', outcome: 'callback', manager: 'Irina K.' },
  { id: 6, datetime: '08 Mar 2026, 13:00', patient: 'Olga Smirnova', initials: 'OS', phone: '+7 (965) 678-90-12', type: 'outgoing', duration: '3:20', outcome: 'spoke', manager: 'Marina S.' },
  { id: 7, datetime: '08 Mar 2026, 14:22', patient: 'Pavel Kozlov', initials: 'PK', phone: '+7 (977) 789-01-23', type: 'incoming', duration: '5:11', outcome: 'appointment', manager: 'Irina K.' },
];

const typeConfig: Record<string, { label: string; cls: string }> = {
  incoming: { label: 'Incoming', cls: 'sp-badge-teal' },
  outgoing: { label: 'Outgoing', cls: 'sp-badge-blue' },
};

const outcomeConfig: Record<string, { label: string; cls: string }> = {
  'no-answer': { label: 'No Answer', cls: 'sp-badge-red' },
  spoke: { label: 'Spoke', cls: 'sp-badge-gray' },
  callback: { label: 'Callback', cls: 'sp-badge-orange' },
  appointment: { label: 'Appointment Made', cls: 'sp-badge-green' },
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function CallJournal() {
  const [search, setSearch] = useState('');

  const filtered = mockCalls.filter(c =>
    c.patient.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalCalls = mockCalls.length;
  const appointmentsMade = mockCalls.filter(c => c.outcome === 'appointment').length;
  const missed = mockCalls.filter(c => c.outcome === 'no-answer').length;

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Call Journal</h1>
          <p>History of incoming and outgoing patient calls</p>
        </div>
        <button className="sp-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Log Call
        </button>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{totalCalls}</div>
          <div className="sp-stat-label">Total Calls Today</div>
          <div className="sp-stat-trend up">↑ 2 vs yesterday</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ color: '#1a7a4a' }}>{appointmentsMade}</div>
          <div className="sp-stat-label">Appointments Made</div>
          <div className="sp-stat-trend up">43% conversion</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ color: '#aa1a1a' }}>{missed}</div>
          <div className="sp-stat-label">Missed Calls</div>
          <div className="sp-stat-trend down">Needs follow-up</div>
        </div>
      </div>

      <div>
        <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
          <div className="sp-search">
            <SearchIcon />
            <input
              placeholder="Search by patient or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sp-table-card">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Patient</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Outcome</th>
                <th>Manager</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="sp-empty">No calls found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{c.datetime}</td>
                  <td>
                    <div className="sp-patient-cell">
                      <div className="sp-avatar" style={{ background: c.patient === 'Unknown' ? '#e0e0e8' : undefined, color: c.patient === 'Unknown' ? '#888' : undefined }}>
                        {c.initials}
                      </div>
                      <span className="sp-patient-name">{c.patient}</span>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td><span className={`sp-badge ${typeConfig[c.type].cls}`}>{typeConfig[c.type].label}</span></td>
                  <td style={{ fontFamily: 'monospace' }}>{c.duration}</td>
                  <td><span className={`sp-badge ${outcomeConfig[c.outcome].cls}`}>{outcomeConfig[c.outcome].label}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.manager}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
