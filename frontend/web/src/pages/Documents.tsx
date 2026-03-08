import { useState } from 'react';
import './shared-page.css';

const mockDocuments = [
  { id: 1, name: 'Informed Consent — Tooth Extraction', patient: 'Ekaterina Sokolova', initials: 'ES', created: '08 Mar 2026', status: 'signed' },
  { id: 2, name: 'Informed Consent — Root Canal Treatment', patient: 'Mikhail Petrov', initials: 'MP', created: '07 Mar 2026', status: 'sent' },
  { id: 3, name: 'Informed Consent — Implant Placement', patient: 'Anna Volkova', initials: 'AV', created: '07 Mar 2026', status: 'draft' },
  { id: 4, name: 'Personal Data Processing Agreement', patient: 'Dmitry Novikov', initials: 'DN', created: '06 Mar 2026', status: 'signed' },
  { id: 5, name: 'Informed Consent — Whitening Procedure', patient: 'Olga Smirnova', initials: 'OS', created: '06 Mar 2026', status: 'sent' },
  { id: 6, name: 'Treatment Plan Agreement', patient: 'Pavel Kozlov', initials: 'PK', created: '05 Mar 2026', status: 'draft' },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'sp-badge-gray' },
  sent: { label: 'Sent', cls: 'sp-badge-orange' },
  signed: { label: 'Signed', cls: 'sp-badge-green' },
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Documents() {
  const [search, setSearch] = useState('');

  const filtered = mockDocuments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.patient.toLowerCase().includes(search.toLowerCase())
  );

  const totalDocs = mockDocuments.length;
  const awaitingSig = mockDocuments.filter(d => d.status === 'sent').length;
  const signedToday = mockDocuments.filter(d => d.status === 'signed' && d.created === '08 Mar 2026').length;

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Documents</h1>
          <p>Informed consents and clinical documents for patient signature</p>
        </div>
        <button className="sp-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Document
        </button>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{totalDocs}</div>
          <div className="sp-stat-label">Total Documents</div>
          <div className="sp-stat-trend up">↑ 3 this week</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{awaitingSig}</div>
          <div className="sp-stat-label">Awaiting Signature</div>
          <div className="sp-stat-trend down">Action required</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{signedToday}</div>
          <div className="sp-stat-label">Signed Today</div>
          <div className="sp-stat-trend up">↑ 1 vs yesterday</div>
        </div>
      </div>

      <div>
        <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
          <div className="sp-search">
            <SearchIcon />
            <input
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sp-table-card">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Patient</th>
                <th>Date Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="sp-empty">No documents found</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      {d.name}
                    </div>
                  </td>
                  <td>
                    <div className="sp-patient-cell">
                      <div className="sp-avatar">{d.initials}</div>
                      <span className="sp-patient-name">{d.patient}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{d.created}</td>
                  <td><span className={`sp-badge ${statusMap[d.status].cls}`}>{statusMap[d.status].label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="sp-action-btn">Print</button>
                      {d.status !== 'signed' && <button className="sp-action-btn">Send</button>}
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
