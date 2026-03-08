import { useState } from 'react';
import './shared-page.css';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  categoryColor: string;
  quantity: number;
  unit: string;
  minLevel: number;
  reorderPoint: number;
  status: 'ok' | 'low' | 'critical';
  lastUpdated: string;
}

const mockItems: InventoryItem[] = [
  { id: 1, name: 'Latex Gloves (M)', category: 'PPE', categoryColor: 'blue', quantity: 850, unit: 'pcs', minLevel: 500, reorderPoint: 600, status: 'ok', lastUpdated: '07 Mar 2026' },
  { id: 2, name: 'Articaine 4% Anesthetic', category: 'Anesthetics', categoryColor: 'orange', quantity: 42, unit: 'cartridges', minLevel: 50, reorderPoint: 60, status: 'low', lastUpdated: '06 Mar 2026' },
  { id: 3, name: 'Composite Resin A2 (Filtek)', category: 'Materials', categoryColor: 'teal', quantity: 3, unit: 'syringes', minLevel: 10, reorderPoint: 15, status: 'critical', lastUpdated: '05 Mar 2026' },
  { id: 4, name: 'Disposable Masks FFP2', category: 'PPE', categoryColor: 'blue', quantity: 320, unit: 'pcs', minLevel: 200, reorderPoint: 250, status: 'ok', lastUpdated: '08 Mar 2026' },
  { id: 5, name: 'Suture Thread 3-0 Vicryl', category: 'Surgical', categoryColor: 'red', quantity: 18, unit: 'packs', minLevel: 20, reorderPoint: 25, status: 'low', lastUpdated: '04 Mar 2026' },
  { id: 6, name: 'Impression Material (Alginate)', category: 'Materials', categoryColor: 'teal', quantity: 12, unit: 'kg bags', minLevel: 5, reorderPoint: 8, status: 'ok', lastUpdated: '07 Mar 2026' },
  { id: 7, name: 'X-Ray Phosphor Plates (S2)', category: 'Imaging', categoryColor: 'gray', quantity: 8, unit: 'pcs', minLevel: 6, reorderPoint: 8, status: 'ok', lastUpdated: '01 Mar 2026' },
];

const colorMap: Record<string, string> = {
  blue: 'sp-badge-blue',
  orange: 'sp-badge-orange',
  teal: 'sp-badge-teal',
  red: 'sp-badge-red',
  gray: 'sp-badge-gray',
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  ok: { label: 'OK', cls: 'sp-badge-green' },
  low: { label: 'Low Stock', cls: 'sp-badge-orange' },
  critical: { label: 'Critical', cls: 'sp-badge-red' },
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Inventory() {
  const [search, setSearch] = useState('');

  const filtered = mockItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = mockItems.length;
  const lowStock = mockItems.filter(i => i.status === 'low' || i.status === 'critical').length;
  const valueEstimate = '₽ 148,500';

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Inventory</h1>
          <p>Track dental materials, supplies and consumables</p>
        </div>
        <button className="sp-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Item
        </button>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{totalItems}</div>
          <div className="sp-stat-label">Total Items</div>
          <div className="sp-stat-trend up">In stock</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ color: '#aa5a1a' }}>{lowStock}</div>
          <div className="sp-stat-label">Low Stock Items</div>
          <div className="sp-stat-trend down">Reorder needed</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value" style={{ fontSize: '22px' }}>{valueEstimate}</div>
          <div className="sp-stat-label">Estimated Stock Value</div>
          <div className="sp-stat-trend up">↑ 3% vs last month</div>
        </div>
      </div>

      <div>
        <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
          <div className="sp-search">
            <SearchIcon />
            <input
              placeholder="Search inventory..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sp-table-card">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Min. Level</th>
                <th>Reorder Point</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="sp-empty">No items found</td></tr>
              ) : filtered.map(item => {
                const pct = Math.min(100, Math.round((item.quantity / (item.minLevel * 2)) * 100));
                const fillColor = item.status === 'critical' ? '#aa1a1a' : item.status === 'low' ? '#aa5a1a' : '#1a7a4a';
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td><span className={`sp-badge ${colorMap[item.categoryColor]}`}>{item.category}</span></td>
                    <td>
                      <div style={{ minWidth: '120px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '6px' }}>{item.quantity}</div>
                        <div className="sp-progress-bar">
                          <div className="sp-progress-fill" style={{ width: `${pct}%`, background: fillColor }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.unit}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.minLevel}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.reorderPoint}</td>
                    <td><span className={`sp-badge ${statusConfig[item.status].cls}`}>{statusConfig[item.status].label}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.lastUpdated}</td>
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
