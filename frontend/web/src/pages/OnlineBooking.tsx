import { useState } from 'react';
import './shared-page.css';

const mockRequests = [
  { id: 1, name: 'Ekaterina Sokolova', initials: 'ES', phone: '+7 (916) 234-56-78', source: 'Website', sourceColor: 'teal', date: '08 Mar 2026', time: '10:00', status: 'new' },
  { id: 2, name: 'Mikhail Petrov', initials: 'MP', phone: '+7 (903) 345-67-89', source: 'Google', sourceColor: 'blue', date: '08 Mar 2026', time: '11:30', status: 'confirmed' },
  { id: 3, name: 'Anna Volkova', initials: 'AV', phone: '+7 (926) 456-78-90', source: 'Instagram', sourceColor: 'orange', date: '08 Mar 2026', time: '14:00', status: 'new' },
  { id: 4, name: 'Dmitry Novikov', initials: 'DN', phone: '+7 (985) 567-89-01', source: 'Website', sourceColor: 'teal', date: '09 Mar 2026', time: '09:30', status: 'confirmed' },
  { id: 5, name: 'Olga Smirnova', initials: 'OS', phone: '+7 (965) 678-90-12', source: 'WhatsApp', sourceColor: 'green', date: '09 Mar 2026', time: '15:00', status: 'cancelled' },
  { id: 6, name: 'Pavel Kozlov', initials: 'PK', phone: '+7 (977) 789-01-23', source: 'Google', sourceColor: 'blue', date: '10 Mar 2026', time: '12:00', status: 'new' },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'sp-badge-blue' },
  confirmed: { label: 'Confirmed', cls: 'sp-badge-green' },
  cancelled: { label: 'Cancelled', cls: 'sp-badge-red' },
};

const sourceColorMap: Record<string, string> = {
  teal: 'sp-badge-teal',
  blue: 'sp-badge-blue',
  orange: 'sp-badge-orange',
  green: 'sp-badge-green',
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function OnlineBooking() {
  const [search, setSearch] = useState('');

  const filtered = mockRequests.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  );

  const todayCount = mockRequests.filter(r => r.date === '08 Mar 2026').length;
  const pendingCount = mockRequests.filter(r => r.status === 'new').length;
  const confirmedCount = mockRequests.filter(r => r.status === 'confirmed').length;

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Online Booking</h1>
          <p>Incoming appointment requests from external sources</p>
        </div>
        <button className="sp-btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
          </svg>
          Settings
        </button>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{todayCount}</div>
          <div className="sp-stat-label">Today's Requests</div>
          <div className="sp-stat-trend up">↑ 2 vs yesterday</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{pendingCount}</div>
          <div className="sp-stat-label">Pending Review</div>
          <div className="sp-stat-trend down">Needs attention</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{confirmedCount}</div>
          <div className="sp-stat-label">Confirmed</div>
          <div className="sp-stat-trend up">↑ 1 vs yesterday</div>
        </div>
      </div>

      <div>
        <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
          <div className="sp-search">
            <SearchIcon />
            <input
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sp-table-card">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>Source</th>
                <th>Requested Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="sp-empty">No requests found</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="sp-patient-cell">
                      <div className="sp-avatar">{r.initials}</div>
                      <span className="sp-patient-name">{r.name}</span>
                    </div>
                  </td>
                  <td>{r.phone}</td>
                  <td><span className={`sp-badge ${sourceColorMap[r.sourceColor]}`}>{r.source}</span></td>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                  <td>
                    <span className={`sp-badge ${statusMap[r.status].cls}`}>
                      {statusMap[r.status].label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="sp-action-btn">Confirm</button>
                      <button className="sp-action-btn">Decline</button>
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
