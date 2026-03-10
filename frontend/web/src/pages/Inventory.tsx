import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import './shared-page.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const stockStatus = (qty: number, minStock: number): { label: string; cls: string } => {
  if (qty <= 0)        return { label: 'Out',      cls: 'sp-badge-red'    };
  if (qty <= minStock) return { label: 'Low Stock', cls: 'sp-badge-orange' };
  return               { label: 'OK',        cls: 'sp-badge-green'  };
};

export default function Inventory() {
  const [stock,    setStock]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [lowOnly,  setLowOnly]  = useState(false);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (lowOnly) params.lowStock = 'true';
      const res: any = await api.get('/inventory/stock', params);
      const data = res?.data ?? res;
      setStock(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [lowOnly]);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const filtered = stock.filter(s => {
    if (!search) return true;
    const name = (s.material?.name ?? '').toLowerCase();
    const cat  = (s.material?.category?.name ?? '').toLowerCase();
    return name.includes(search.toLowerCase()) || cat.includes(search.toLowerCase());
  });

  const totalItems = stock.length;
  const lowItems   = stock.filter(s => Number(s.quantity) <= Number(s.material?.minStock ?? 0)).length;
  const outItems   = stock.filter(s => Number(s.quantity) <= 0).length;

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Inventory</h1>
          <p>Track dental materials, supplies and consumables</p>
        </div>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{totalItems}</div>
          <div className="sp-stat-label">Total Items</div>
          <div className="sp-stat-trend up">In stock</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ color: '#aa5a1a' }}>{lowItems}</div>
          <div className="sp-stat-label">Low Stock Items</div>
          <div className="sp-stat-trend down">Reorder needed</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ color: '#aa1a1a' }}>{outItems}</div>
          <div className="sp-stat-label">Out of Stock</div>
          {outItems > 0 && <div className="sp-stat-trend down">Urgent</div>}
        </div>
      </div>

      <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="sp-search" style={{ flex: 1 }}>
          <SearchIcon />
          <input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} />
          Low stock only
        </label>
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
                <th>Material</th>
                <th>Category</th>
                <th>Branch</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Min Level</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="sp-empty">No items found</td></tr>
              ) : filtered.map(s => {
                const qty      = Number(s.quantity);
                const minStock = Number(s.material?.minStock ?? 0);
                const pct      = minStock > 0 ? Math.min(100, Math.round(qty / (minStock * 2) * 100)) : 100;
                const { label, cls } = stockStatus(qty, minStock);
                const fillColor = cls === 'sp-badge-red' ? '#aa1a1a' : cls === 'sp-badge-orange' ? '#aa5a1a' : '#1a7a4a';
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.material?.name ?? '—'}</td>
                    <td>
                      {s.material?.category?.name
                        ? <span className="sp-badge sp-badge-teal">{s.material.category.name}</span>
                        : <span style={{ color: 'var(--text-secondary)' }}>—</span>
                      }
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.branch?.name ?? '—'}</td>
                    <td>
                      <div style={{ minWidth: '100px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '6px' }}>{qty}</div>
                        <div className="sp-progress-bar">
                          <div className="sp-progress-fill" style={{ width: `${pct}%`, background: fillColor }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.material?.unit?.shortName ?? '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{minStock}</td>
                    <td><span className={`sp-badge ${cls}`}>{label}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {s.lastUpdatedAt ? new Date(s.lastUpdatedAt).toLocaleDateString('ru-RU') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
