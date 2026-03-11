import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './shared-page.css';

type TabKey = 'diagnoses' | 'treatment_plans' | 'journals' | 'initial_exam';

// Static templates for tabs without backend yet
const staticJournals = [
  { id: 1, name: 'Daily Treatment Journal', category: 'Daily', categoryColor: 'teal', modified: '05 Mar 2026', uses: 310 },
  { id: 2, name: 'Surgical Procedure Log', category: 'Surgery', categoryColor: 'red', modified: '28 Feb 2026', uses: 72 },
  { id: 3, name: 'Orthodontic Progress Note', category: 'Orthodontics', categoryColor: 'blue', modified: '22 Feb 2026', uses: 48 },
  { id: 4, name: 'Child Patient Journal', category: 'Pediatric', categoryColor: 'green', modified: '18 Feb 2026', uses: 95 },
];

const staticInitialExam = [
  { id: 1, name: 'Standard Initial Exam', category: 'General', categoryColor: 'teal', modified: '03 Mar 2026', uses: 201 },
  { id: 2, name: 'Comprehensive Oral Exam', category: 'Full Exam', categoryColor: 'blue', modified: '24 Feb 2026', uses: 134 },
  { id: 3, name: 'Pediatric First Visit', category: 'Pediatric', categoryColor: 'orange', modified: '19 Feb 2026', uses: 67 },
  { id: 4, name: 'Emergency Exam', category: 'Urgent', categoryColor: 'red', modified: '12 Feb 2026', uses: 29 },
  { id: 5, name: 'Implant Consultation', category: 'Implants', categoryColor: 'teal', modified: '08 Feb 2026', uses: 53 },
];

const colorMap: Record<string, string> = {
  teal:   'sp-badge-teal',
  blue:   'sp-badge-blue',
  orange: 'sp-badge-orange',
  red:    'sp-badge-red',
  green:  'sp-badge-green',
  gray:   'sp-badge-gray',
};

const tabs: { key: TabKey; label: string }[] = [
  { key: 'diagnoses',      label: 'Diagnoses' },
  { key: 'treatment_plans', label: 'Treatment Plans' },
  { key: 'journals',       label: 'Journals' },
  { key: 'initial_exam',   label: 'Initial Exam' },
];

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Templates() {
  const [activeTab, setActiveTab] = useState<TabKey>('diagnoses');
  const [search, setSearch] = useState('');
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [treatmentTemplates, setTreatmentTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'diagnoses') {
      setIsLoading(true);
      api.get('/clinical/diagnoses').then((res: any) => {
        const items = Array.isArray(res) ? res : (res?.data?.items ?? res?.data ?? []);
        setDiagnoses(items);
      }).catch(() => {}).finally(() => setIsLoading(false));
    } else if (activeTab === 'treatment_plans') {
      setIsLoading(true);
      api.get('/clinical/treatment-plans/templates').then((res: any) => {
        const items = Array.isArray(res) ? res : (res?.data?.items ?? res?.data ?? []);
        setTreatmentTemplates(items);
      }).catch(() => {}).finally(() => setIsLoading(false));
    }
  }, [activeTab]);

  const getRows = () => {
    if (activeTab === 'diagnoses') return diagnoses;
    if (activeTab === 'treatment_plans') return treatmentTemplates;
    if (activeTab === 'journals') return staticJournals;
    return staticInitialExam;
  };

  const isApiTab = activeTab === 'diagnoses' || activeTab === 'treatment_plans';

  const filtered = getRows().filter((t: any) => {
    const name = t.name ?? t.code ?? '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const renderRow = (t: any) => {
    if (activeTab === 'diagnoses') {
      return (
        <tr key={t.id}>
          <td style={{ fontWeight: 500 }}>
            {t.name}
            {t.code && <span style={{ color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '12px' }}>({t.code})</span>}
          </td>
          <td>
            <span className="sp-badge sp-badge-teal">{t.category?.name ?? '—'}</span>
          </td>
          <td style={{ color: 'var(--text-secondary)' }}>
            {new Date(t.createdAt ?? Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </td>
          <td>—</td>
          <td>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="sp-action-btn">Edit</button>
              <button className="sp-action-btn">Duplicate</button>
            </div>
          </td>
        </tr>
      );
    }
    if (activeTab === 'treatment_plans') {
      return (
        <tr key={t.id}>
          <td style={{ fontWeight: 500 }}>{t.name}</td>
          <td>
            <span className="sp-badge sp-badge-blue">{t.isFolder ? 'Folder' : 'Template'}</span>
          </td>
          <td style={{ color: 'var(--text-secondary)' }}>
            {new Date(t.createdAt ?? Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </td>
          <td>{t.items?.length ?? 0} items</td>
          <td>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="sp-action-btn">Edit</button>
              <button className="sp-action-btn">Duplicate</button>
            </div>
          </td>
        </tr>
      );
    }
    // static tabs
    return (
      <tr key={t.id}>
        <td style={{ fontWeight: 500 }}>{t.name}</td>
        <td><span className={`sp-badge ${colorMap[t.categoryColor] ?? 'sp-badge-gray'}`}>{t.category}</span></td>
        <td style={{ color: 'var(--text-secondary)' }}>{t.modified}</td>
        <td>{t.uses} times</td>
        <td>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="sp-action-btn">Edit</button>
            <button className="sp-action-btn">Duplicate</button>
          </div>
        </td>
      </tr>
    );
  };

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
                onClick={() => { setActiveTab(t.key); setSearch(''); }}
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
              {isLoading && isApiTab ? (
                <tr><td colSpan={5} className="sp-empty">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="sp-empty">No templates found</td></tr>
              ) : filtered.map(renderRow)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
