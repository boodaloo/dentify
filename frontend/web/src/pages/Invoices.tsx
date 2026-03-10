import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import './shared-page.css';

const formatCurrency = (n: number | string) =>
  new Intl.NumberFormat('ru-RU').format(Number(n)) + ' ₽';

const formatDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
};

const initials = (p: any) => {
  if (!p) return '??';
  const f = (p.firstName ?? '')[0] ?? '';
  const l = (p.lastName  ?? '')[0] ?? '';
  return (f + l).toUpperCase() || '??';
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'Unpaid',    cls: 'sp-badge-orange' },
  PARTIAL:   { label: 'Partial',   cls: 'sp-badge-blue'   },
  PAID:      { label: 'Paid',      cls: 'sp-badge-green'  },
  CANCELLED: { label: 'Cancelled', cls: 'sp-badge-gray'   },
  OVERDUE:   { label: 'Overdue',   cls: 'sp-badge-red'    },
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const LIMIT = 20;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search) params.search = search;
      const res: any = await api.get('/invoices', params);
      const payload = res?.data ?? res;
      setInvoices(payload?.items ?? (Array.isArray(payload) ? payload : []));
      setTotal(payload?.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  // Resets page when search changes
  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // Summary stats
  const totalAmt   = invoices.reduce((s, i) => s + Number(i.totalAmount),  0);
  const paidAmt    = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.totalAmount), 0);
  const unpaidAmt  = invoices.filter(i => i.status === 'PENDING' || i.status === 'PARTIAL').reduce((s, i) => s + Number(i.totalAmount) - Number(i.paidAmount), 0);
  const overdueAmt = invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + Number(i.totalAmount), 0);

  const handleMarkPaid = async (invoice: any) => {
    const remaining = Number(invoice.totalAmount) - Number(invoice.paidAmount);
    if (remaining <= 0) return;
    try {
      await api.post(`/invoices/${invoice.id}/payments`, { amount: remaining, method: 'CASH' });
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = invoices.filter(i => {
    if (!search) return true;
    const name = `${i.patient?.firstName ?? ''} ${i.patient?.lastName ?? ''}`.toLowerCase();
    return name.includes(search.toLowerCase()) || (i.invoiceNumber ?? '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Invoices</h1>
          <p>Track and manage patient invoices and payments</p>
        </div>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ fontSize: '20px' }}>{formatCurrency(totalAmt)}</div>
          <div className="sp-stat-label">Total Invoiced</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ fontSize: '20px', color: '#1a7a4a' }}>{formatCurrency(paidAmt)}</div>
          <div className="sp-stat-label">Paid</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ fontSize: '20px', color: '#aa5a1a' }}>{formatCurrency(unpaidAmt)}</div>
          <div className="sp-stat-label">Outstanding</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ fontSize: '20px', color: '#aa1a1a' }}>{formatCurrency(overdueAmt)}</div>
          <div className="sp-stat-label">Overdue</div>
        </div>
      </div>

      <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
        <div className="sp-search">
          <SearchIcon />
          <input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="sp-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div className="loading-spinner" style={{ margin: 'auto' }} />
          </div>
        ) : (
          <table className="sp-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient</th>
                <th>Items</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="sp-empty">No invoices found</td></tr>
              ) : filtered.map(i => {
                const st = STATUS_MAP[i.status] ?? { label: i.status, cls: 'sp-badge-gray' };
                const canPay = i.status === 'PENDING' || i.status === 'PARTIAL';
                return (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-deep-teal)' }}>{i.invoiceNumber || '—'}</td>
                    <td>
                      <div className="sp-patient-cell">
                        <div className="sp-avatar">{initials(i.patient)}</div>
                        <span className="sp-patient-name">
                          {i.patient ? `${i.patient.firstName} ${i.patient.lastName}` : '—'}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{i.items?.length ?? 0}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(i.totalAmount)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatCurrency(i.paidAmount)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(i.createdAt)}</td>
                    <td><span className={`sp-badge ${st.cls}`}>{st.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {canPay && (
                          <button className="sp-action-btn" onClick={() => handleMarkPaid(i)}>
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '16px' }}>
            <button className="sp-action-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: '14px', opacity: 0.7 }}>Page {page} / {totalPages}</span>
            <button className="sp-action-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
