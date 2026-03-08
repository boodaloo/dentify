import { useState } from 'react';
import './shared-page.css';

type TabKey = 'diagnoses' | 'journals' | 'initial_exam' | 'treatment_plans';

const templates: Record<TabKey, Array<{ id: number; name: string; category: string; categoryColor: string; modified: string; uses: number }>> = {
  diagnoses: [
    { id: 1, name: 'Caries (K02.1)', category: 'General', categoryColor: 'teal', modified: '01 Mar 2026', uses: 124 },
    { id: 2, name: 'Pulpitis (K04.0)', category: 'Endodontics', categoryColor: 'blue', modified: '25 Feb 2026', uses: 87 },
    { id: 3, name: 'Periodontal Disease (K05.3)', category: 'Periodontics', categoryColor: 'orange', modified: '20 Feb 2026', uses: 56 },
    { id: 4, name: 'Tooth Fracture (S02.5)', category: 'Trauma', categoryColor: 'red', modified: '15 Feb 2026', uses: 23 },
    { id: 5, name: 'Gingivitis (K05.1)', category: 'Periodontics', categoryColor: 'orange', modified: '10 Feb 2026', uses: 41 },
  ],
  journals: [
    { id: 1, name: 'Daily Treatment Journal', category: 'Daily', categoryColor: 'teal', modified: '05 Mar 2026', uses: 310 },
    { id: 2, name: 'Surgical Procedure Log', category: 'Surgery', categoryColor: 'red', modified: '28 Feb 2026', uses: 72 },
    { id: 3, name: 'Orthodontic Progress Note', category: 'Orthodontics', categoryColor: 'blue', modified: '22 Feb 2026', uses: 48 },
    { id: 4, name: 'Child Patient Journal', category: 'Pediatric', categoryColor: 'green', modified: '18 Feb 2026', uses: 95 },
  ],
  initial_exam: [
    { id: 1, name: 'Standard Initial Exam', category: 'General', categoryColor: 'teal', modified: '03 Mar 2026', uses: 201 },
    { id: 2, name: 'Comprehensive Oral Exam', category: 'Full Exam', categoryColor: 'blue', modified: '24 Feb 2026', uses: 134 },
    { id: 3, name: 'Pediatric First Visit', category: 'Pediatric', categoryColor: 'orange', modified: '19 Feb 2026', uses: 67 },
    { id: 4, name: 'Emergency Exam', category: 'Urgent', categoryColor: 'red', modified: '12 Feb 2026', uses: 29 },
    { id: 5, name: 'Implant Consultation', category: 'Implants', categoryColor: 'teal', modified: '08 Feb 2026', uses: 53 },
  ],
  treatment_plans: [
    { id: 1, name: 'Full Mouth Rehabilitation', category: 'Complex', categoryColor: 'blue', modified: '06 Mar 2026', uses: 18 },
    { id: 2, name: 'Single Tooth Restoration', category: 'Restorative', categoryColor: 'teal', modified: '26 Feb 2026', uses: 88 },
    { id: 3, name: 'Orthodontic Treatment Plan', category: 'Orthodontics', categoryColor: 'orange', modified: '21 Feb 2026', uses: 45 },
    { id: 4, name: 'Implant Placement Plan', category: 'Implants', categoryColor: 'teal', modified: '16 Feb 2026', uses: 32 },
  ],
};

const colorMap: Record<string, string> = {
  teal: 'sp-badge-teal',
  blue: 'sp-badge-blue',
  orange: 'sp-badge-orange',
  red: 'sp-badge-red',
  green: 'sp-badge-green',
};

const tabs: { key: TabKey; label: string }[] = [
  { key: 'diagnoses', label: 'Diagnoses' },
  { key: 'journals', label: 'Journals' },
  { key: 'initial_exam', label: 'Initial Exam' },
  { key: 'treatment_plans', label: 'Treatment Plans' },
];

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Templates() {
  const [activeTab, setActiveTab] = useState<TabKey>('diagnoses');
  const [search, setSearch] = useState('');

  const list = templates[activeTab].filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Templates</h1>
          <p>Manage clinical templates for diagnoses, journals, and treatment plans</p>
        </div>
        <button className="sp-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Template
        </button>
      </div>

      <div>
        <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
          <div className="sp-search">
            <SearchIcon />
            <input
              placeholder="Search templates..."
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
                {t.label}
              </button>
            ))}
          </div>

          <table className="sp-table">
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Category</th>
                <th>Last Modified</th>
                <th>Usage Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={5} className="sp-empty">No templates found</td></tr>
              ) : list.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>{t.name}</td>
                  <td><span className={`sp-badge ${colorMap[t.categoryColor]}`}>{t.category}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{t.modified}</td>
                  <td>{t.uses} times</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="sp-action-btn">Edit</button>
                      <button className="sp-action-btn">Duplicate</button>
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
