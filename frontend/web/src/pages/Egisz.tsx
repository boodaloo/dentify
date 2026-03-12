import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import './Egisz.css';

interface EgiszSettings {
  isEnabled: boolean;
  orgOid: string;
  orgName: string;
  apiUrl: string;
  apiLogin: string;
  apiPassword: string;
}

interface EgiszDocument {
  id: string;
  docType: string;
  status: string;
  xmlPayload?: string;
  createdAt: string;
  patient?: { id: string; firstName: string; lastName: string };
}

interface PatientSearch {
  id: string;
  firstName: string;
  lastName: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  SEMD_OUTPATIENT: 'Амбулаторный приём',
  SEMD_REFERRAL:   'Направление',
  SEMD_PROTOCOL:   'Протокол',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT:    'Draft',
  READY:    'Ready',
  SENT:     'Sent',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  ERROR:    'Error',
};

const ALL_STATUSES = ['DRAFT', 'READY', 'SENT', 'ACCEPTED', 'REJECTED', 'ERROR'];

const defaultSettings: EgiszSettings = {
  isEnabled: false,
  orgOid: '',
  orgName: '',
  apiUrl: '',
  apiLogin: '',
  apiPassword: '',
};

const Egisz: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'documents'>('settings');

  // Settings state
  const [settings, setSettings] = useState<EgiszSettings>({ ...defaultSettings });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Documents state
  const [documents, setDocuments] = useState<EgiszDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [showXmlId, setShowXmlId] = useState<string | null>(null);

  // Generate modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm] = useState({ patientSearch: '', patientId: '', docType: 'SEMD_OUTPATIENT' });
  const [genPatients, setGenPatients] = useState<PatientSearch[]>([]);
  const [genLoading, setGenLoading] = useState(false);

  // Status change modal
  const [statusModal, setStatusModal] = useState<{ docId: string; current: string } | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await api.get('/egisz/settings');
      const d = res.data?.data ?? {};
      setSettings({
        isEnabled: d.isEnabled ?? false,
        orgOid: d.orgOid ?? '',
        orgName: d.orgName ?? '',
        apiUrl: d.apiUrl ?? '',
        apiLogin: d.apiLogin ?? '',
        apiPassword: d.apiPassword ?? '',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadDocuments = useCallback(async () => {
    setDocsLoading(true);
    try {
      const params: Record<string, string> = { limit: '100' };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/egisz/documents', { params });
      setDocuments(res.data?.data?.items ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setDocsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadSettings(); }, []);
  useEffect(() => {
    if (activeTab === 'documents') loadDocuments();
  }, [activeTab, loadDocuments]);

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      await api.put('/egisz/settings', {
        isEnabled: settings.isEnabled,
        orgOid: settings.orgOid || null,
        orgName: settings.orgName || null,
        apiUrl: settings.apiUrl || null,
        apiLogin: settings.apiLogin || null,
        apiPassword: settings.apiPassword || null,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSettingsSaving(false);
    }
  };

  const searchPatients = async (q: string) => {
    if (!q || q.length < 2) { setGenPatients([]); return; }
    try {
      const res = await api.get('/patients', { params: { search: q, limit: '10' } });
      setGenPatients(res.data?.data?.items ?? []);
    } catch (e) { setGenPatients([]); }
  };

  const generateDoc = async () => {
    if (!genForm.patientId) return;
    setGenLoading(true);
    try {
      await api.post('/egisz/documents', {
        patientId: genForm.patientId,
        docType: genForm.docType,
      });
      setShowGenModal(false);
      setGenForm({ patientSearch: '', patientId: '', docType: 'SEMD_OUTPATIENT' });
      loadDocuments();
    } catch (e) {
      console.error(e);
    } finally {
      setGenLoading(false);
    }
  };

  const changeStatus = async () => {
    if (!statusModal || !newStatus) return;
    try {
      await api.put(`/egisz/documents/${statusModal.docId}/status`, { status: newStatus });
      setStatusModal(null);
      loadDocuments();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteDoc = async (id: string) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/egisz/documents/${id}`);
      loadDocuments();
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="egisz-page">
      <div className="egisz-header">
        <h1>ЕГИСЗ</h1>
        <p>Единая государственная информационная система в сфере здравоохранения</p>
      </div>

      <div className="egisz-tabs">
        <button
          className={`egisz-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={`egisz-tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
      </div>

      <div className="egisz-content">
        {activeTab === 'settings' && (
          settingsLoading ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading...</div>
          ) : (
            <div className="egisz-settings-grid">
              <div className="egisz-settings-card">
                <h3>Connection Settings</h3>

                <div className="egisz-connection-status">
                  <span className={`status-dot ${settings.isEnabled ? 'enabled' : 'disabled'}`}></span>
                  <span className="status-text">
                    {settings.isEnabled ? 'Integration enabled' : 'Integration disabled'}
                  </span>
                </div>

                <div className="egisz-toggle-row">
                  <span className="egisz-toggle-label">Enable ЕГИСЗ integration</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.isEnabled}
                      onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="egisz-form-group">
                  <label>OID организации</label>
                  <input
                    type="text"
                    value={settings.orgOid}
                    onChange={(e) => setSettings({ ...settings, orgOid: e.target.value })}
                    placeholder="1.2.643.5.1.13.13.12.2.xx.xxx.0.1"
                  />
                </div>

                <div className="egisz-form-group">
                  <label>Название организации</label>
                  <input
                    type="text"
                    value={settings.orgName}
                    onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                    placeholder="ООО «Стоматология Плюс»"
                  />
                </div>

                <div className="egisz-form-group">
                  <label>API URL</label>
                  <input
                    type="url"
                    value={settings.apiUrl}
                    onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                    placeholder="https://api.egisz.rosminzdrav.ru"
                  />
                </div>

                <div className="egisz-form-group">
                  <label>Логин</label>
                  <input
                    type="text"
                    value={settings.apiLogin}
                    onChange={(e) => setSettings({ ...settings, apiLogin: e.target.value })}
                    placeholder="clinic_login"
                  />
                </div>

                <div className="egisz-form-group">
                  <label>Пароль</label>
                  <input
                    type="password"
                    value={settings.apiPassword}
                    onChange={(e) => setSettings({ ...settings, apiPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="egisz-save-row">
                  <button
                    className="btn-primary"
                    onClick={saveSettings}
                    disabled={settingsSaving}
                    style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: 'var(--primary-teal)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                  >
                    {settingsSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>

              <div className="egisz-info-block">
                <h4>What is ЕГИСЗ?</h4>
                <p>
                  ЕГИСЗ (Единая государственная информационная система в сфере здравоохранения) — это
                  федеральная система, обеспечивающая обмен медицинской документацией между медицинскими
                  организациями и государственными органами.
                </p>
                <p>Для подключения необходимо:</p>
                <ul>
                  <li>Пройти регистрацию на портале ЕГИСЗ</li>
                  <li>Получить OID организации от Минздрава</li>
                  <li>Настроить СЭМД (структурированные электронные медицинские документы)</li>
                  <li>Подключить квалифицированную электронную подпись (КЭП)</li>
                </ul>
                <p>
                  После настройки интеграции система будет автоматически отправлять СЭМД
                  при завершении приёмов пациентов.
                </p>
              </div>
            </div>
          )
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="egisz-docs-toolbar">
              <select
                className="egisz-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <div style={{ flex: 1 }} />
              <button
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--primary-teal)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                onClick={() => {
                  setGenForm({ patientSearch: '', patientId: '', docType: 'SEMD_OUTPATIENT' });
                  setGenPatients([]);
                  setShowGenModal(true);
                }}
              >
                + Generate Document
              </button>
            </div>

            {docsLoading ? (
              <div className="egisz-empty">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="egisz-empty">No documents found</div>
            ) : (
              <table className="egisz-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Doc Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <React.Fragment key={doc.id}>
                      <tr>
                        <td>{formatDate(doc.createdAt)}</td>
                        <td>
                          {doc.patient
                            ? `${doc.patient.lastName} ${doc.patient.firstName}`
                            : '—'}
                        </td>
                        <td>
                          <span className="egisz-doc-type">
                            {DOC_TYPE_LABELS[doc.docType] ?? doc.docType}
                          </span>
                        </td>
                        <td>
                          <span className={`egisz-doc-status ${doc.status}`}>
                            {STATUS_LABELS[doc.status] ?? doc.status}
                          </span>
                        </td>
                        <td>
                          <div className="egisz-actions">
                            <button
                              className="egisz-action-btn"
                              onClick={() => setShowXmlId(showXmlId === doc.id ? null : doc.id)}
                            >
                              {showXmlId === doc.id ? 'Hide XML' : 'View XML'}
                            </button>
                            <button
                              className="egisz-action-btn"
                              onClick={() => {
                                setStatusModal({ docId: doc.id, current: doc.status });
                                setNewStatus(doc.status);
                              }}
                            >
                              Change Status
                            </button>
                            <button
                              className="egisz-action-btn danger"
                              onClick={() => deleteDoc(doc.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {showXmlId === doc.id && doc.xmlPayload && (
                        <tr>
                          <td colSpan={5} style={{ padding: 0 }}>
                            <div style={{ padding: '0 16px 16px' }}>
                              <div className="xml-viewer">{doc.xmlPayload}</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Generate Document Modal */}
      {showGenModal && (
        <div className="egisz-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowGenModal(false); }}>
          <div className="egisz-modal">
            <div className="egisz-modal-header">
              <h2>Generate СЭМД Document</h2>
              <button className="egisz-modal-close" onClick={() => setShowGenModal(false)}>&times;</button>
            </div>
            <div className="egisz-modal-body">
              <div className="egisz-form-group" style={{ position: 'relative' }}>
                <label>Patient *</label>
                <input
                  type="text"
                  value={genForm.patientSearch}
                  onChange={(e) => {
                    setGenForm({ ...genForm, patientSearch: e.target.value, patientId: '' });
                    searchPatients(e.target.value);
                  }}
                  placeholder="Search by patient name..."
                />
                {genPatients.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    zIndex: 100,
                    maxHeight: 160,
                    overflowY: 'auto',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}>
                    {genPatients.map((p) => (
                      <div
                        key={p.id}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}
                        onMouseDown={() => {
                          setGenForm({ ...genForm, patientId: p.id, patientSearch: `${p.lastName} ${p.firstName}` });
                          setGenPatients([]);
                        }}
                      >
                        {p.lastName} {p.firstName}
                      </div>
                    ))}
                  </div>
                )}
                {genForm.patientId && (
                  <span style={{ fontSize: 11, color: 'var(--primary-teal)' }}>Patient selected</span>
                )}
              </div>

              <div className="egisz-form-group">
                <label>Document Type</label>
                <select
                  style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, width: '100%' }}
                  value={genForm.docType}
                  onChange={(e) => setGenForm({ ...genForm, docType: e.target.value })}
                >
                  {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="egisz-modal-footer">
              <button
                style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}
                onClick={() => setShowGenModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--primary-teal)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!genForm.patientId || genLoading) ? 0.5 : 1 }}
                onClick={generateDoc}
                disabled={!genForm.patientId || genLoading}
              >
                {genLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusModal && (
        <div className="egisz-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setStatusModal(null); }}>
          <div className="egisz-modal" style={{ width: 360 }}>
            <div className="egisz-modal-header">
              <h2>Change Status</h2>
              <button className="egisz-modal-close" onClick={() => setStatusModal(null)}>&times;</button>
            </div>
            <div className="egisz-modal-body">
              <div className="egisz-form-group">
                <label>New Status</label>
                <select
                  style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, width: '100%' }}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="egisz-modal-footer">
              <button
                style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}
                onClick={() => setStatusModal(null)}
              >
                Cancel
              </button>
              <button
                style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--primary-teal)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                onClick={changeStatus}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Egisz;
