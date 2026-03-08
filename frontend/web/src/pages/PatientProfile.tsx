import React, { useState } from 'react';
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

type ToothStatus = 'healthy' | 'filled' | 'cavity' | 'crown' | 'missing' | 'implant' | 'selected';

const toothStatusLabel: Record<ToothStatus, string> = {
  healthy: 'Healthy', filled: 'Filled', cavity: 'Cavity',
  crown: 'Crown', missing: 'Missing', implant: 'Implant', selected: 'Healthy',
};

const mockToothData: Record<number, ToothStatus> = {
  16: 'filled', 24: 'cavity', 36: 'crown', 46: 'missing', 14: 'filled', 25: 'cavity',
};

const Tooth: React.FC<{
  number: number;
  status: ToothStatus;
  isSelected: boolean;
  onClick: () => void;
}> = ({ number, status, isSelected, onClick }) => (
  <div
    className={`tooth ${status} ${isSelected ? 'selected' : ''}`}
    onClick={onClick}
    title={`#${number} — ${toothStatusLabel[status]}`}
  >
    <div className="tooth-crown" />
    <div className="tooth-roots">
      <div className="tooth-root" />
      <div className="tooth-root" />
    </div>
    <span className="tooth-number">{number}</span>
  </div>
);

const DentalChart: React.FC = () => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothData] = useState<Record<number, ToothStatus>>(mockToothData);

  // Upper: 18→11 then 21→28; Lower: 48→41 then 31→38
  const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeft  = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerLeft  = [31, 32, 33, 34, 35, 36, 37, 38];

  const statusOf = (n: number): ToothStatus => toothData[n] ?? 'healthy';

  const handleSelect = (n: number) => setSelectedTooth(prev => prev === n ? null : n);

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
            <Tooth key={n} number={n} status={statusOf(n)} isSelected={selectedTooth === n} onClick={() => handleSelect(n)} />
          ))}
        </div>
        <div className="jaw-divider" />
        <div className="jaw-row">
          {[...lowerRight, ...lowerLeft].map(n => (
            <Tooth key={n} number={n} status={statusOf(n)} isSelected={selectedTooth === n} onClick={() => handleSelect(n)} />
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
        {selectedTooth ? (
          <div className="tooth-detail">
            <h3>Tooth #{selectedTooth}</h3>
            <p className="tooth-status-label">{toothStatusLabel[statusOf(selectedTooth)]}</p>
            <div className="tooth-detail-info">
              <div className="detail-info-row"><span>Status</span><span className={`status-chip ${statusOf(selectedTooth)}`}>{toothStatusLabel[statusOf(selectedTooth)]}</span></div>
              <div className="detail-info-row"><span>Last treated</span><span>Jan 5, 2026</span></div>
              <div className="detail-info-row"><span>Doctor</span><span>Dr. Johnson</span></div>
            </div>
            <div className="tooth-history">
              <h4>History</h4>
              <div className="tooth-hist-item"><span className="hist-date">Jan 5, 2026</span><span>Amalgam filling</span></div>
              <div className="tooth-hist-item"><span className="hist-date">Sep 12, 2025</span><span>Checkup — healthy</span></div>
            </div>
            <button className="tooth-action-btn">
              <IconPlus /> Add Treatment
            </button>
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

const OverviewTab: React.FC<{ patient: any }> = ({ patient: _patient }) => {
  const visitHistory = [
    { date: 'Jan 5, 2026', proc: 'Cleaning & Checkup', doctor: 'Dr. Johnson', duration: '45 min', status: 'completed' },
    { date: 'Dec 10, 2025', proc: 'Filling (Tooth #16)', doctor: 'Dr. Johnson', duration: '60 min', status: 'completed' },
    { date: 'Oct 3, 2025', proc: 'Regular Checkup', doctor: 'Dr. Smith', duration: '30 min', status: 'completed' },
  ];

  const treatmentPlan = [
    { text: 'Root canal treatment (#24)', date: 'Next: Jan 15, 2026', done: false },
    { text: 'Tooth filling (#16)', date: 'Completed: Jan 5, 2026', done: true },
    { text: 'Crown placement (#24)', date: 'Scheduled: Jan 22, 2026', done: false },
  ];

  return (
    <div className="overview-layout">
      {/* Left column */}
      <div className="overview-left">

        {/* Upcoming appointment */}
        <div className="card overview-card">
          <div className="card-header-row">
            <h3>Upcoming Appointment</h3>
            <span className="badge-coral">Tomorrow</span>
          </div>
          <div className="upcoming-apt-content">
            <div className="upcoming-datetime">Monday, Jan 8, 2026 · 09:00 – 10:00</div>
            <div className="upcoming-meta"><IconUser /> Dr. Johnson</div>
            <div className="upcoming-meta">🦷 Regular Checkup</div>
            <div className="upcoming-meta">📍 Room 3</div>
          </div>
          <a href="#" className="link-teal">View Details</a>
        </div>

        {/* Visit history */}
        <div className="card overview-card">
          <div className="card-header-row">
            <h3>Visit History</h3>
            <select className="chart-filter-sm">
              <option>Last 12 months</option>
              <option>All time</option>
            </select>
          </div>
          <div className="visit-timeline">
            {visitHistory.map((v, i) => (
              <div key={i} className="visit-item">
                <div className={`visit-dot ${v.status}`} />
                <div className="visit-content">
                  <div className="visit-date">{v.date}</div>
                  <div className="visit-proc">{v.proc}</div>
                  <div className="visit-meta">{v.doctor} · {v.duration}</div>
                  <span className={`status-chip ${v.status}`}>{v.status}</span>
                </div>
              </div>
            ))}
          </div>
          <a href="#" className="link-teal">View all 24 visits</a>
        </div>
      </div>

      {/* Right column */}
      <div className="overview-right">

        {/* Treatment plan */}
        <div className="card overview-card">
          <h3>Current Treatment Plan</h3>
          <div className="treatment-list">
            {treatmentPlan.map((item, i) => (
              <div key={i} className="treatment-item">
                <div className={`treatment-check ${item.done ? 'done' : ''}`}>
                  {item.done && <IconCheck />}
                </div>
                <div className="treatment-content">
                  <div className={`treatment-name ${item.done ? 'done' : ''}`}>{item.text}</div>
                  <div className="treatment-date">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical alerts */}
        <div className="card overview-card medical-alerts">
          <div className="alerts-header">
            <IconAlert />
            <h3>Medical Alerts</h3>
          </div>
          <ul className="alerts-list">
            <li className="alert-item primary">Allergy to lidocaine</li>
            <li className="alert-item">Type 2 Diabetes</li>
          </ul>
          <a href="#" className="link-teal" style={{ fontSize: 12 }}>View full medical history</a>
        </div>

        {/* Quick stats */}
        <div className="card overview-card">
          <h3>Statistics</h3>
          <div className="stats-grid-2">
            <div className="stat-cell"><div className="stat-value">24</div><div className="stat-label">Total Visits</div></div>
            <div className="stat-cell"><div className="stat-value">8</div><div className="stat-label">This Year</div></div>
            <div className="stat-cell"><div className="stat-value">156k₽</div><div className="stat-label">Total Spent</div></div>
            <div className="stat-cell"><div className="stat-value">12k₽</div><div className="stat-label">Outstanding</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Placeholder tab ──────────────────────────────────────────────────────────

const PlaceholderTab: React.FC<{ name: string }> = ({ name }) => (
  <div className="placeholder-tab">
    <div className="placeholder-icon">🚧</div>
    <h3>{name}</h3>
    <p>This section is under development</p>
  </div>
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
  { id: 'treatment',  label: 'Treatment' },
  { id: 'documents',  label: 'Documents' },
  { id: 'anamnesis',  label: 'Anamnesis' },
  { id: 'files',      label: 'Files' },
  { id: 'finances',   label: 'Finances' },
  { id: 'history',    label: 'Change Log' },
];

const PatientProfile: React.FC<PatientProfileProps> = ({ patient, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const fullName = patient
    ? `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim()
    : 'Unknown Patient';
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const dob = patient?.dob ? new Date(patient.dob) : null;
  const age = dob ? Math.floor((Date.now() - dob.getTime()) / 3.156e10) : null;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab patient={patient} />;
      case 'dental':   return <DentalChart />;
      default:         return <PlaceholderTab name={TABS.find(t => t.id === activeTab)?.label ?? ''} />;
    }
  };

  return (
    <div className="patient-profile">

      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}><IconBack /> Back to Patients</button>

        <div className="profile-header-content">
          {/* Left: avatar + info */}
          <div className="profile-info-block">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials}</div>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{fullName}</h1>
              <div className="profile-meta-row">
                {age && <span className="meta-item"><IconCake /> {age} years old</span>}
                {patient?.gender && <span className="meta-item"><IconUser /> {patient.gender}</span>}
                <span className="meta-item">🩸 A+ (II)</span>
              </div>
              <div className="profile-meta-row">
                {patient?.phone && <span className="meta-item"><IconPhone /> {patient.phone}</span>}
                {patient?.email && <span className="meta-item"><IconMail /> {patient.email}</span>}
              </div>
              <div className="profile-tags">
                <span className="tag vip">VIP</span>
                <span className="tag allergy">Allergy</span>
                <span className="tag regular">Regular</span>
              </div>
            </div>
          </div>

          {/* Right: actions + mini stats */}
          <div className="profile-actions-block">
            <button className="profile-btn secondary"><IconEdit /> Edit Profile</button>
            <button className="profile-btn primary"><IconPlus /> New Visit</button>
            <div className="profile-mini-stats">
              <div className="mini-stat"><div className="mini-stat-value">24</div><div className="mini-stat-label">Visits</div></div>
              <div className="mini-stat"><div className="mini-stat-value">156k₽</div><div className="mini-stat-label">Spent</div></div>
              <div className="mini-stat"><div className="mini-stat-value">4.8⭐</div><div className="mini-stat-label">Rating</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Tab content */}
      <div className="profile-tab-content">
        {renderTab()}
      </div>
    </div>
  );
};

export default PatientProfile;
