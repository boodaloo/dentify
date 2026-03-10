import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import './shared-page.css';

const formatCurrency = (n: number | string) =>
  new Intl.NumberFormat('ru-RU').format(Number(n)) + ' ₽';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

interface Category { id: string; name: string; _count?: { services: number } }
interface Service  { id: string; code?: string; name: string; price: number | string; durationMinutes: number; isActive: boolean; category?: { id: string; name: string } }

interface ServiceFormProps {
  initialData?: Service | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ initialData, categories, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    name:            initialData?.name            || '',
    code:            initialData?.code            || '',
    price:           initialData?.price != null   ? String(initialData.price) : '',
    durationMinutes: initialData?.durationMinutes ? String(initialData.durationMinutes) : '30',
    categoryId:      initialData?.category?.id    || '',
    isActive:        initialData?.isActive        ?? true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name and price are required'); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name:            form.name,
        code:            form.code || undefined,
        price:           Number(form.price),
        durationMinutes: Number(form.durationMinutes),
        categoryId:      form.categoryId || undefined,
        isActive:        form.isActive,
      };
      if (initialData?.id) {
        await api.put(`/services/${initialData.id}`, payload);
      } else {
        await api.post('/services', payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && <div className="sp-form-error">{error}</div>}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 2 }}>
          <label className="sp-label">Service Name *</label>
          <input className="sp-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="sp-label">Code</label>
          <input className="sp-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="A01.07.001" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label className="sp-label">Price (₽) *</label>
          <input className="sp-input" type="number" min="0" step="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="sp-label">Duration (min)</label>
          <input className="sp-input" type="number" min="5" step="5" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="sp-label">Category</label>
        <select className="sp-input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
          <option value="">— No category —</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {initialData?.id && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
          Active
        </label>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
        <button type="button" className="sp-btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="sp-btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : (initialData?.id ? 'Update' : 'Add Service')}
        </button>
      </div>
    </form>
  );
};

export default function PriceList() {
  const [services,   setServices]   = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [activeCat,  setActiveCat]  = useState('all');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Service | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [svcRes, catRes]: [any, any] = await Promise.all([
        api.get('/services', { limit: '200' }),
        api.get('/services/categories'),
      ]);
      const svcPayload = svcRes?.data ?? svcRes;
      const catPayload = catRes?.data ?? catRes;
      setServices(svcPayload?.items ?? (Array.isArray(svcPayload) ? svcPayload : []));
      setCategories(Array.isArray(catPayload) ? catPayload : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = services.filter(s => {
    const matchCat = activeCat === 'all' || s.category?.id === activeCat;
    const matchSearch = !search
      || s.name.toLowerCase().includes(search.toLowerCase())
      || (s.code ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (s: Service) => { setEditing(s); setModalOpen(true); };

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Price List</h1>
          <p>Manage clinic services and pricing</p>
        </div>
        <button className="sp-btn-primary" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Service
        </button>
      </div>

      <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
        <div className="sp-search">
          <SearchIcon />
          <input placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="sp-table-card">
        <div className="sp-tabs">
          <button className={`sp-tab${activeCat === 'all' ? ' active' : ''}`} onClick={() => setActiveCat('all')}>
            All <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '4px' }}>({services.length})</span>
          </button>
          {categories.map(c => (
            <button key={c.id} className={`sp-tab${activeCat === c.id ? ' active' : ''}`} onClick={() => setActiveCat(c.id)}>
              {c.name} <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '4px' }}>({c._count?.services ?? 0})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div className="loading-spinner" style={{ margin: 'auto' }} />
          </div>
        ) : (
          <table className="sp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Service Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="sp-empty">No services found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>{s.code || '—'}</td>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.category?.name || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-deep-teal)' }}>{formatCurrency(s.price)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.durationMinutes} min</td>
                  <td>
                    <span className={`sp-badge ${s.isActive ? 'sp-badge-green' : 'sp-badge-gray'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="sp-action-btn" onClick={() => openEdit(s)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Service' : 'New Service'}>
        <ServiceForm
          initialData={editing}
          categories={categories}
          onSuccess={() => { setModalOpen(false); fetchAll(); }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
