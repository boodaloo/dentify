import { useState } from 'react';
import './shared-page.css';

type Category = 'all' | 'diagnostics' | 'therapy' | 'surgery' | 'orthodontics' | 'prosthetics';

interface Service {
  id: number;
  code: string;
  name: string;
  price: number;
  unit: string;
  category: Exclude<Category, 'all'>;
  status: 'active' | 'inactive';
}

const services: Service[] = [
  { id: 1, code: 'A01.07.001', name: 'Initial Dental Examination', price: 800, unit: 'per visit', category: 'diagnostics', status: 'active' },
  { id: 2, code: 'A06.07.003', name: 'Panoramic X-Ray (OPG)', price: 1500, unit: 'per image', category: 'diagnostics', status: 'active' },
  { id: 3, code: 'A06.07.010', name: 'CBCT Scan (Single Jaw)', price: 3500, unit: 'per scan', category: 'diagnostics', status: 'active' },
  { id: 4, code: 'A16.07.002', name: 'Caries Treatment (Class I)', price: 4500, unit: 'per tooth', category: 'therapy', status: 'active' },
  { id: 5, code: 'A16.07.008', name: 'Root Canal Treatment (1 canal)', price: 6000, unit: 'per canal', category: 'therapy', status: 'active' },
  { id: 6, code: 'A16.07.025', name: 'Professional Teeth Cleaning', price: 3200, unit: 'per session', category: 'therapy', status: 'active' },
  { id: 7, code: 'A16.07.050', name: 'Tooth Extraction (simple)', price: 2500, unit: 'per tooth', category: 'surgery', status: 'active' },
  { id: 8, code: 'A16.07.055', name: 'Surgical Extraction (wisdom)', price: 6500, unit: 'per tooth', category: 'surgery', status: 'active' },
  { id: 9, code: 'A16.07.080', name: 'Implant Placement', price: 35000, unit: 'per implant', category: 'surgery', status: 'active' },
  { id: 10, code: 'A16.07.100', name: 'Orthodontic Consultation', price: 1200, unit: 'per visit', category: 'orthodontics', status: 'active' },
  { id: 11, code: 'A16.07.105', name: 'Braces Installation (full arch)', price: 45000, unit: 'per arch', category: 'orthodontics', status: 'active' },
  { id: 12, code: 'A16.07.108', name: 'Aligner Treatment (per stage)', price: 8000, unit: 'per stage', category: 'orthodontics', status: 'active' },
  { id: 13, code: 'A16.07.120', name: 'Metal-Ceramic Crown', price: 12000, unit: 'per unit', category: 'prosthetics', status: 'active' },
  { id: 14, code: 'A16.07.125', name: 'Zirconia Crown', price: 18000, unit: 'per unit', category: 'prosthetics', status: 'active' },
  { id: 15, code: 'A16.07.130', name: 'E.max Ceramic Veneer', price: 22000, unit: 'per unit', category: 'prosthetics', status: 'active' },
  { id: 16, code: 'A06.07.002', name: 'Digital Periapical X-Ray', price: 500, unit: 'per image', category: 'diagnostics', status: 'inactive' },
];

const tabs: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'diagnostics', label: 'Diagnostics' },
  { key: 'therapy', label: 'Therapy' },
  { key: 'surgery', label: 'Surgery' },
  { key: 'orthodontics', label: 'Orthodontics' },
  { key: 'prosthetics', label: 'Prosthetics' },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function PriceList() {
  const [activeTab, setActiveTab] = useState<Category>('all');
  const [search, setSearch] = useState('');

  const filtered = services.filter(s => {
    const matchesTab = activeTab === 'all' || s.category === activeTab;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getCount = (cat: Category) =>
    cat === 'all' ? services.length : services.filter(s => s.category === cat).length;

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Price List</h1>
          <p>Manage clinic services and pricing</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="sp-btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Import
          </button>
          <button className="sp-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Service
          </button>
        </div>
      </div>

      <div>
        <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
          <div className="sp-search">
            <SearchIcon />
            <input
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sp-table-card">
          <div className="sp-tabs">
            {tabs.map(t => (
              <button
                key={t.key}
                className={`sp-tab${activeTab === t.key ? ' active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label} <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '4px' }}>({getCount(t.key)})</span>
              </button>
            ))}
          </div>

          <table className="sp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Service Name</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="sp-empty">No services found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>{s.code}</td>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-deep-teal)' }}>{formatCurrency(s.price)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.unit}</td>
                  <td>
                    <span className={`sp-badge ${s.status === 'active' ? 'sp-badge-green' : 'sp-badge-gray'}`}>
                      {s.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="sp-action-btn">Edit</button>
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
