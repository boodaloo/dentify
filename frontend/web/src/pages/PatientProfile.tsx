import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import './PatientProfile.css';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconBack    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconEdit    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconPlus    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconPhone   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMail    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconCake    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v2"/><path d="M12 8v2"/><path d="M17 8v2"/></svg>;
const IconAlert   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const IconCheck   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconChevron = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const IconSave    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate    = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime= (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtTime    = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const fmtCur     = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

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

// ─── Dental Chart (unchanged) ─────────────────────────────────────────────────

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

const DentalChartView: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [toothData, setToothData] = useState<Record<number, LocalToothStatus>>({});
  const [selected, setSelected]   = useState<number | null>(null);

  useEffect(() => {
    api.get(`/clinical/patients/${patientId}/dental-chart`).then((res: any) => {
      const data: any[] = res?.data ?? (Array.isArray(res) ? res : []);
      const map: Record<number, LocalToothStatus> = {};
      data.forEach(t => { map[t.toothNumber] = apiToLocal[t.status] ?? 'healthy'; });
      setToothData(map);
    }).catch(() => {});
  }, [patientId]);

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

  return (
    <div className="dental-chart-layout">
      <div className="dental-chart-main card">
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
      <div className="dental-detail-panel card">
        {selected ? (
          <div className="tooth-detail">
            <h3>Tooth #{selected}</h3>
            <p className="tooth-status-label">{toothStatusLabel[statusOf(selected)]}</p>
            <div className="tooth-detail-info">
              <div className="detail-info-row"><span>Status</span><span className={`pp-chip chip-teal`}>{toothStatusLabel[statusOf(selected)]}</span></div>
            </div>
          </div>
        ) : (
          <div className="tooth-detail-empty"><div style={{ fontSize: 40, opacity: 0.35 }}>🦷</div><p>Click a tooth to view details</p></div>
        )}
      </div>
    </div>
  );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OverviewTab: React.FC<{ patient: any; onTabChange: (tab: string) => void }> = ({ patient, onTabChange }) => {
  const appointments   = patient?.appointments ?? [];
  const treatmentPlans = patient?.treatmentPlans ?? [];
  const activePlan     = treatmentPlans.find((p: any) => p.status === 'ACTIVE') ?? treatmentPlans[0];
  const invoices       = patient?.invoices ?? [];
  const totalSpent     = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + Number(i.totalAmount), 0);
  const outstanding    = invoices.filter((i: any) => i.status !== 'PAID' && i.status !== 'CANCELLED').reduce((s: number, i: any) => s + Number(i.totalAmount) - Number(i.paidAmount ?? 0), 0);

  const upcoming = [...appointments].reverse().find((a: any) => new Date(a.startTime) > new Date());
  const recent   = appointments.filter((a: any) => new Date(a.startTime) <= new Date()).slice(0, 5);

  return (
    <div className="overview-layout">
      <div className="overview-col">

        {/* Upcoming */}
        <div className="pp-card">
          <div className="pp-card-title">Upcoming Appointment</div>
          {upcoming ? (
            <div className="upcoming-block">
              <div className="upcoming-date">{fmtDate(upcoming.startTime)} · {fmtTime(upcoming.startTime)} – {fmtTime(upcoming.endTime)}</div>
              {upcoming.branch && <div className="upcoming-meta">📍 {upcoming.branch.name}</div>}
              {upcoming.notes && <div className="upcoming-meta" style={{ fontStyle: 'italic' }}>"{upcoming.notes}"</div>}
              <StatusChip status={upcoming.status} map={STATUS_LABELS} />
            </div>
          ) : (
            <div className="pp-empty-sm">No upcoming appointments
              <button className="pp-link" onClick={() => onTabChange('visits')}>View all visits →</button>
            </div>
          )}
        </div>

        {/* Visit history */}
        <div className="pp-card">
          <div className="pp-card-header">
            <div className="pp-card-title">Recent Visits</div>
            <button className="pp-link" onClick={() => onTabChange('visits')}>{appointments.length} total →</button>
          </div>
          {recent.length === 0 ? (
            <div className="pp-empty-sm">No visits yet</div>
          ) : (
            <div className="visit-timeline">
              {recent.map((a: any, i: number) => (
                <div key={a.id || i} className="visit-item">
                  <div className={`visit-dot ${a.status?.toLowerCase() ?? 'completed'}`} />
                  <div className="visit-content">
                    <div className="visit-date">{fmtDate(a.startTime)}</div>
                    {a.services?.length > 0 && <div className="visit-proc">{a.services.map((s: any) => s.service?.name).filter(Boolean).join(', ')}</div>}
                    {a.branch && <div className="visit-meta">📍 {a.branch.name}</div>}
                    <StatusChip status={a.status} map={STATUS_LABELS} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overview-col">

        {/* Medical alerts */}
        {(patient?.allergies || patient?.notes) && (
          <div className="pp-card pp-card-alert">
            <div className="pp-card-header">
              <div className="pp-card-title" style={{ color: '#8a4800' }}><IconAlert /> Medical Alerts</div>
              <button className="pp-link" onClick={() => onTabChange('anamnesis')}>Edit →</button>
            </div>
            {patient.allergies && <div className="alert-item"><strong>Allergies:</strong> {patient.allergies}</div>}
            {patient.notes && <div className="alert-item" style={{ marginTop: 6 }}><strong>Notes:</strong> {patient.notes}</div>}
          </div>
        )}

        {/* Active treatment plan */}
        {activePlan && (
          <div className="pp-card">
            <div className="pp-card-header">
              <div className="pp-card-title">Treatment Plan</div>
              <button className="pp-link" onClick={() => onTabChange('treatment')}>Details →</button>
            </div>
            <div className="plan-name">{activePlan.name}</div>
            <StatusChip status={activePlan.status} map={{ DRAFT: { label: 'Draft', cls: 'chip-gray' }, ACTIVE: { label: 'Active', cls: 'chip-teal' }, COMPLETED: { label: 'Completed', cls: 'chip-green' }, CANCELLED: { label: 'Cancelled', cls: 'chip-gray' } }} />
          </div>
        )}

        {/* Stats */}
        <div className="pp-card">
          <div className="pp-card-title">Summary</div>
          <div className="stats-grid">
            <div className="stat-cell"><div className="stat-value">{appointments.length}</div><div className="stat-lbl">Visits</div></div>
            <div className="stat-cell"><div className="stat-value">{invoices.length}</div><div className="stat-lbl">Invoices</div></div>
            <div className="stat-cell"><div className="stat-value">{fmtCur(totalSpent)}</div><div className="stat-lbl">Total Paid</div></div>
            <div className="stat-cell">
              <div className="stat-value" style={{ color: outstanding > 0 ? '#c0390a' : undefined }}>{fmtCur(outstanding)}</div>
              <div className="stat-lbl">Outstanding</div>
            </div>
            {patient?.balance && (
              <div className="stat-cell">
                <div className="stat-value">{fmtCur(Number(patient.balance.cashBalance ?? 0) + Number(patient.balance.cardBalance ?? 0))}</div>
                <div className="stat-lbl">Deposit</div>
              </div>
            )}
            {patient?.bonuses && (
              <div className="stat-cell"><div className="stat-value">{patient.bonuses.balance ?? 0}</div><div className="stat-lbl">Bonuses</div></div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Visits Tab ───────────────────────────────────────────────────────────────

const VisitsTab: React.FC<{ patient: any }> = ({ patient }) => {
  const [filter, setFilter]       = useState<string>('ALL');
  const [expandedId, setExpanded] = useState<string | null>(null);
  const [records, setRecords]     = useState<Record<string, any>>({});

  const appointments: any[] = patient?.appointments ?? [];

  const filtered = filter === 'ALL'
    ? appointments
    : appointments.filter((a: any) => a.status === filter);

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
    <div className="pp-section">
      <div className="pp-section-header">
        <div className="pp-filter-row">
          {filters.map(f => (
            <button key={f} className={`pp-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'ALL' ? `All (${appointments.length})` : (STATUS_LABELS[f]?.label ?? f)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="pp-empty">No visits found</div>
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
                  {a.branch && <div className="visit-card-meta">📍 {a.branch.name}</div>}
                  {a.notes && <div className="visit-card-meta" style={{ fontStyle: 'italic' }}>"{a.notes}"</div>}
                </div>
                <div className="visit-card-right">
                  <StatusChip status={a.status} map={STATUS_LABELS} />
                  <div className={`visit-chevron ${expandedId === a.id ? 'open' : ''}`}><IconChevron /></div>
                </div>
              </div>

              {expandedId === a.id && (
                <div className="visit-record-expand">
                  {records[a.id] === undefined ? (
                    <div className="pp-loading-sm">Loading medical record…</div>
                  ) : records[a.id] === null ? (
                    <div className="pp-empty-sm">No medical record for this visit</div>
                  ) : (
                    <div className="medical-record-view">
                      {records[a.id].complaints && <div className="mr-field"><span className="mr-label">Complaints</span><span>{records[a.id].complaints}</span></div>}
                      {records[a.id].anamnesis  && <div className="mr-field"><span className="mr-label">Anamnesis</span><span>{records[a.id].anamnesis}</span></div>}
                      {records[a.id].diagnoses?.length > 0 && (
                        <div className="mr-field">
                          <span className="mr-label">Diagnoses</span>
                          <div className="mr-diagnoses">
                            {records[a.id].diagnoses.map((d: any, i: number) => (
                              <span key={i} className="pp-chip chip-teal">{d.diagnosis?.code} — {d.diagnosis?.name}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {records[a.id].treatmentPlan && <div className="mr-field"><span className="mr-label">Treatment done</span><span>{records[a.id].treatmentPlan}</span></div>}
                      {records[a.id].notes && <div className="mr-field"><span className="mr-label">Doctor's notes</span><span>{records[a.id].notes}</span></div>}
                      {records[a.id].createdBy && <div className="mr-field"><span className="mr-label">Recorded by</span><span>{records[a.id].createdBy.name}</span></div>}
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

// ─── Anamnesis Tab ────────────────────────────────────────────────────────────

const AnamnesisTab: React.FC<{ patient: any; patientId: string; onPatientUpdate: (p: any) => void }> = ({ patient, patientId, onPatientUpdate }) => {
  const [allergies, setAllergies] = useState(patient?.allergies ?? '');
  const [notes, setNotes]         = useState(patient?.notes ?? '');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [records, setRecords]     = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(true);

  useEffect(() => {
    api.get('/clinical/medical-records', { patientId, limit: '50' }).then((res: any) => {
      setRecords(res?.data?.items ?? res?.data ?? []);
    }).catch(() => {}).finally(() => setRecLoading(false));
  }, [patientId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/patients/${patientId}`, { allergies, notes });
      onPatientUpdate({ ...patient, allergies, notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { } finally { setSaving(false); }
  };

  return (
    <div className="pp-section">
      <div className="anamnesis-grid">

        {/* Permanent health profile */}
        <div className="pp-card">
          <div className="pp-card-title">Health Profile</div>

          <div className="pp-field">
            <label className="pp-label">Allergies & Contraindications</label>
            <textarea
              className="pp-textarea"
              rows={3}
              value={allergies}
              onChange={e => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin allergy, latex allergy…"
            />
          </div>

          <div className="pp-field">
            <label className="pp-label">Clinical Notes</label>
            <textarea
              className="pp-textarea"
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Chronic conditions, medications, relevant history…"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <button className="pp-btn-primary" onClick={handleSave} disabled={saving}>
              <IconSave /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
            {saved && <span style={{ fontSize: 13, color: 'var(--secondary-seafoam)' }}>✓ Saved</span>}
          </div>
        </div>

        {/* Patient identifiers */}
        <div className="pp-card">
          <div className="pp-card-title">Patient Information</div>
          <div className="info-rows">
            {patient?.referralSource && <div className="info-row"><span>Referral Source</span><span>{patient.referralSource.replace(/_/g, ' ')}</span></div>}
            {patient?.snils     && <div className="info-row"><span>SNILS</span><span>{patient.snils}</span></div>}
            {patient?.inn       && <div className="info-row"><span>INN</span><span>{patient.inn}</span></div>}
            {patient?.passportSeries && <div className="info-row"><span>Passport</span><span>{patient.passportSeries} {patient.passportNumber}</span></div>}
            {patient?.loyaltyTier && <div className="info-row"><span>Loyalty Tier</span><span>{patient.loyaltyTier.name}</span></div>}
            {!patient?.referralSource && !patient?.snils && !patient?.inn && (
              <div className="pp-empty-sm">No additional information</div>
            )}
          </div>
        </div>

      </div>

      {/* Medical records timeline */}
      <div className="pp-card" style={{ marginTop: 16 }}>
        <div className="pp-card-header">
          <div className="pp-card-title">Visit Medical Records</div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{records.length} records</span>
        </div>

        {recLoading ? (
          <div className="pp-loading-sm">Loading…</div>
        ) : records.length === 0 ? (
          <div className="pp-empty-sm">No medical records yet</div>
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
                  {r.complaints   && <div className="mr-field"><span className="mr-label">Complaints</span><span>{r.complaints}</span></div>}
                  {r.diagnoses?.length > 0 && (
                    <div className="mr-field">
                      <span className="mr-label">Diagnoses</span>
                      <div className="mr-diagnoses">{r.diagnoses.map((d: any, j: number) => <span key={j} className="pp-chip chip-teal">{d.diagnosis?.code} {d.diagnosis?.name}</span>)}</div>
                    </div>
                  )}
                  {r.notes        && <div className="mr-field"><span className="mr-label">Notes</span><span>{r.notes}</span></div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Treatment Plans Tab ──────────────────────────────────────────────────────

const TreatmentTab: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [plans, setPlans]     = useState<any[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(() => {
    setLoading(true);
    api.get('/clinical/treatment-plans', { patientId, limit: '20' }).then((res: any) => {
      const items = res?.data?.items ?? res?.data ?? [];
      setPlans(items);
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

  const plan = plans[activeIdx];
  const items = plan?.items ?? [];
  const doneCount = items.filter((i: any) => i.isDone).length;
  const pct = items.length > 0 ? Math.round(doneCount / items.length * 100) : 0;
  const totalCost = items.reduce((s: number, i: any) => s + ((i.price ?? i.service?.basePrice ?? 0) * (i.quantity ?? 1) - (i.discount ?? 0)), 0);

  return (
    <div className="pp-section">
      {/* Plan selector */}
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

        {/* Progress bar */}
        {items.length > 0 && (
          <div className="plan-progress">
            <div className="plan-progress-bar">
              <div className="plan-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="plan-progress-label">{doneCount}/{items.length} completed ({pct}%)</span>
          </div>
        )}

        {/* Items table */}
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
                  <td>
                    {!item.isDone && (
                      <button className="pp-action-btn" onClick={() => markDone(plan.id, item.id)}>
                        <IconCheck /> Mark done
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalCost > 0 && (
          <div className="plan-total">Total cost: <strong>{fmtCur(totalCost)}</strong></div>
        )}
      </div>
    </div>
  );
};

// ─── Finances Tab ─────────────────────────────────────────────────────────────

const FinancesTab: React.FC<{ patient: any }> = ({ patient }) => {
  const [expandedId, setExpanded] = useState<string | null>(null);
  const [details, setDetails]     = useState<Record<string, any>>({});

  const invoices: any[] = patient?.invoices ?? [];
  const totalPaid    = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.totalAmount), 0);
  const outstanding  = invoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED').reduce((s, i) => s + Number(i.totalAmount) - Number(i.paidAmount ?? 0), 0);
  const deposit      = patient?.balance ? Number(patient.balance.cashBalance ?? 0) + Number(patient.balance.cardBalance ?? 0) : 0;
  const bonuses      = patient?.bonuses?.balance ?? 0;

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
      {/* Summary bar */}
      <div className="finance-summary">
        <div className="finance-stat"><div className="finance-stat-val">{fmtCur(totalPaid)}</div><div className="finance-stat-lbl">Total Paid</div></div>
        <div className="finance-stat-divider" />
        <div className="finance-stat"><div className="finance-stat-val" style={{ color: outstanding > 0 ? '#c0390a' : undefined }}>{fmtCur(outstanding)}</div><div className="finance-stat-lbl">Outstanding</div></div>
        <div className="finance-stat-divider" />
        <div className="finance-stat"><div className="finance-stat-val">{fmtCur(deposit)}</div><div className="finance-stat-lbl">Deposit Balance</div></div>
        <div className="finance-stat-divider" />
        <div className="finance-stat"><div className="finance-stat-val">{bonuses}</div><div className="finance-stat-lbl">Bonus Points</div></div>
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
}

const TABS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'dental',     label: 'Dental Chart' },
  { id: 'visits',     label: 'Visits' },
  { id: 'treatment',  label: 'Treatment Plan' },
  { id: 'anamnesis',  label: 'Anamnesis' },
  { id: 'finances',   label: 'Finances' },
  { id: 'documents',  label: 'Documents' },
  { id: 'files',      label: 'Files' },
];

const PatientProfile: React.FC<PatientProfileProps> = ({ patient: listPatient, onBack }) => {
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
  const initials = ((patient?.firstName?.[0] ?? '') + (patient?.lastName?.[0] ?? '')).toUpperCase();
  const phone    = patient?.phone ?? patient?.contacts?.find((c: any) => c.type === 'PHONE')?.value;
  const email    = patient?.email ?? patient?.contacts?.find((c: any) => c.type === 'EMAIL')?.value;
  const dob      = patient?.birthDate ? new Date(patient.birthDate) : null;
  const age      = dob ? Math.floor((Date.now() - dob.getTime()) / 3.156e10) : null;
  const appointments  = patient?.appointments ?? [];
  const totalSpent    = (patient?.invoices ?? []).filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + Number(i.totalAmount), 0);

  const renderTab = () => {
    if (loading) return <div className="pp-loading"><div className="loading-spinner" /></div>;
    switch (activeTab) {
      case 'overview':  return <OverviewTab patient={patient} onTabChange={setActiveTab} />;
      case 'dental':    return <DentalChartView patientId={patientId} />;
      case 'visits':    return <VisitsTab patient={patient} />;
      case 'treatment': return <TreatmentTab patientId={patientId} />;
      case 'anamnesis': return <AnamnesisTab patient={patient} patientId={patientId} onPatientUpdate={setFullPatient} />;
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
            <div className="profile-avatar">{initials}</div>
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
              <div className="profile-tags">
                <span className="tag tag-allergy"><IconAlert /> {patient.allergies}</span>
              </div>
            )}
          </div>

          <div className="profile-stats">
            <div className="profile-stat"><div className="profile-stat-val">{appointments.length}</div><div className="profile-stat-lbl">Visits</div></div>
            <div className="profile-stat"><div className="profile-stat-val">{fmtCur(totalSpent)}</div><div className="profile-stat-lbl">Total Paid</div></div>
            <div className="profile-stat"><div className="profile-stat-val">{patient?.bonuses?.balance ?? 0}</div><div className="profile-stat-lbl">Bonuses</div></div>
          </div>

          <div className="profile-actions">
            <button className="profile-btn profile-btn-secondary"><IconEdit /> Edit</button>
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
