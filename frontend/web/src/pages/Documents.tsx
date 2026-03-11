import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './shared-page.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

// Documents don't have a status field in DB — derive from fileKey/validTo
const getStatus = (doc: any) => {
  if (doc.fileKey) return { label: 'Signed', cls: 'sp-badge-green' };
  if (doc.validTo && new Date(doc.validTo) > new Date()) return { label: 'Sent', cls: 'sp-badge-orange' };
  return { label: 'Draft', cls: 'sp-badge-gray' };
};

export default function Documents() {
  const [docs, setDocs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/documents', params) as any;
      const items = res?.data?.items ?? res?.data ?? [];
      const t = res?.data?.total ?? items.length;
      setDocs(items);
      setTotal(t);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, [search]);

  const awaitingSig = docs.filter(d => getStatus(d).label === 'Sent').length;
  const signedCount = docs.filter(d => getStatus(d).label === 'Signed').length;

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
          <div className="sp-stat-value">{isLoading ? '…' : total}</div>
          <div className="sp-stat-label">Total Documents</div>
          <div className="sp-stat-trend up">All time</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{isLoading ? '…' : awaitingSig}</div>
          <div className="sp-stat-label">Awaiting Signature</div>
          <div className="sp-stat-trend down">{awaitingSig > 0 ? 'Action required' : 'All clear'}</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{isLoading ? '…' : signedCount}</div>
          <div className="sp-stat-label">Signed</div>
          <div className="sp-stat-trend up">Total</div>
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
                <th>Document Type</th>
                <th>Patient</th>
                <th>Date Issued</th>
                <th>Valid To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="sp-empty">Loading...</td></tr>
              ) : docs.length === 0 ? (
                <tr><td colSpan={6} className="sp-empty">No documents found</td></tr>
              ) : docs.map(d => {
                const status = getStatus(d);
                const initials = d.patient
                  ? `${d.patient.firstName?.[0] ?? ''}${d.patient.lastName?.[0] ?? ''}`.toUpperCase()
                  : '—';
                const patientName = d.patient
                  ? `${d.patient.lastName} ${d.patient.firstName}`
                  : '—';
                return (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DocIcon />
                        {d.docType}{d.docNumber ? ` #${d.docNumber}` : ''}
                      </div>
                    </td>
                    <td>
                      {d.patient ? (
                        <div className="sp-patient-cell">
                          <div className="sp-avatar">{initials}</div>
                          <span className="sp-patient-name">{patientName}</span>
                        </div>
                      ) : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(d.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {d.validTo ? new Date(d.validTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td><span className={`sp-badge ${status.cls}`}>{status.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="sp-action-btn">Print</button>
                        {status.label !== 'Signed' && <button className="sp-action-btn">Send</button>}
                      </div>
                    </td>
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
