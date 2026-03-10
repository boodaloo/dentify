import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './PatientProfile.css';

const IconBack    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconEdit    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconPlus    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconPhone   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMail    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconCake    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v2"/><path d="M12 8v2"/><path d="M17 8v2"/></svg>;
const IconUser    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconAlert   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const IconCheck   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

// ─── Dental Chart ─────────────────────────────────────────────────────────────

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

  const statusOf = (n: number): LocalToothStatus => toothData[n] ?? 'healthy';
  const handleSelect = (n: number) => setSelected(prev => prev === n ? null : n);

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
        <div className="jaw-row">
          {[...upperRight, ...upperLeft].map(n => (
            <Tooth key={n} number={n} status={statusOf(n)} isSelected={selected === n} onClick={() => handleSelect(n)} />
          ))}
        </div>
        <div className="jaw-divider" />
        <div className="jaw-row">
          {[...lowerRight, ...lowerLeft].map(n => (
            <Tooth key={n} number={n} status={statusOf(n)} isSelected={selected === n} onClick={() => handleSelect(n)} />
          ))}
        </div>
        <div className="chart-jaw-label">Lower Jaw</div>
        <div className="chart-legend">
          {legend.map(l => (
            <div key={l.status} className="legend-item">
              <div className="legend-swatch" style={{ background: l.color, border: l.status === 'missing' ? '2px dashed #E8E8ED' : `2px solid ${l.color}` }} />
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
              <div className="detail-info-row"><span>Status</span><span className={`status-chip ${statusOf(selected)}`}>{toothStatusLabel[statusOf(selected)]}</span></div>
            </div>
          </div>
        ) : (
          <div className="tooth-detail-empty">
            <div className="empty-tooth-icon">🦷</div>
            <p>Click a tooth to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OverviewTab: React.FC<{ patient: any }> = ({ patient }) => {
  const appointments   = (patient?.appointments   ?? []).slice(0, 5);
  const treatmentPlans = patient?.treatmentPlans   ?? [];
  const activePlan     = treatmentPlans.find((p: any) => p.status === 'ACTIVE') ?? treatmentPlans[0];
  const planItems      = activePlan?.items         ?? [];
  const balance        = patient?.balance;
  const invoices       = patient?.invoices         ?? [];
  const totalSpent     = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + Number(i.totalAmount), 0);
  const outstanding    = invoices.filter((i: any) => i.status !== 'PAID' && i.status !== 'CANCELLED').reduce((s: number, i: any) => s + Number(i.totalAmount) - Number(i.paidAmount), 0);

  const upcoming = appointments.find((a: any) => new Date(a.startTime) > new Date());
  const recent   = appointments.filter((a: any) => new Date(a.startTime) <= new Date());

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const fmtCur = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

  return (
    <div className="overview-layout">
      <div className="overview-left">

        {/* Upcoming appointment */}
        <div className="card overview-card">
          <div className="card-header-row">
            <h3>Upcoming Appointment</h3>
          </div>
          {upcoming ? (
            <div className="upcoming-apt-content">
              <div className="upcoming-datetime">{fmt(upcoming.startTime)} · {fmtTime(upcoming.startTime)} – {fmtTime(upcoming.endTime)}</div>
              {upcoming.doctor && <div className="upcoming-meta"><IconUser /> {upcoming.doctor.name}</div>}
              {upcoming.branch && <div className="upcoming-meta">📍 {upcoming.branch.name}</div>}
              <span className={`status-chip ${upcoming.status.toLowerCase()}`}>{upcoming.status}</span>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No upcoming appointments</p>
          )}
        </div>

        {/* Visit history */}
        <div className="card overview-card">
          <div className="card-header-row">
            <h3>Visit History</h3>
            <span style={{ fontSize: '12px', opacity: 0.6 }}>{recent.length} visits</span>
          </div>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No visits yet</p>
          ) : (
            <div className="visit-timeline">
              {recent.map((a: any, i: number) => (
                <div key={a.id || i} className="visit-item">
                  <div className={`visit-dot ${a.status?.toLowerCase() ?? 'completed'}`} />
                  <div className="visit-content">
                    <div className="visit-date">{fmt(a.startTime)}</div>
                    {a.services?.length > 0 && <div className="visit-proc">{a.services.map((s: any) => s.service?.name).join(', ')}</div>}
                    {a.doctor && <div className="visit-meta">{a.doctor.name}</div>}
                    <span className={`status-chip ${a.status?.toLowerCase() ?? ''}`}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overview-right">

        {/* Treatment plan */}
        {activePlan && (
          <div className="card overview-card">
            <h3>Treatment Plan: {activePlan.name}</h3>
            <div className="treatment-list">
              {planItems.slice(0, 6).map((item: any, i: number) => (
                <div key={item.id || i} className="treatment-item">
                  <div className={`treatment-check ${item.isDone ? 'done' : ''}`}>
                    {item.isDone && <IconCheck />}
                  </div>
                  <div className="treatment-content">
                    <div className={`treatment-name ${item.isDone ? 'done' : ''}`}>
                      {item.service?.name ?? 'Service'}
                      {item.toothNumber ? ` (tooth #${item.toothNumber})` : ''}
                    </div>
                    <div className="treatment-date">{item.isDone ? 'Completed' : 'Planned'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical alerts */}
        {patient?.allergies && (
          <div className="card overview-card medical-alerts">
            <div className="alerts-header"><IconAlert /><h3>Medical Alerts</h3></div>
            <ul className="alerts-list">
              <li className="alert-item primary">Allergies: {patient.allergies}</li>
            </ul>
          </div>
        )}

        {/* Stats */}
        <div className="card overview-card">
          <h3>Statistics</h3>
          <div className="stats-grid-2">
            <div className="stat-cell"><div className="stat-value">{appointments.length}</div><div className="stat-label">Total Visits</div></div>
            <div className="stat-cell"><div className="stat-value">{invoices.length}</div><div className="stat-label">Invoices</div></div>
            <div className="stat-cell"><div className="stat-value">{fmtCur(totalSpent)}</div><div className="stat-label">Total Paid</div></div>
            <div className="stat-cell">
              <div className="stat-value" style={{ color: outstanding > 0 ? '#aa5a1a' : undefined }}>{fmtCur(outstanding)}</div>
              <div className="stat-label">Outstanding</div>
            </div>
            {balance && (
              <div className="stat-cell">
                <div className="stat-value">{fmtCur(Number(balance.cashBalance) + Number(balance.cardBalance))}</div>
                <div className="stat-label">Deposit Balance</div>
              </div>
            )}
            {patient?.bonuses && (
              <div className="stat-cell">
                <div className="stat-value">{patient.bonuses.balance}</div>
                <div className="stat-label">Bonus Points</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlaceholderTab: React.FC<{ name: string }> = ({ name }) => (
  <div className="placeholder-tab">
    <div className="placeholder-icon">🚧</div>
    <h3>{name}</h3>
    <p>This section is under development</p>
  </div>
);

// ─── PatientProfile ───────────────────────────────────────────────────────────

interface PatientProfileProps {
  patient: any; // summary from list (has .id)
  onBack: () => void;
}

const TABS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'dental',     label: 'Dental Chart' },
  { id: 'visits',     label: 'Visits' },
  { id: 'treatment',  label: 'Treatment' },
  { id: 'documents',  label: 'Documents' },
  { id: 'anamnesis',  label: 'Anamnesis' },
  { id: 'files',      label: 'Files' },
  { id: 'finances',   label: 'Finances' },
  { id: 'history',    label: 'Change Log' },
];

const PatientProfile: React.FC<PatientProfileProps> = ({ patient: listPatient, onBack }) => {
  const [activeTab,    setActiveTab]    = useState('overview');
  const [fullPatient,  setFullPatient]  = useState<any>(null);
  const [loading,      setLoading]      = useState(true);

  const patientId = listPatient?.id;

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    api.get(`/patients/${patientId}`)
      .then((res: any) => setFullPatient(res?.data ?? res))
      .catch(() => setFullPatient(listPatient))
      .finally(() => setLoading(false));
  }, [patientId]);

  const patient = fullPatient ?? listPatient;

  const fullName = patient ? `${patient.lastName ?? ''} ${patient.firstName ?? ''}${patient.middleName ? ' ' + patient.middleName : ''}`.trim() : 'Unknown Patient';
  const initials = (patient?.firstName?.[0] ?? '') + (patient?.lastName?.[0] ?? '');

  const phone = patient?.phone ?? patient?.contacts?.find((c: any) => c.type === 'PHONE')?.value;
  const email = patient?.email ?? patient?.contacts?.find((c: any) => c.type === 'EMAIL')?.value;

  const dob  = patient?.birthDate ? new Date(patient.birthDate) : null;
  const age  = dob ? Math.floor((Date.now() - dob.getTime()) / 3.156e10) : null;

  const appointments = patient?.appointments ?? [];
  const totalSpent   = (patient?.invoices ?? []).filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + Number(i.totalAmount), 0);
  const fmtCur = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

  const renderTab = () => {
    if (loading) return <div style={{ textAlign: 'center', padding: '64px' }}><div className="loading-spinner" style={{ margin: 'auto' }} /></div>;
    switch (activeTab) {
      case 'overview': return <OverviewTab patient={patient} />;
      case 'dental':   return <DentalChartView patientId={patientId} />;
      default:         return <PlaceholderTab name={TABS.find(t => t.id === activeTab)?.label ?? ''} />;
    }
  };

  return (
    <div className="patient-profile">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}><IconBack /> Back to Patients</button>

        <div className="profile-header-content">
          <div className="profile-info-block">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials.toUpperCase()}</div>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{fullName}</h1>
              <div className="profile-meta-row">
                {age !== null && <span className="meta-item"><IconCake /> {age} years old</span>}
                {patient?.gender && <span className="meta-item"><IconUser /> {patient.gender === 'MALE' ? 'Male' : 'Female'}</span>}
                {patient?.patientNumber && <span className="meta-item">#{patient.patientNumber}</span>}
              </div>
              <div className="profile-meta-row">
                {phone && <span className="meta-item"><IconPhone /> {phone}</span>}
                {email && <span className="meta-item"><IconMail /> {email}</span>}
              </div>
              {patient?.allergies && (
                <div className="profile-tags">
                  <span className="tag allergy">Allergy: {patient.allergies}</span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-actions-block">
            <button className="profile-btn secondary"><IconEdit /> Edit Profile</button>
            <button className="profile-btn primary"><IconPlus /> New Visit</button>
            <div className="profile-mini-stats">
              <div className="mini-stat"><div className="mini-stat-value">{appointments.length}</div><div className="mini-stat-label">Visits</div></div>
              <div className="mini-stat"><div className="mini-stat-value">{fmtCur(totalSpent)}</div><div className="mini-stat-label">Spent</div></div>
              <div className="mini-stat"><div className="mini-stat-value">{patient?.bonuses?.balance ?? 0}</div><div className="mini-stat-label">Bonuses</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-tab-content">
        {renderTab()}
      </div>
    </div>
  );
};

export default PatientProfile;
