import React, { useState, useEffect, useCallback } from 'react';
import Avatar from 'boring-avatars';
import { api } from '../services/api';
import './PatientProfile.css';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconBack      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconEdit      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconPlus      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconPhone     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMail      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconCake      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v2"/><path d="M12 8v2"/><path d="M17 8v2"/></svg>;
const IconAlert     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const IconCheck     = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconChevron   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const IconSave      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconCalendar  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const IconReceipt   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>;
const IconClipboard = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>;
const IconTooth     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5.5c-1.5-2-4-2.5-5.5-1C4.5 6 4 8 4.5 10c.5 2 1 3.5 1 5.5 0 1.5.5 3 2 3s2-1.5 2-1.5.5 1.5 2.5 1.5 2.5-1.5 2.5-1.5 .5 1.5 2 1.5 2-1.5 2-3c0-2 .5-3.5 1-5.5.5-2 0-4-2-5.5-1.5-1-4-.5-5.5 1Z"/></svg>;
const IconShield    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconImage     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const IconUpload    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const IconX         = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate     = (d: string) => { const dt = new Date(d); return `${String(dt.getDate()).padStart(2,'0')}-${String(dt.getMonth()+1).padStart(2,'0')}-${dt.getFullYear()}`; };
const fmtDateTime = (d: string) => { const dt = new Date(d); return `${String(dt.getDate()).padStart(2,'0')}-${String(dt.getMonth()+1).padStart(2,'0')}-${dt.getFullYear()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`; };
const fmtTime     = (d: string) => { const dt = new Date(d); return `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`; };
const fmtCur      = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  SCHEDULED:   { label: 'Scheduled',   cls: 'chip-yellow' },
  CONFIRMED:   { label: 'Confirmed',   cls: 'chip-teal' },
  IN_PROGRESS: { label: 'In Progress', cls: 'chip-coral' },
  COMPLETED:   { label: 'Completed',   cls: 'chip-green' },
  CANCELLED:   { label: 'Cancelled',   cls: 'chip-gray' },
  NO_SHOW:     { label: 'No Show',     cls: 'chip-red' },
};

const INVOICE_STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT:     { label: 'Draft',     cls: 'chip-gray' },
  ISSUED:    { label: 'Issued',    cls: 'chip-yellow' },
  PAID:      { label: 'Paid',      cls: 'chip-green' },
  PARTIAL:   { label: 'Partial',   cls: 'chip-teal' },
  CANCELLED: { label: 'Cancelled', cls: 'chip-gray' },
  OVERDUE:   { label: 'Overdue',   cls: 'chip-red' },
};

const StatusChip: React.FC<{ status: string; map: Record<string, { label: string; cls: string }> }> = ({ status, map }) => {
  const cfg = map[status] ?? { label: status, cls: 'chip-gray' };
  return <span className={`pp-chip ${cfg.cls}`}>{cfg.label}</span>;
};

// ─── Dental Chart (внутри Clinical) ──────────────────────────────────────────

type LocalToothStatus = 'healthy' | 'filled' | 'cavity' | 'crown' | 'missing' | 'implant';
const apiToLocal: Record<string, LocalToothStatus> = {
  HEALTHY: 'healthy', FILLED: 'healthy', CARIES: 'cavity',
  CROWN: 'crown', EXTRACTED: 'missing', IMPLANT: 'implant',
  BRIDGE: 'crown', MISSING: 'missing', PROSTHESIS: 'crown',
  VENEER: 'filled', INLAY: 'filled',
};
const toothStatusLabel: Record<string, string> = {
  healthy: 'Healthy', filled: 'Filled', cavity: 'Cavity',
  crown: 'Crown', missing: 'Missing', implant: 'Implant',
};

const Tooth: React.FC<{ number: number; status: LocalToothStatus; isSelected: boolean; onClick: () => void }> = ({ number, status, isSelected, onClick }) => (
  <div className={`tooth ${status} ${isSelected ? 'selected' : ''}`} onClick={onClick} title={`#${number} — ${toothStatusLabel[status]}`}>
    <div className="tooth-crown" />
    <div className="tooth-roots"><div className="tooth-root" /><div className="tooth-root" /></div>
    <span className="tooth-number">{number}</span>
  </div>
);

// ─── Clinical Tab (Зубная карта + Здоровье + Диагнозы) ───────────────────────

const IMAGE_TYPE_LABELS: Record<string, string> = {
  ALL: 'All', XRAY: 'X-Ray', PHOTO: 'Photo', DOCUMENT: 'Document', OTHER: 'Other',
};

const ClinicalTab: React.FC<{ patient: any; patientId: string; onPatientUpdate: (p: any) => void }> = ({ patient, patientId, onPatientUpdate }) => {
  const [toothData, setToothData]   = useState<Record<number, LocalToothStatus>>({});
  const [selected, setSelected]     = useState<number | null>(null);
  const [allergies, setAllergies]   = useState(patient?.allergies ?? '');
  const [notes, setNotes]           = useState(patient?.notes ?? '');
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [records, setRecords]       = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  // Images
  const [images, setImages]         = useState<any[]>([]);
  const [imgFilter, setImgFilter]   = useState<string>('ALL');
  const [lightbox, setLightbox]     = useState<any | null>(null);
  const [uploading, setUploading]   = useState(false);
  const fileInputRef                = React.useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(() => {
    api.get(`/patients/${patientId}/files`).then((res: any) => {
      const items = res?.data ?? (Array.isArray(res) ? res : []);
      setImages(items.filter((f: any) => f.fileType === 'XRAY' || f.fileType === 'PHOTO'));
    }).catch(() => {});
  }, [patientId]);

  useEffect(() => {
    api.get(`/clinical/patients/${patientId}/dental-chart`).then((res: any) => {
      const data: any[] = res?.data ?? (Array.isArray(res) ? res : []);
      const map: Record<number, LocalToothStatus> = {};
      data.forEach(t => { map[t.toothNumber] = apiToLocal[t.status] ?? 'healthy'; });
      setToothData(map);
    }).catch(() => {});

    api.get('/clinical/medical-records', { patientId, limit: '20' }).then((res: any) => {
      setRecords(res?.data?.items ?? res?.data ?? []);
    }).catch(() => {}).finally(() => setRecLoading(false));

    fetchImages();
  }, [patientId, fetchImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      formData.append('fileType', ['dcm', 'dcm'].includes(ext) ? 'XRAY' : file.type.startsWith('image/') ? 'PHOTO' : 'OTHER');
      await api.post(`/patients/${patientId}/files`, formData);
      fetchImages();
    } catch { } finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await api.delete(`/patients/${patientId}/files/${fileId}`);
      setImages(prev => prev.filter(f => f.id !== fileId));
      if (lightbox?.id === fileId) setLightbox(null);
    } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/patients/${patientId}`, { allergies, notes });
      onPatientUpdate({ ...patient, allergies, notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { } finally { setSaving(false); }
  };

  const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeft  = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerLeft  = [31, 32, 33, 34, 35, 36, 37, 38];
  const statusOf   = (n: number): LocalToothStatus => toothData[n] ?? 'healthy';

  const legend = [
    { status: 'healthy', label: 'Healthy', color: '#E8E8ED' },
    { status: 'filled',  label: 'Filled',  color: 'rgba(13,115,119,0.3)' },
    { status: 'cavity',  label: 'Cavity',  color: 'rgba(242,204,143,0.5)' },
    { status: 'crown',   label: 'Crown',   color: 'rgba(20,145,155,0.3)' },
    { status: 'missing', label: 'Missing', color: 'transparent' },
    { status: 'implant', label: 'Implant', color: 'rgba(90,90,114,0.2)' },
  ];

  // Collect all unique diagnoses from all records
  const allDiagnoses: any[] = [];
  records.forEach(r => (r.diagnoses ?? []).forEach((d: any) => {
    if (d.diagnosis && !allDiagnoses.find(x => x.id === d.diagnosis.id)) allDiagnoses.push(d.diagnosis);
  }));

  const initialExams = records.filter(r => r.recordType === 'INITIAL_EXAM' || r.recordType === 'EXAMINATION');
  const lastExam     = initialExams[0];

  return (
    <div className="clinical-tab">

      {/* ── Row 1: Dental Chart ── */}
      <div className="clinical-section-title">Dental Chart</div>
      <div className="dental-chart-layout">
        <div className="dental-chart-main pp-card">
          <div className="chart-jaw-label">Upper Jaw</div>
          <div className="jaw-row">{[...upperRight, ...upperLeft].map(n => <Tooth key={n} number={n} status={statusOf(n)} isSelected={selected === n} onClick={() => setSelected(p => p === n ? null : n)} />)}</div>
          <div className="jaw-divider" />
          <div className="jaw-row">{[...lowerRight, ...lowerLeft].map(n => <Tooth key={n} number={n} status={statusOf(n)} isSelected={selected === n} onClick={() => setSelected(p => p === n ? null : n)} />)}</div>
          <div className="chart-jaw-label">Lower Jaw</div>
          <div className="chart-legend">
            {legend.map(l => (
              <div key={l.status} className="legend-item">
                <div className="legend-swatch" style={{ background: l.color, border: l.status === 'missing' ? '2px dashed #C0C0CC' : `2px solid ${l.color}` }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dental-detail-panel pp-card">
          {selected ? (
            <div className="tooth-detail">
              <h3>Tooth #{selected}</h3>
              <p className="tooth-status-label">{toothStatusLabel[statusOf(selected)]}</p>
              <div className="tooth-detail-info">
                <div className="detail-info-row"><span>Status</span><span className="pp-chip chip-teal">{toothStatusLabel[statusOf(selected)]}</span></div>
              </div>
            </div>
          ) : (
            <div className="tooth-detail-empty"><div style={{ fontSize: 40, opacity: 0.35 }}>🦷</div><p>Click a tooth to view details</p></div>
          )}
        </div>
      </div>

      {/* ── Row 2: Health Profile + Diagnoses ── */}
      <div className="clinical-section-title" style={{ marginTop: 24 }}>Anamnesis & Health Profile</div>
      <div className="clinical-bottom-grid">

        {/* Allergies & Notes */}
        <div className="pp-card">
          <div className="pp-card-title">Allergies & Contraindications</div>
          <textarea
            className="pp-textarea"
            rows={3}
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
            placeholder="Penicillin allergy, latex allergy, local anesthetics…"
          />
          <div className="pp-card-title" style={{ marginTop: 14 }}>Clinical Notes</div>
          <textarea
            className="pp-textarea"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Chronic conditions, medications, relevant history…"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <button className="pp-btn-primary" onClick={handleSave} disabled={saving}>
              <IconSave /> {saving ? 'Saving…' : 'Save'}
            </button>
            {saved && <span style={{ fontSize: 13, color: 'var(--secondary-seafoam)' }}>✓ Saved</span>}
          </div>
        </div>

        {/* Last exam + Diagnoses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* External exam / initial exam */}
          <div className="pp-card">
            <div className="pp-card-title">Initial Examination</div>
            {recLoading ? (
              <div className="pp-loading-sm">Loading…</div>
            ) : lastExam ? (
              <div className="exam-view">
                <div className="exam-meta">{fmtDate(lastExam.createdAt)}{lastExam.createdBy && <span> · Dr. {lastExam.createdBy.name}</span>}</div>
                {lastExam.complaints && <div className="mr-field"><span className="mr-label">Complaints</span><span>{lastExam.complaints}</span></div>}
                {lastExam.anamnesis  && <div className="mr-field"><span className="mr-label">Anamnesis</span><span>{lastExam.anamnesis}</span></div>}
                {lastExam.notes      && <div className="mr-field"><span className="mr-label">Notes</span><span>{lastExam.notes}</span></div>}
              </div>
            ) : (
              <div className="pp-empty-sm">No examination records yet</div>
            )}
          </div>

          {/* All-time diagnoses */}
          <div className="pp-card">
            <div className="pp-card-header">
              <div className="pp-card-title">Diagnoses</div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{allDiagnoses.length} unique</span>
            </div>
            {allDiagnoses.length === 0 ? (
              <div className="pp-empty-sm">No diagnoses recorded</div>
            ) : (
              <div className="diagnosis-cloud">
                {allDiagnoses.map((d: any) => (
                  <span key={d.id} className="pp-chip chip-teal diagnosis-chip">{d.code} — {d.name}</span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      {/* ── Row 3: Images ── */}
      <div className="clinical-section-title" style={{ marginTop: 24 }}>Images & X-Rays</div>
      <div className="pp-card">
        <div className="pp-card-header">
          <div className="pp-filter-row" style={{ marginBottom: 0 }}>
            {Object.entries(IMAGE_TYPE_LABELS).map(([key, label]) => (
              <button key={key} className={`pp-filter-btn ${imgFilter === key ? 'active' : ''}`} onClick={() => setImgFilter(key)}>
                {label}{key !== 'ALL' && images.filter(f => f.fileType === key).length > 0 && ` (${images.filter(f => f.fileType === key).length})`}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="pp-btn-ghost" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <IconUpload /> {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,.dcm,.pdf" style={{ display: 'none' }} onChange={handleUpload} />
          </div>
        </div>

        {(() => {
          const filtered = imgFilter === 'ALL' ? images : images.filter(f => f.fileType === imgFilter);
          if (filtered.length === 0) return (
            <div className="img-upload-hint">
              <div className="img-upload-icon"><IconImage /></div>
              <p>No images yet. Upload X-rays or photos using the button above.</p>
              <p style={{ fontSize: 12, opacity: 0.7 }}>Supported: JPEG, PNG, WebP, DICOM (.dcm)</p>
            </div>
          );
          return (
            <div className="img-gallery">
              {filtered.map((f: any) => (
                <div key={f.id} className="img-thumb" onClick={() => setLightbox(f)}>
                  {f.mimeType?.startsWith('image/') ? (
                    <img src={f.url} alt={f.originalName} />
                  ) : (
                    <div className="img-thumb-placeholder"><IconImage /><span>.{f.originalName.split('.').pop()}</span></div>
                  )}
                  <div className="img-thumb-overlay">
                    <div className="img-thumb-name">{f.originalName}</div>
                    <div className="img-thumb-meta">{fmtDate(f.createdAt)}{f.uploadedBy && ` · ${f.uploadedBy.name}`}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-box" onClick={e => e.stopPropagation()}>
            <div className="lightbox-header">
              <div>
                <div className="lightbox-title">{lightbox.originalName}</div>
                <div className="lightbox-meta">{fmtDate(lightbox.createdAt)}{lightbox.uploadedBy && ` · Dr. ${lightbox.uploadedBy.name}`}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="pp-btn-ghost" style={{ color: '#c0390a', borderColor: 'rgba(192,57,10,0.3)' }} onClick={() => handleDelete(lightbox.id)}>
                  Delete
                </button>
                <button className="lightbox-close" onClick={() => setLightbox(null)}><IconX /></button>
              </div>
            </div>
            <div className="lightbox-body">
              {lightbox.mimeType?.startsWith('image/') ? (
                <img src={lightbox.url} alt={lightbox.originalName} />
              ) : (
                <div className="lightbox-nopreview">
                  <IconImage />
                  <p>Preview not available for this file type</p>
                  <a href={lightbox.url} target="_blank" rel="noreferrer" className="pp-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Open File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Diary Tab ────────────────────────────────────────────────────────────────

const DiaryTab: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [diary, setDiary]       = useState<any[]>([]);
  const [records, setRecords]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeView, setActiveView] = useState<'diary' | 'records'>('diary');

  useEffect(() => {
    Promise.all([
      api.get(`/clinical/patients/${patientId}/diary`).then((res: any) => res?.data?.items ?? res?.data ?? []).catch(() => []),
      api.get('/clinical/medical-records', { patientId, limit: '50' }).then((res: any) => res?.data?.items ?? res?.data ?? []).catch(() => []),
    ]).then(([d, r]) => {
      setDiary(d);
      setRecords(r);
    }).finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <div className="pp-loading"><div className="loading-spinner" /></div>;

  return (
    <div className="pp-section">
      <div className="pp-filter-row">
        <button className={`pp-filter-btn ${activeView === 'diary' ? 'active' : ''}`} onClick={() => setActiveView('diary')}>
          Diary ({diary.length})
        </button>
        <button className={`pp-filter-btn ${activeView === 'records' ? 'active' : ''}`} onClick={() => setActiveView('records')}>
          Medical Records ({records.length})
        </button>
      </div>

      {activeView === 'diary' && (
        diary.length === 0 ? (
          <div className="pp-empty">No diary entries yet</div>
        ) : (
          <div className="diary-list">
            {diary.map((entry: any, i: number) => (
              <div key={entry.id || i} className="diary-entry pp-card">
                <div className="diary-entry-meta">
                  <span className="diary-date">{fmtDate(entry.recordDate ?? entry.createdAt)}</span>
                  {entry.doctor && <span className="diary-doctor">Dr. {entry.doctor.name}</span>}
                  {entry.appointment && <span className="pp-chip chip-gray" style={{ fontSize: 11 }}>Linked to visit</span>}
                </div>
                <div className="diary-content">{entry.content}</div>
              </div>
            ))}
          </div>
        )
      )}

      {activeView === 'records' && (
        records.length === 0 ? (
          <div className="pp-empty">No medical records yet</div>
        ) : (
          <div className="records-timeline">
            {records.map((r: any, i: number) => (
              <div key={r.id || i} className="record-entry">
                <div className="record-entry-meta">
                  <span className="record-date">{fmtDateTime(r.createdAt)}</span>
                  {r.createdBy && <span className="record-doctor">{r.createdBy.name}</span>}
                  <span className="pp-chip chip-gray" style={{ fontSize: 10 }}>{r.recordType?.replace(/_/g, ' ')}</span>
                </div>
                <div className="record-entry-body">
                  {r.complaints  && <div className="mr-field"><span className="mr-label">Complaints</span><span>{r.complaints}</span></div>}
                  {r.anamnesis   && <div className="mr-field"><span className="mr-label">Anamnesis</span><span>{r.anamnesis}</span></div>}
                  {r.diagnoses?.length > 0 && (
                    <div className="mr-field">
                      <span className="mr-label">Diagnoses</span>
                      <div className="mr-diagnoses">{r.diagnoses.map((d: any, j: number) => <span key={j} className="pp-chip chip-teal">{d.diagnosis?.code} {d.diagnosis?.name}</span>)}</div>
                    </div>
                  )}
                  {r.treatmentPlan && <div className="mr-field"><span className="mr-label">Treatment done</span><span>{r.treatmentPlan}</span></div>}
                  {r.notes       && <div className="mr-field"><span className="mr-label">Notes</span><span>{r.notes}</span></div>}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

// ─── Labels Block ─────────────────────────────────────────────────────────────

const LabelsBlock: React.FC<{ patientId: string; compact?: boolean }> = ({ patientId, compact }) => {
  const [assigned, setAssigned]     = useState<any[]>([]);
  const [allLabels, setAllLabels]   = useState<any[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState('');
  const [newColor, setNewColor]     = useState('#14919B');
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    api.get(`/patients/${patientId}/labels`).then((res: any) => setAssigned(res?.data ?? [])).catch(() => {});
    api.get('/labels').then((res: any) => setAllLabels(res?.data ?? [])).catch(() => {});
  }, [patientId]);

  const assign = async (label: any) => {
    if (assigned.find(l => l.id === label.id)) { unassign(label.id); return; }
    try {
      await api.post(`/patients/${patientId}/labels`, { labelId: label.id });
      setAssigned(prev => [...prev, label]);
    } catch {}
  };

  const unassign = async (labelId: string) => {
    try {
      await api.delete(`/patients/${patientId}/labels/${labelId}`);
      setAssigned(prev => prev.filter(l => l.id !== labelId));
    } catch {}
  };

  const createLabel = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res: any = await api.post('/labels', { name: newName.trim(), color: newColor, textColor: '#ffffff' });
      const label = res?.data ?? res;
      setAllLabels(prev => [...prev, label]);
      setNewName(''); setShowCreate(false);
    } catch {} finally { setSaving(false); }
  };

  const PRESET_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899','#6b7280','#0D7377'];

  const picker = showPicker && (
    <div className={compact ? 'label-picker label-picker-header' : 'label-picker'}>
      <div className="label-picker-list">
        {allLabels.map(l => {
          const isOn = !!assigned.find(a => a.id === l.id);
          return (
            <button key={l.id} className={`label-picker-item ${isOn ? 'on' : ''}`} onClick={() => assign(l)}>
              <span className="label-dot" style={{ background: l.color }} />
              <span>{l.name}</span>
              {isOn && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--secondary-seafoam)' }}>✓</span>}
            </button>
          );
        })}
        {allLabels.length === 0 && <div className="pp-empty-sm">No tags yet — create one below</div>}
      </div>
      <div className="label-picker-divider" />
      {showCreate ? (
        <div className="label-create-form">
          <input
            className="pp-input" placeholder="Tag name…" autoFocus
            value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createLabel()}
          />
          <div className="color-presets">
            {PRESET_COLORS.map(c => (
              <button key={c} className={`color-preset ${newColor === c ? 'selected' : ''}`}
                style={{ background: c }} onClick={() => setNewColor(c)} />
            ))}
            <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="color-input-custom" title="Custom color" />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button className="pp-btn-primary" onClick={createLabel} disabled={saving || !newName.trim()}>
              {saving ? 'Creating…' : 'Create'}
            </button>
            <button className="pp-btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="label-picker-new" onClick={() => setShowCreate(true)}>
          <IconPlus /> Create new tag
        </button>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="header-labels-wrap">
        <div className="header-labels-row">
          {assigned.map(l => (
            <span key={l.id} className="label-chip" style={{ background: l.color, color: l.textColor ?? '#fff' }}>
              {l.name}
              <button className="label-chip-remove" onClick={() => unassign(l.id)}>×</button>
            </span>
          ))}
          <button className="header-label-add-btn" onClick={() => { setShowPicker(p => !p); setShowCreate(false); }} title="Manage tags">
            <IconPlus />
          </button>
        </div>
        {picker}
      </div>
    );
  }

  return (
    <div className="pp-card">
      <div className="pp-card-header">
        <div className="pp-card-title">Tags</div>
        <button className="pp-btn-ghost" onClick={() => { setShowPicker(p => !p); setShowCreate(false); }}>
          <IconPlus /> Add tag
        </button>
      </div>
      <div className="labels-assigned">
        {assigned.length === 0
          ? <span className="info-row-empty">No tags assigned</span>
          : assigned.map(l => (
              <span key={l.id} className="label-chip" style={{ background: l.color, color: l.textColor ?? '#fff' }}>
                {l.name}
                <button className="label-chip-remove" onClick={() => unassign(l.id)}>×</button>
              </span>
            ))
        }
      </div>
      {picker}
    </div>
  );
};

// ─── Comments Block ────────────────────────────────────────────────────────────

const CommentsBlock: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [comments, setComments]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [text, setText]           = useState('');
  const [sending, setSending]     = useState(false);

  const load = useCallback(() => {
    api.get(`/patients/${patientId}/comments`).then((res: any) => {
      setComments(res?.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post(`/patients/${patientId}/comments`, { content: text.trim() });
      setText('');
      load();
    } catch {} finally { setSending(false); }
  };

  const pin = async (c: any) => {
    try {
      await api.put(`/patients/${patientId}/comments/${c.id}`, { isPinned: !c.isPinned });
      load();
    } catch {}
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/patients/${patientId}/comments/${id}`);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  return (
    <div className="pp-card">
      <div className="pp-card-title">Comments</div>

      {/* Input */}
      <div className="comment-input-row">
        <textarea
          className="pp-textarea comment-textarea"
          rows={2}
          placeholder="Add a note…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
        />
        <button className="pp-btn-primary comment-send-btn" onClick={submit} disabled={sending || !text.trim()}>
          {sending ? '…' : 'Add'}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="pp-loading-sm">Loading…</div>
      ) : comments.length === 0 ? (
        <div className="pp-empty-sm">No comments yet</div>
      ) : (
        <div className="comments-list">
          {comments.map((c: any) => (
            <div key={c.id} className={`comment-item ${c.isPinned ? 'pinned' : ''}`}>
              <div className="comment-body">
                {c.isPinned && <span className="comment-pin-badge">📌 Pinned</span>}
                <div className="comment-text">{c.content}</div>
                <div className="comment-meta">
                  {c.author?.name && <span>{c.author.name}</span>}
                  <span>{fmtDateTime(c.createdAt)}</span>
                </div>
              </div>
              <div className="comment-actions">
                <button className="comment-action-btn" onClick={() => pin(c)} title={c.isPinned ? 'Unpin' : 'Pin'}>
                  {c.isPinned ? '📌' : '📍'}
                </button>
                <button className="comment-action-btn danger" onClick={() => remove(c.id)} title="Delete">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OverviewTab: React.FC<{ patient: any; patientId: string; onTabChange: (tab: string) => void }> = ({ patient, patientId, onTabChange }) => {
  const appointments   = patient?.appointments ?? [];
  const treatmentPlans = patient?.treatmentPlans ?? [];
  const activePlan     = treatmentPlans.find((p: any) => p.status === 'ACTIVE') ?? treatmentPlans[0];
  const invoices       = patient?.invoices ?? [];
  const totalSpent     = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + Number(i.totalAmount), 0);
  const outstanding    = invoices.filter((i: any) => i.status !== 'PAID' && i.status !== 'CANCELLED').reduce((s: number, i: any) => s + Number(i.totalAmount) - Number(i.paidAmount ?? 0), 0);
  const deposit        = patient?.balance ? Number(patient.balance.cashBalance ?? 0) + Number(patient.balance.cardBalance ?? 0) : 0;
  const bonuses        = patient?.bonuses?.balance ?? 0;

  const now      = new Date();
  const upcoming = [...appointments].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).find((a: any) => new Date(a.startTime) > now);
  const recent   = [...appointments].filter((a: any) => new Date(a.startTime) <= now).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).slice(0, 4);

  const planItems  = activePlan?.items ?? [];
  const doneItems  = planItems.filter((i: any) => i.isDone).length;
  const planPct    = planItems.length > 0 ? Math.round(doneItems / planItems.length * 100) : 0;

  return (
    <div className="overview-layout">

      {/* ── Quick Actions ── */}
      <div className="quick-actions-bar">
        <button className="qa-btn">
          <div className="qa-icon qa-icon-teal"><IconCalendar /></div>
          <span>New Appointment</span>
        </button>
        <button className="qa-btn" onClick={() => onTabChange('finances')}>
          <div className="qa-icon qa-icon-green"><IconReceipt /></div>
          <span>New Invoice</span>
        </button>
        <button className="qa-btn" onClick={() => onTabChange('treatment')}>
          <div className="qa-icon qa-icon-coral"><IconClipboard /></div>
          <span>Treatment Plan</span>
        </button>
        <button className="qa-btn" onClick={() => onTabChange('clinical')}>
          <div className="qa-icon qa-icon-purple"><IconTooth /></div>
          <span>Clinical</span>
        </button>
        <button className="qa-btn" onClick={() => onTabChange('info')}>
          <div className="qa-icon qa-icon-blue"><IconShield /></div>
          <span>Patient Info</span>
        </button>
      </div>

      {/* ── Medical alert banner ── */}
      {patient?.allergies && (
        <div className="alert-banner">
          <IconAlert />
          <div>
            <strong>Allergy / Contraindication</strong>
            <span>{patient.allergies}</span>
          </div>
          <button className="pp-link" onClick={() => onTabChange('anamnesis')}>Edit →</button>
        </div>
      )}

      <div className="overview-grid">

        {/* ── Left column ── */}
        <div className="overview-col">

          {/* Next appointment */}
          <div className="pp-card">
            <div className="pp-card-header">
              <div className="pp-card-title">Next Appointment</div>
              <button className="pp-link" onClick={() => onTabChange('visits')}>All visits →</button>
            </div>
            {upcoming ? (
              <div className="upcoming-block">
                <div className="upcoming-date">{fmtDate(upcoming.startTime)}</div>
                <div className="upcoming-time">{fmtTime(upcoming.startTime)} – {fmtTime(upcoming.endTime)}</div>
                <div className="upcoming-row">
                  {upcoming.doctor && <span className="upcoming-meta">👨‍⚕️ Dr. {upcoming.doctor.name}</span>}
                  {upcoming.branch && <span className="upcoming-meta">📍 {upcoming.branch.name}</span>}
                </div>
                {upcoming.services?.length > 0 && (
                  <div className="upcoming-services">{upcoming.services.map((s: any) => s.service?.name).filter(Boolean).join(' · ')}</div>
                )}
                {upcoming.notes && <div className="upcoming-notes">"{upcoming.notes}"</div>}
                <StatusChip status={upcoming.status} map={STATUS_LABELS} />
              </div>
            ) : (
              <div className="pp-empty-sm">No upcoming appointments</div>
            )}
          </div>

          {/* Recent visits */}
          <div className="pp-card">
            <div className="pp-card-header">
              <div className="pp-card-title">Recent Visits</div>
              <button className="pp-link" onClick={() => onTabChange('info')}>{appointments.length} total →</button>
            </div>
            {recent.length === 0 ? (
              <div className="pp-empty-sm">No visits yet</div>
            ) : (
              <div className="visit-timeline">
                {recent.map((a: any, i: number) => (
                  <div key={a.id || i} className="visit-item">
                    <div className={`visit-dot ${(a.status ?? 'completed').toLowerCase()}`} />
                    <div className="visit-content">
                      <div className="visit-header-row">
                        <div className="visit-date">{fmtDate(a.startTime)}</div>
                        <StatusChip status={a.status} map={STATUS_LABELS} />
                      </div>
                      {a.services?.length > 0 && <div className="visit-proc">{a.services.map((s: any) => s.service?.name).filter(Boolean).join(', ')}</div>}
                      {a.doctor && <div className="visit-meta">👨‍⚕️ Dr. {a.doctor.name}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="overview-col">

          {/* Finance summary */}
          <div className="pp-card">
            <div className="pp-card-header">
              <div className="pp-card-title">Finances</div>
              <button className="pp-link" onClick={() => onTabChange('finances')}>Details →</button>
            </div>
            <div className="fin-grid">
              <div className="fin-cell">
                <div className="fin-val">{fmtCur(totalSpent)}</div>
                <div className="fin-lbl">Total Paid</div>
              </div>
              <div className="fin-cell">
                <div className="fin-val" style={{ color: outstanding > 0 ? '#c0390a' : undefined }}>{fmtCur(outstanding)}</div>
                <div className="fin-lbl">Outstanding</div>
              </div>
              <div className="fin-cell">
                <div className="fin-val">{fmtCur(deposit)}</div>
                <div className="fin-lbl">Deposit</div>
              </div>
              <div className="fin-cell">
                <div className="fin-val">{bonuses}</div>
                <div className="fin-lbl">Bonuses</div>
              </div>
            </div>
          </div>

          {/* Active treatment plan */}
          {activePlan ? (
            <div className="pp-card">
              <div className="pp-card-header">
                <div className="pp-card-title">Active Treatment Plan</div>
                <button className="pp-link" onClick={() => onTabChange('treatment')}>Details →</button>
              </div>
              <div className="plan-name">{activePlan.name}</div>
              {planItems.length > 0 && (
                <>
                  <div className="plan-progress" style={{ marginTop: 10 }}>
                    <div className="plan-progress-bar">
                      <div className="plan-progress-fill" style={{ width: `${planPct}%` }} />
                    </div>
                    <span className="plan-progress-label">{doneItems}/{planItems.length} steps · {planPct}%</span>
                  </div>
                  <div className="plan-items-preview">
                    {planItems.slice(0, 4).map((item: any, i: number) => (
                      <div key={i} className={`plan-item-row ${item.isDone ? 'done' : ''}`}>
                        <div className={`plan-item-dot ${item.isDone ? 'done' : ''}`} />
                        <span>{item.service?.name ?? '—'}</span>
                        {item.toothNumber && <span className="plan-item-tooth">#{item.toothNumber}</span>}
                        {item.isDone && <span className="pp-chip chip-green" style={{ fontSize: 10 }}>Done</span>}
                      </div>
                    ))}
                    {planItems.length > 4 && <div className="pp-empty-sm">+{planItems.length - 4} more items</div>}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="pp-card pp-card-empty-action">
              <div className="pp-card-title">Treatment Plan</div>
              <div className="pp-empty-sm">No active plan</div>
              <button className="pp-btn-secondary" style={{ marginTop: 8 }} onClick={() => onTabChange('treatment')}>
                <IconPlus /> Create Plan
              </button>
            </div>
          )}

          {/* Clinical notes */}
          {patient?.notes && (
            <div className="pp-card">
              <div className="pp-card-header">
                <div className="pp-card-title">Clinical Notes</div>
                <button className="pp-link" onClick={() => onTabChange('anamnesis')}>Edit →</button>
              </div>
              <p className="clinical-notes-text">{patient.notes}</p>
            </div>
          )}

        </div>
      </div>

      {/* ── Comments ── */}
      <CommentsBlock patientId={patientId} />

    </div>
  );
};

// ─── Visits Section (used inside InfoTab) ────────────────────────────────────

const VisitsSection: React.FC<{ patient: any; onOpenVisit?: (aptId: string) => void }> = ({ patient, onOpenVisit }) => {
  const [filter, setFilter]       = useState<string>('ALL');
  const [expandedId, setExpanded] = useState<string | null>(null);
  const [records, setRecords]     = useState<Record<string, any>>({});

  const appointments: any[] = patient?.appointments ?? [];
  const filtered = filter === 'ALL' ? appointments : appointments.filter((a: any) => a.status === filter);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!records[id]) {
      try {
        const res: any = await api.get('/clinical/medical-records', { appointmentId: id });
        const items = res?.data?.items ?? res?.data ?? [];
        setRecords(prev => ({ ...prev, [id]: items[0] ?? null }));
      } catch { setRecords(prev => ({ ...prev, [id]: null })); }
    }
  };

  const filters = ['ALL', 'COMPLETED', 'SCHEDULED', 'CONFIRMED', 'CANCELLED', 'NO_SHOW'];

  return (
    <div>
      <div className="pp-filter-row" style={{ marginBottom: 12 }}>
        {filters.map(f => (
          <button key={f} className={`pp-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'ALL' ? `All (${appointments.length})` : (STATUS_LABELS[f]?.label ?? f)}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="pp-empty-sm">No visits found</div>
      ) : (
        <div className="visits-list">
          {filtered.map((a: any) => (
            <div key={a.id} className={`visit-card ${expandedId === a.id ? 'expanded' : ''}`}>
              <div className="visit-card-main" onClick={() => toggleExpand(a.id)}>
                <div className="visit-card-left">
                  <div className="visit-card-date">{fmtDate(a.startTime)}</div>
                  <div className="visit-card-time">{fmtTime(a.startTime)} – {fmtTime(a.endTime)}</div>
                </div>
                <div className="visit-card-center">
                  {a.services?.length > 0
                    ? <div className="visit-card-services">{a.services.map((s: any) => s.service?.name).filter(Boolean).join(' · ')}</div>
                    : <div className="visit-card-services" style={{ opacity: 0.5 }}>No services recorded</div>
                  }
                  {a.doctor && <div className="visit-card-meta">👨‍⚕️ Dr. {a.doctor.name}</div>}
                  {a.branch && <div className="visit-card-meta">📍 {a.branch.name}</div>}
                  {a.notes  && <div className="visit-card-meta" style={{ fontStyle: 'italic' }}>"{a.notes}"</div>}
                </div>
                <div className="visit-card-right">
                  <StatusChip status={a.status} map={STATUS_LABELS} />
                  {onOpenVisit && (
                    <button
                      className="pp-btn-visit-form"
                      title="Open Visit Form"
                      onClick={(e) => { e.stopPropagation(); onOpenVisit(a.id); }}
                    >🦷</button>
                  )}
                  <div className={`visit-chevron ${expandedId === a.id ? 'open' : ''}`}><IconChevron /></div>
                </div>
              </div>
              {expandedId === a.id && (
                <div className="visit-record-expand">
                  {records[a.id] === undefined ? (
                    <div className="pp-loading-sm">Loading…</div>
                  ) : records[a.id] === null ? (
                    <div className="pp-empty-sm">No medical record for this visit</div>
                  ) : (
                    <div className="medical-record-view">
                      {records[a.id].complaints  && <div className="mr-field"><span className="mr-label">Complaints</span><span>{records[a.id].complaints}</span></div>}
                      {records[a.id].anamnesis   && <div className="mr-field"><span className="mr-label">Anamnesis</span><span>{records[a.id].anamnesis}</span></div>}
                      {records[a.id].diagnoses?.length > 0 && (
                        <div className="mr-field"><span className="mr-label">Diagnoses</span>
                          <div className="mr-diagnoses">{records[a.id].diagnoses.map((d: any, i: number) => <span key={i} className="pp-chip chip-teal">{d.diagnosis?.code} — {d.diagnosis?.name}</span>)}</div>
                        </div>
                      )}
                      {records[a.id].treatmentPlan && <div className="mr-field"><span className="mr-label">Treatment done</span><span>{records[a.id].treatmentPlan}</span></div>}
                      {records[a.id].notes       && <div className="mr-field"><span className="mr-label">Doctor's notes</span><span>{records[a.id].notes}</span></div>}
                      {records[a.id].createdBy   && <div className="mr-field"><span className="mr-label">Recorded by</span><span>{records[a.id].createdBy.name}</span></div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Patient Info Tab ──────────────────────────────────────────────────────────

const InfoTab: React.FC<{ patient: any; patientId: string; onPatientUpdate: (p: any) => void; onOpenVisit?: (aptId: string) => void }> = ({ patient, patientId, onPatientUpdate, onOpenVisit }) => {
  const contacts  = patient?.contacts ?? [];
  const relatives = patient?.relatives ?? [];
  const insurances = patient?.insurances ?? [];
  const groups    = patient?.groupMemberships ?? [];
  const promotions = patient?.promotionUsages ?? [];

  const phones = contacts.filter((c: any) => c.type === 'PHONE');
  const emails  = contacts.filter((c: any) => c.type === 'EMAIL');
  const address = contacts.find((c: any) => c.type === 'ADDRESS')?.value;

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({
    passportSeries: patient?.passportSeries ?? '',
    passportNumber: patient?.passportNumber ?? '',
    snils:          patient?.snils ?? '',
    inn:            patient?.inn ?? '',
    referralSource: patient?.referralSource ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/patients/${patientId}`, form);
      onPatientUpdate({ ...patient, ...form });
      setEditing(false);
    } catch { } finally { setSaving(false); }
  };

  return (
    <div className="pp-section">
      <div className="info-tab-grid">

        {/* ── Contacts ── */}
        <div className="pp-card">
          <div className="pp-card-title">Contact Information</div>
          <div className="info-rows">
            {phones.length > 0
              ? phones.map((c: any, i: number) => (
                  <div key={i} className="info-row">
                    <span className="info-row-label">
                      <IconPhone /> {c.isPrimary ? 'Primary Phone' : (c.label || 'Phone')}
                    </span>
                    <span className="info-row-val">
                      <a href={`tel:${c.value}`} className="pp-link-plain">{c.value}</a>
                      {c.isPrimary && <span className="pp-chip chip-teal" style={{ fontSize: 10, marginLeft: 6 }}>Primary</span>}
                    </span>
                  </div>
                ))
              : <div className="info-row"><span className="info-row-label"><IconPhone /> Phone</span><span className="info-row-empty">—</span></div>
            }
            {emails.length > 0
              ? emails.map((c: any, i: number) => (
                  <div key={i} className="info-row">
                    <span className="info-row-label"><IconMail /> {c.label || 'Email'}</span>
                    <span className="info-row-val"><a href={`mailto:${c.value}`} className="pp-link-plain">{c.value}</a></span>
                  </div>
                ))
              : <div className="info-row"><span className="info-row-label"><IconMail /> Email</span><span className="info-row-empty">—</span></div>
            }
            {address && (
              <div className="info-row">
                <span className="info-row-label">📍 Address</span>
                <span className="info-row-val">{address}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Documents ── */}
        <div className="pp-card">
          <div className="pp-card-header">
            <div className="pp-card-title">Documents & IDs</div>
            <button className="pp-btn-ghost" onClick={() => setEditing(e => !e)}><IconEdit /> Edit</button>
          </div>
          {editing ? (
            <div className="edit-form">
              <div className="edit-row">
                <div className="pp-field">
                  <label className="pp-label">Passport Series</label>
                  <input className="pp-input" value={form.passportSeries} onChange={e => setForm(f => ({ ...f, passportSeries: e.target.value }))} placeholder="1234" />
                </div>
                <div className="pp-field">
                  <label className="pp-label">Passport Number</label>
                  <input className="pp-input" value={form.passportNumber} onChange={e => setForm(f => ({ ...f, passportNumber: e.target.value }))} placeholder="567890" />
                </div>
              </div>
              <div className="edit-row">
                <div className="pp-field">
                  <label className="pp-label">SNILS</label>
                  <input className="pp-input" value={form.snils} onChange={e => setForm(f => ({ ...f, snils: e.target.value }))} placeholder="XXX-XXX-XXX XX" />
                </div>
                <div className="pp-field">
                  <label className="pp-label">INN</label>
                  <input className="pp-input" value={form.inn} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} placeholder="123456789012" />
                </div>
              </div>
              <div className="pp-field">
                <label className="pp-label">Referral Source</label>
                <select className="pp-input" value={form.referralSource} onChange={e => setForm(f => ({ ...f, referralSource: e.target.value }))}>
                  <option value="">— Not specified —</option>
                  <option value="SOCIAL_MEDIA">Social Media</option>
                  <option value="RECOMMENDATION">Recommendation</option>
                  <option value="SEARCH_ENGINE">Search Engine</option>
                  <option value="ADVERTISEMENT">Advertisement</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="edit-actions">
                <button className="pp-btn-primary" onClick={handleSave} disabled={saving}><IconSave /> {saving ? 'Saving…' : 'Save'}</button>
                <button className="pp-btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="info-rows">
              <div className="info-row"><span className="info-row-label">Passport</span><span className="info-row-val">{patient?.passportSeries || patient?.passportNumber ? `${patient.passportSeries ?? ''} ${patient.passportNumber ?? ''}`.trim() : <span className="info-row-empty">—</span>}</span></div>
              <div className="info-row"><span className="info-row-label">SNILS</span><span className="info-row-val">{patient?.snils || <span className="info-row-empty">—</span>}</span></div>
              <div className="info-row"><span className="info-row-label">INN</span><span className="info-row-val">{patient?.inn || <span className="info-row-empty">—</span>}</span></div>
              <div className="info-row"><span className="info-row-label">Referral</span><span className="info-row-val">{patient?.referralSource ? patient.referralSource.replace(/_/g, ' ') : <span className="info-row-empty">—</span>}</span></div>
            </div>
          )}
        </div>

        {/* ── Insurance / Policies ── */}
        <div className="pp-card">
          <div className="pp-card-header">
            <div className="pp-card-title">Insurance & Policies</div>
            <button className="pp-btn-ghost"><IconPlus /> Add</button>
          </div>
          {insurances.length === 0 ? (
            <div className="pp-empty-sm">No insurance policies on file</div>
          ) : (
            <div className="insurance-list">
              {insurances.map((ins: any, i: number) => (
                <div key={i} className={`insurance-row ${ins.isActive ? '' : 'inactive'}`}>
                  <div className="insurance-row-left">
                    <div className="insurance-company">{ins.company?.name ?? '—'}</div>
                    {ins.policyNumber && <div className="insurance-policy">Policy: {ins.policyNumber}</div>}
                    {ins.validFrom && ins.validTo && (
                      <div className="insurance-dates">{fmtDate(ins.validFrom)} — {fmtDate(ins.validTo)}</div>
                    )}
                  </div>
                  <div className="insurance-row-right">
                    <span className={`pp-chip ${ins.type === 'OMS' || ins.type === 'PUBLIC' ? 'chip-teal' : 'chip-yellow'}`}>{ins.type}</span>
                    {!ins.isActive && <span className="pp-chip chip-gray" style={{ fontSize: 10 }}>Expired</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Relatives & Emergency contacts ── */}
        <div className="pp-card">
          <div className="pp-card-header">
            <div className="pp-card-title">Relatives & Emergency Contacts</div>
            <button className="pp-btn-ghost"><IconPlus /> Add</button>
          </div>
          {relatives.length === 0 ? (
            <div className="pp-empty-sm">No contacts added</div>
          ) : (
            <div className="relatives-list">
              {relatives.map((r: any, i: number) => (
                <div key={i} className="relative-row">
                  <div className="relative-info">
                    <div className="relative-name">
                      {r.name}
                      {r.isGuardian && <span className="pp-chip chip-coral" style={{ fontSize: 10, marginLeft: 6 }}>Guardian</span>}
                    </div>
                    <div className="relative-type">{r.relativeType?.replace(/_/g, ' ')}</div>
                  </div>
                  <div className="relative-contacts">
                    {r.phone && <a href={`tel:${r.phone}`} className="pp-link-plain relative-contact"><IconPhone /> {r.phone}</a>}
                    {r.email && <a href={`mailto:${r.email}`} className="pp-link-plain relative-contact"><IconMail /> {r.email}</a>}
                  </div>
                  {r.notes && <div className="relative-notes">{r.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Loyalty & Groups ── */}
        <div className="pp-card">
          <div className="pp-card-title">Loyalty & Discount Groups</div>
          <div className="info-rows">
            <div className="info-row">
              <span className="info-row-label">Loyalty Tier</span>
              <span className="info-row-val">
                {patient?.loyaltyTier
                  ? <><span className="pp-chip chip-teal">{patient.loyaltyTier.name}</span>{patient.bonuses?.balance != null && <span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: 13 }}>{patient.bonuses.balance} pts</span>}</>
                  : <span className="info-row-empty">Not enrolled</span>
                }
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Discount Groups</span>
              <span className="info-row-val">
                {groups.length > 0
                  ? groups.map((g: any, i: number) => <span key={i} className="pp-chip chip-yellow" style={{ marginRight: 4 }}>{g.group?.name ?? g.groupId}</span>)
                  : <span className="info-row-empty">None</span>
                }
              </span>
            </div>
            {patient?.balance && (
              <div className="info-row">
                <span className="info-row-label">Deposit Balance</span>
                <span className="info-row-val">{fmtCur(Number(patient.balance.cashBalance ?? 0) + Number(patient.balance.cardBalance ?? 0))}</span>
              </div>
            )}
          </div>
          {promotions.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="pp-sub-title">Active Promotions</div>
              <div className="promo-list">
                {promotions.map((p: any, i: number) => (
                  <div key={i} className="promo-row">
                    <span>{p.promotion?.name ?? '—'}</span>
                    {p.usedAt && <span className="info-row-empty" style={{ fontSize: 12 }}>Used {fmtDate(p.usedAt)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Visit History ── */}
      <div className="pp-card info-visits-section">
        <div className="pp-card-title">Visit History</div>
        <VisitsSection patient={patient} onOpenVisit={onOpenVisit} />
      </div>

    </div>
  );
};



// ─── Treatment Plans Tab ──────────────────────────────────────────────────────

const TreatmentTab: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [plans, setPlans]         = useState<any[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading]     = useState(true);

  const fetchPlans = useCallback(() => {
    setLoading(true);
    api.get('/clinical/treatment-plans', { patientId, limit: '20' }).then((res: any) => {
      setPlans(res?.data?.items ?? res?.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const markDone = async (planId: string, itemId: string) => {
    try {
      await api.patch(`/clinical/treatment-plans/${planId}/items/${itemId}/done`, {});
      fetchPlans();
    } catch {}
  };

  if (loading) return <div className="pp-loading">Loading treatment plans…</div>;
  if (plans.length === 0) return <div className="pp-empty">No treatment plans yet</div>;

  const plan     = plans[activeIdx];
  const items    = plan?.items ?? [];
  const doneCount = items.filter((i: any) => i.isDone).length;
  const pct      = items.length > 0 ? Math.round(doneCount / items.length * 100) : 0;
  const totalCost = items.reduce((s: number, i: any) => s + ((i.price ?? i.service?.basePrice ?? 0) * (i.quantity ?? 1) - (i.discount ?? 0)), 0);

  return (
    <div className="pp-section">
      {plans.length > 1 && (
        <div className="plan-tabs">
          {plans.map((p: any, i: number) => (
            <button key={p.id} className={`plan-tab-btn ${activeIdx === i ? 'active' : ''}`} onClick={() => setActiveIdx(i)}>
              {p.name}
              <span className="pp-chip chip-gray" style={{ marginLeft: 6, fontSize: 10 }}>{p.status}</span>
            </button>
          ))}
        </div>
      )}

      <div className="pp-card">
        <div className="pp-card-header">
          <div>
            <div className="pp-card-title">{plan.name}</div>
            {plan.doctor && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Dr. {plan.doctor?.name}</div>}
          </div>
          <StatusChip status={plan.status} map={{ DRAFT: { label: 'Draft', cls: 'chip-gray' }, ACTIVE: { label: 'Active', cls: 'chip-teal' }, COMPLETED: { label: 'Completed', cls: 'chip-green' }, CANCELLED: { label: 'Cancelled', cls: 'chip-gray' } }} />
        </div>

        {items.length > 0 && (
          <div className="plan-progress">
            <div className="plan-progress-bar">
              <div className="plan-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="plan-progress-label">{doneCount}/{items.length} completed ({pct}%)</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="pp-empty-sm">No items in this plan</div>
        ) : (
          <table className="pp-table">
            <thead>
              <tr><th>Tooth</th><th>Service</th><th>Qty</th><th>Price</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className={item.isDone ? 'row-done' : ''}>
                  <td>{item.toothNumber ? `#${item.toothNumber}` : '—'}</td>
                  <td style={{ fontWeight: 500 }}>{item.service?.name ?? '—'}</td>
                  <td>{item.quantity ?? 1}</td>
                  <td>{item.price ? fmtCur(item.price * (item.quantity ?? 1) - (item.discount ?? 0)) : '—'}</td>
                  <td>{item.isDone ? <span className="pp-chip chip-green">Done</span> : <span className="pp-chip chip-yellow">Planned</span>}</td>
                  <td>{!item.isDone && <button className="pp-action-btn" onClick={() => markDone(plan.id, item.id)}><IconCheck /> Mark done</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalCost > 0 && <div className="plan-total">Total cost: <strong>{fmtCur(totalCost)}</strong></div>}
      </div>
    </div>
  );
};

// ─── Finances Tab ─────────────────────────────────────────────────────────────

const FinancesTab: React.FC<{ patient: any }> = ({ patient }) => {
  const [expandedId, setExpanded] = useState<string | null>(null);
  const [details, setDetails]     = useState<Record<string, any>>({});

  const invoices: any[] = patient?.invoices ?? [];
  const totalPaid   = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.totalAmount), 0);
  const outstanding = invoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED').reduce((s, i) => s + Number(i.totalAmount) - Number(i.paidAmount ?? 0), 0);
  const deposit     = patient?.balance ? Number(patient.balance.cashBalance ?? 0) + Number(patient.balance.cardBalance ?? 0) : 0;
  const bonuses     = patient?.bonuses?.balance ?? 0;

  const toggleExpand = async (id: string) => {
    if (expandedId === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!details[id]) {
      try {
        const res: any = await api.get(`/invoices/${id}`);
        setDetails(prev => ({ ...prev, [id]: res?.data ?? res }));
      } catch { setDetails(prev => ({ ...prev, [id]: null })); }
    }
  };

  return (
    <div className="pp-section">
      <div className="finance-summary">
        <div className="finance-stat"><div className="finance-stat-val">{fmtCur(totalPaid)}</div><div className="finance-stat-lbl">Total Paid</div></div>
        <div className="finance-stat-divider" />
        <div className="finance-stat"><div className="finance-stat-val" style={{ color: outstanding > 0 ? '#c0390a' : undefined }}>{fmtCur(outstanding)}</div><div className="finance-stat-lbl">Outstanding</div></div>
        <div className="finance-stat-divider" />
        <div className="finance-stat"><div className="finance-stat-val">{fmtCur(deposit)}</div><div className="finance-stat-lbl">Deposit</div></div>
        <div className="finance-stat-divider" />
        <div className="finance-stat"><div className="finance-stat-val">{bonuses}</div><div className="finance-stat-lbl">Bonuses</div></div>
      </div>

      {invoices.length === 0 ? (
        <div className="pp-empty">No invoices yet</div>
      ) : (
        <div className="invoices-list">
          {invoices.map((inv: any) => (
            <div key={inv.id} className={`invoice-card ${expandedId === inv.id ? 'expanded' : ''}`}>
              <div className="invoice-card-main" onClick={() => toggleExpand(inv.id)}>
                <div className="invoice-num">{inv.invoiceNumber ?? 'INV'}</div>
                <div className="invoice-date">{fmtDate(inv.createdAt)}</div>
                <div className="invoice-amount">{fmtCur(Number(inv.totalAmount))}</div>
                <div className="invoice-paid">Paid: {fmtCur(Number(inv.paidAmount ?? 0))}</div>
                <StatusChip status={inv.status} map={INVOICE_STATUS} />
                <div className={`visit-chevron ${expandedId === inv.id ? 'open' : ''}`}><IconChevron /></div>
              </div>

              {expandedId === inv.id && (
                <div className="invoice-expand">
                  {details[inv.id] === undefined ? (
                    <div className="pp-loading-sm">Loading…</div>
                  ) : details[inv.id] === null ? (
                    <div className="pp-empty-sm">Failed to load invoice details</div>
                  ) : (
                    <>
                      {details[inv.id].items?.length > 0 && (
                        <table className="pp-table">
                          <thead><tr><th>Service</th><th>Qty</th><th>Price</th><th>Discount</th><th>Subtotal</th></tr></thead>
                          <tbody>
                            {details[inv.id].items.map((item: any, i: number) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 500 }}>{item.service?.name ?? item.description ?? '—'}</td>
                                <td>{item.quantity}</td>
                                <td>{fmtCur(Number(item.price))}</td>
                                <td>{item.discount ? fmtCur(Number(item.discount)) : '—'}</td>
                                <td style={{ fontWeight: 600 }}>{fmtCur(Number(item.price) * item.quantity - Number(item.discount ?? 0))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {details[inv.id].payments?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>PAYMENTS</div>
                          {details[inv.id].payments.map((p: any, i: number) => (
                            <div key={i} className="payment-row">
                              <span>{fmtDate(p.paidAt ?? p.createdAt)}</span>
                              <span className="pp-chip chip-gray">{p.method?.replace(/_/g, ' ')}</span>
                              <span style={{ fontWeight: 600 }}>{fmtCur(Number(p.amount))}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Placeholder ──────────────────────────────────────────────────────────────

const PlaceholderTab: React.FC<{ name: string }> = ({ name }) => (
  <div className="pp-placeholder"><div style={{ fontSize: 40, opacity: 0.3 }}>🚧</div><h3>{name}</h3><p>This section is under development</p></div>
);

// ─── PatientProfile ───────────────────────────────────────────────────────────

interface PatientProfileProps {
  patient: any;
  onBack: () => void;
  onOpenVisit?: (aptId: string) => void;
}

const TABS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'info',       label: 'Patient Info' },
  { id: 'clinical',   label: 'Clinical' },
  { id: 'diary',      label: 'Diary' },
  { id: 'treatment',  label: 'Treatment Plan' },
  { id: 'finances',   label: 'Finances' },
  { id: 'documents',  label: 'Documents' },
];

const PatientProfile: React.FC<PatientProfileProps> = ({ patient: listPatient, onBack, onOpenVisit }) => {
  const [activeTab,   setActiveTab]   = useState('overview');
  const [fullPatient, setFullPatient] = useState<any>(null);
  const [loading,     setLoading]     = useState(true);

  const patientId = listPatient?.id;

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    api.get(`/patients/${patientId}`)
      .then((res: any) => setFullPatient(res?.data ?? res))
      .catch(() => setFullPatient(listPatient))
      .finally(() => setLoading(false));
  }, [patientId]);

  const patient  = fullPatient ?? listPatient;
  const fullName = patient ? `${patient.lastName ?? ''} ${patient.firstName ?? ''}${patient.middleName ? ' ' + patient.middleName : ''}`.trim() : 'Unknown';
  const phone    = patient?.contacts?.find((c: any) => c.type === 'PHONE' && c.isPrimary)?.value
                ?? patient?.contacts?.find((c: any) => c.type === 'PHONE')?.value;
  const email    = patient?.contacts?.find((c: any) => c.type === 'EMAIL')?.value;
  const dob      = patient?.birthDate ? new Date(patient.birthDate) : null;
  const age      = dob ? Math.floor((Date.now() - dob.getTime()) / 3.156e10) : null;
  const appointments = patient?.appointments ?? [];
  const totalSpent   = (patient?.invoices ?? []).filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + Number(i.totalAmount), 0);

  const renderTab = () => {
    if (loading) return <div className="pp-loading"><div className="loading-spinner" /></div>;
    switch (activeTab) {
      case 'overview':  return <OverviewTab patient={patient} patientId={patientId} onTabChange={setActiveTab} />;
      case 'info':      return <InfoTab patient={patient} patientId={patientId} onPatientUpdate={setFullPatient} onOpenVisit={onOpenVisit} />;
      case 'clinical':  return <ClinicalTab patient={patient} patientId={patientId} onPatientUpdate={setFullPatient} />;
      case 'diary':     return <DiaryTab patientId={patientId} />;
      case 'treatment': return <TreatmentTab patientId={patientId} />;
      case 'finances':  return <FinancesTab patient={patient} />;
      default:          return <PlaceholderTab name={TABS.find(t => t.id === activeTab)?.label ?? ''} />;
    }
  };

  return (
    <div className="patient-profile">

      {/* ── Header ── */}
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}><IconBack /> Back to Patients</button>

        <div className="profile-hero">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              <Avatar size={80} name={`${patient?.lastName ?? ''} ${patient?.firstName ?? ''}`.trim() || 'Patient'} variant="beam" colors={['#0D7377','#14919B','#45B7A0','#F2CC8F','#FF6B6B']} />
            </div>
            {patient?.allergies && <div className="avatar-alert" title="Has allergies">!</div>}
          </div>

          <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{fullName}</h1>
              {patient?.patientNumber && <span className="patient-number">#{patient.patientNumber}</span>}
              {patient?.gender && <span className="pp-chip chip-gray">{patient.gender === 'MALE' ? 'Male' : 'Female'}</span>}
            </div>

            <div className="profile-contacts">
              {age !== null && dob && <span className="contact-item"><IconCake /> {age} y.o. · {fmtDate(patient.birthDate)}</span>}
              {phone && <span className="contact-item"><IconPhone /> {phone}</span>}
              {email && <span className="contact-item"><IconMail /> {email}</span>}
            </div>

            {patient?.allergies && (
              <div className="profile-allergy-row">
                <span className="tag tag-allergy"><IconAlert /> {patient.allergies}</span>
              </div>
            )}

            <LabelsBlock compact patientId={patientId} />
          </div>

          <div className="profile-stats">
            <div className="profile-stat"><div className="profile-stat-val">{appointments.length}</div><div className="profile-stat-lbl">Visits</div></div>
            <div className="profile-stat"><div className="profile-stat-val">{fmtCur(totalSpent)}</div><div className="profile-stat-lbl">Total Paid</div></div>
            <div className="profile-stat"><div className="profile-stat-val">{patient?.bonuses?.balance ?? 0}</div><div className="profile-stat-lbl">Bonuses</div></div>
          </div>

          <div className="profile-actions">
            <button className="profile-btn profile-btn-secondary" onClick={() => setActiveTab('info')}><IconEdit /> Edit Info</button>
            <button className="profile-btn profile-btn-primary"><IconPlus /> New Visit</button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="profile-tabs">
        {TABS.map(tab => (
          <button key={tab.id} className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="profile-tab-content">
        {renderTab()}
      </div>
    </div>
  );
};

export default PatientProfile;
