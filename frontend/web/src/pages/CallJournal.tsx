import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './shared-page.css';

const directionConfig: Record<string, { label: string; cls: string }> = {
  INBOUND:  { label: 'Incoming', cls: 'sp-badge-teal' },
  OUTBOUND: { label: 'Outgoing', cls: 'sp-badge-blue' },
};

const resultConfig: Record<string, { label: string; cls: string }> = {
  ANSWERED:  { label: 'Answered',  cls: 'sp-badge-green' },
  MISSED:    { label: 'Missed',    cls: 'sp-badge-red' },
  BUSY:      { label: 'Busy',      cls: 'sp-badge-orange' },
  VOICEMAIL: { label: 'Voicemail', cls: 'sp-badge-gray' },
};

const formatDuration = (secs: number | null) => {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function CallJournal() {
  const [calls, setCalls] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCalls = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/calls', params) as any;
      const items = res?.data?.items ?? res?.data ?? [];
      const t = res?.data?.total ?? items.length;
      setCalls(items);
      setTotal(t);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCalls(); }, [search]);

  const answered  = calls.filter(c => c.result === 'ANSWERED').length;
  const missed    = calls.filter(c => c.result === 'MISSED').length;

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
          <div className="sp-stat-value">{isLoading ? '…' : total}</div>
          <div className="sp-stat-label">Total Calls</div>
          <div className="sp-stat-trend up">All time</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ color: '#1a7a4a' }}>{isLoading ? '…' : answered}</div>
          <div className="sp-stat-label">Answered</div>
          <div className="sp-stat-trend up">
            {calls.length > 0 ? Math.round(answered / calls.length * 100) : 0}% answer rate
          </div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ color: '#aa1a1a' }}>{isLoading ? '…' : missed}</div>
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
                <th>Direction</th>
                <th>Duration</th>
                <th>Result</th>
                <th>Manager</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="sp-empty">Loading...</td></tr>
              ) : calls.length === 0 ? (
                <tr><td colSpan={7} className="sp-empty">No calls found</td></tr>
              ) : calls.map(c => {
                const initials = c.patient
                  ? `${c.patient.firstName?.[0] ?? ''}${c.patient.lastName?.[0] ?? ''}`.toUpperCase()
                  : '?';
                const patientName = c.patient
                  ? `${c.patient.lastName} ${c.patient.firstName}`
                  : 'Unknown';
                const managerName = c.user?.name ?? '—';
                const dir = directionConfig[c.direction] ?? { label: c.direction, cls: 'sp-badge-gray' };
                const res = resultConfig[c.result] ?? { label: c.result, cls: 'sp-badge-gray' };
                return (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(c.calledAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div className="sp-patient-cell">
                        <div className="sp-avatar" style={!c.patient ? { background: '#e0e0e8', color: '#888' } : undefined}>
                          {initials}
                        </div>
                        <span className="sp-patient-name">{patientName}</span>
                      </div>
                    </td>
                    <td>{c.phone}</td>
                    <td><span className={`sp-badge ${dir.cls}`}>{dir.label}</span></td>
                    <td style={{ fontFamily: 'monospace' }}>{formatDuration(c.durationSeconds)}</td>
                    <td><span className={`sp-badge ${res.cls}`}>{res.label}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{managerName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
