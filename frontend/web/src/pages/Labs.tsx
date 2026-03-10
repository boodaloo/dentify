import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import './shared-page.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  NEW:         { label: 'New',         cls: 'sp-badge-blue'   },
  IN_PROGRESS: { label: 'In Progress', cls: 'sp-badge-orange' },
  READY:       { label: 'Ready',       cls: 'sp-badge-green'  },
  DELIVERED:   { label: 'Delivered',   cls: 'sp-badge-gray'   },
  CANCELLED:   { label: 'Cancelled',   cls: 'sp-badge-red'    },
};

const initials = (p: any) => {
  if (!p) return '??';
  return ((p.firstName ?? '')[0] + (p.lastName ?? '')[0]).toUpperCase() || '??';
};

const formatDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface NewOrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const NewOrderForm: React.FC<NewOrderFormProps> = ({ onSuccess, onCancel }) => {
  const [form, setForm]       = useState({ patientSearch: '', patientId: '', technicianId: '', notes: '', dueDate: '', toothColor: '' });
  const [patients, setPatients] = useState<any[]>([]);
  const [techs,    setTechs]    = useState<any[]>([]);
  const [showDD,   setShowDD]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const searchRef = { current: null as any };

  useEffect(() => {
    api.get('/labs/technicians').then((r: any) => {
      const data = r?.data ?? r;
      setTechs(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const searchPatients = async (val: string) => {
    if (!val.trim()) { setPatients([]); return; }
    try {
      const res: any = await api.get('/patients', { search: val, limit: '6' });
      const payload = res?.data ?? res;
      setPatients(payload?.items ?? (Array.isArray(payload) ? payload : []));
      setShowDD(true);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.technicianId) { setError('Patient and technician are required'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/labs/orders', {
        patientId:    form.patientId,
        technicianId: form.technicianId,
        toothColor:   form.toothColor || undefined,
        dueDate:      form.dueDate    || undefined,
        notes:        form.notes      || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && <div className="sp-form-error">{error}</div>}

      <div style={{ position: 'relative' }}>
        <label className="sp-label">Patient *</label>
        <input className="sp-input" placeholder="Search patient..." value={form.patientSearch}
          onChange={e => { setForm(f => ({ ...f, patientSearch: e.target.value, patientId: '' })); searchPatients(e.target.value); }} />
        {showDD && patients.length > 0 && (
          <div className="patient-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e2a38', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', zIndex: 100 }}>
            {patients.map(p => (
              <div key={p.id} style={{ padding: '10px 14px', cursor: 'pointer' }}
                onMouseDown={() => { setForm(f => ({ ...f, patientId: p.id, patientSearch: `${p.firstName} ${p.lastName}` })); setPatients([]); setShowDD(false); }}>
                {p.firstName} {p.lastName} {p.phone ? `· ${p.phone}` : ''}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="sp-label">Laboratory *</label>
        <select className="sp-input" value={form.technicianId} onChange={e => setForm(f => ({ ...f, technicianId: e.target.value }))} required>
          <option value="">— Select lab —</option>
          {techs.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label className="sp-label">Due Date</label>
          <input className="sp-input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="sp-label">Tooth Color</label>
          <input className="sp-input" placeholder="e.g. A2, B3" value={form.toothColor} onChange={e => setForm(f => ({ ...f, toothColor: e.target.value }))} />
        </div>
      </div>

      <div>
        <label className="sp-label">Notes</label>
        <textarea className="sp-input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button type="button" className="sp-btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="sp-btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
};

export default function Labs() {
  const [orders,   setOrders]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const LIMIT = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (status) params.status = status;
      const res: any = await api.get('/labs/orders', params);
      const payload = res?.data ?? res;
      setOrders(payload?.items ?? (Array.isArray(payload) ? payload : []));
      setTotal(payload?.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [status, search]);

  const totalPages  = Math.max(1, Math.ceil(total / LIMIT));
  const activeOrders = orders.filter(o => o.status === 'NEW' || o.status === 'IN_PROGRESS').length;
  const readyOrders  = orders.filter(o => o.status === 'READY').length;

  const handleStatusChange = async (order: any, newStatus: string) => {
    try {
      await api.put(`/labs/orders/${order.id}`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const name = `${o.patient?.firstName ?? ''} ${o.patient?.lastName ?? ''}`.toLowerCase();
    return name.includes(search.toLowerCase()) || (o.orderNumber ?? '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Lab Orders</h1>
          <p>Track lab orders and receive results from dental laboratories</p>
        </div>
        <button className="sp-btn-primary" onClick={() => setModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Order
        </button>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{activeOrders}</div>
          <div className="sp-stat-label">Active Orders</div>
          <div className="sp-stat-trend up">In production</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{readyOrders}</div>
          <div className="sp-stat-label">Ready for Pickup</div>
          {readyOrders > 0 && <div className="sp-stat-trend down">Awaiting delivery</div>}
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{total}</div>
          <div className="sp-stat-label">Total Orders</div>
        </div>
      </div>

      <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div className="sp-search" style={{ flex: 1 }}>
          <SearchIcon />
          <input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="sp-input" style={{ maxWidth: '160px' }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
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
                <th>Order #</th>
                <th>Patient</th>
                <th>Laboratory</th>
                <th>Tooth Color</th>
                <th>Created</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="sp-empty">No lab orders found</td></tr>
              ) : filtered.map(o => {
                const st = STATUS_MAP[o.status] ?? { label: o.status, cls: 'sp-badge-gray' };
                return (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-deep-teal)' }}>
                      {o.orderNumber || o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td>
                      <div className="sp-patient-cell">
                        <div className="sp-avatar">{initials(o.patient)}</div>
                        <span className="sp-patient-name">
                          {o.patient ? `${o.patient.firstName} ${o.patient.lastName}` : '—'}
                        </span>
                      </div>
                    </td>
                    <td>{o.technician?.name ?? '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{o.toothColor || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(o.createdAt)}</td>
                    <td style={{ color: o.dueDate && new Date(o.dueDate) < new Date() && o.status !== 'DELIVERED' ? '#aa1a1a' : 'var(--text-secondary)' }}>
                      {formatDate(o.dueDate)}
                    </td>
                    <td><span className={`sp-badge ${st.cls}`}>{st.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {o.status === 'READY' && (
                          <button className="sp-action-btn" onClick={() => handleStatusChange(o, 'DELIVERED')}>
                            Mark Delivered
                          </button>
                        )}
                        {o.status === 'NEW' && (
                          <button className="sp-action-btn" onClick={() => handleStatusChange(o, 'IN_PROGRESS')}>
                            Start
                          </button>
                        )}
                        {o.status === 'IN_PROGRESS' && (
                          <button className="sp-action-btn" onClick={() => handleStatusChange(o, 'READY')}>
                            Mark Ready
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Lab Order">
        <NewOrderForm onSuccess={() => { setModalOpen(false); fetchOrders(); }} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
