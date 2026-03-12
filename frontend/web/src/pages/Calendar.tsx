import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import Avatar from 'boring-avatars';
import { api } from '../services/api';
import Modal from '../components/Modal';
import AppointmentForm from '../components/AppointmentForm';
import './Calendar.css';

const APT_COLORS = [
  '#14919B', '#45B7A0', '#0D7377', '#F2CC8F',
  '#FF6B6B', '#A78BFA', '#60A5FA', '#34D399',
  '#F97316', '#EC4899',
];

const APT_STATUSES = [
  { value: 'SCHEDULED',   label: 'Scheduled',    icon: '📋' },
  { value: 'CONFIRMED',   label: 'Confirmed',    icon: '✅' },
  { value: 'IN_PROGRESS', label: 'In chair',     icon: '🦷' },
  { value: 'COMPLETED',   label: 'Completed',    icon: '🏁' },
  { value: 'NO_SHOW',     label: 'No show',      icon: '👻' },
  { value: 'CANCELLED',   label: 'Cancelled',    icon: '🚫' },
];

// ─── Status Colors (configurable) ────────────────────────────────────────────

const DEFAULT_STATUS_COLORS: Record<string, string> = {
  CONFIRMED:   '#45B7A0',
  SCHEDULED:   '#F2CC8F',
  IN_PROGRESS: '#FF6B6B',
  COMPLETED:   '#0D7377',
  CANCELLED:   '#5A5A72',
  NO_SHOW:     '#FF6B6B',
};
const DOCTOR_PALETTE = [
  '#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981',
  '#3B82F6','#EF4444','#14B8A6','#F97316','#84CC16',
  '#06B6D4','#A855F7','#F43F5E','#22C55E','#EAB308',
];
const getDoctorColor = (doctorId: string | undefined, doctors: any[]): string => {
  if (!doctorId) return '#94A3B8';
  const idx = doctors.findIndex((d: any) => d.id === doctorId);
  return idx >= 0 ? DOCTOR_PALETTE[idx % DOCTOR_PALETTE.length] : '#94A3B8';
};
const COLOR_MODE_KEY = 'calendarColorMode';

const STATUS_COLORS_KEY = 'calendarStatusColors';
const loadStatusColors = (): Record<string, string> => {
  try {
    const s = localStorage.getItem(STATUS_COLORS_KEY);
    return s ? { ...DEFAULT_STATUS_COLORS, ...JSON.parse(s) } : { ...DEFAULT_STATUS_COLORS };
  } catch { return { ...DEFAULT_STATUS_COLORS }; }
};

// ─── Context Menu ──────────────────────────────────────────────────────────────

type CtxMenu =
  | { type: 'apt';  x: number; y: number; apt: any }
  | { type: 'slot'; x: number; y: number; date: Date; hour: number; minute: number };

const ContextMenu: React.FC<{
  menu: CtxMenu;
  onClose: () => void;
  onStatusChange: (aptId: string, status: string) => void;
  onEdit: (apt: any) => void;
  onDelete: (apt: any) => void;
  onCopy: (apt: any) => void;
  onNewApt: (date: Date, hour: number, minute: number) => void;
  onOpenPatient?: (patientId: string) => void;
}> = ({ menu, onClose, onStatusChange, onEdit, onDelete, onCopy, onNewApt, onOpenPatient }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) { if (e.key === 'Escape') onClose(); return; }
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [onClose]);

  // Adjust position so menu doesn't overflow viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(menu.y, window.innerHeight - 420),
    left: Math.min(menu.x, window.innerWidth - 220),
    zIndex: 1000,
  };

  if (menu.type === 'slot') {
    const pad = (n: number) => String(n).padStart(2, '0');
    const endTotalMin = menu.hour * 60 + menu.minute + parseInt(localStorage.getItem('calendarSlotMin') || '15', 10);
    const endH = Math.floor(endTotalMin / 60);
    const endM = endTotalMin % 60;
    const timeLabel = `${pad(menu.hour)}:${pad(menu.minute)} – ${pad(endH)}:${pad(endM)}`;
    const dateLabel = menu.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    return (
      <div ref={ref} className="ctx-menu" style={style}>
        <div className="ctx-menu-header">{dateLabel}, {timeLabel}</div>
        <button className="ctx-item" onClick={() => { onNewApt(menu.date, menu.hour, menu.minute); onClose(); }}>
          <span className="ctx-icon">➕</span> New appointment
        </button>
      </div>
    );
  }

  const apt = menu.apt;
  const patientName = `${apt.patient?.lastName ?? ''} ${apt.patient?.firstName ?? ''}`.trim() || 'Patient';
  const phone = apt.patient?.phone ?? apt.patient?.contacts?.find((c: any) => c.type === 'PHONE')?.value;
  const time = new Date(apt.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div ref={ref} className="ctx-menu" style={style}>
      <div className="ctx-menu-header">
        <span className="ctx-patient">{patientName}</span>
        <span className="ctx-time">{time}</span>
      </div>

      {/* Patient actions */}
      {onOpenPatient && apt.patient?.id && (
        <button className="ctx-item" onClick={() => { onOpenPatient(apt.patient.id); onClose(); }}>
          <span className="ctx-icon">👤</span> Open patient card
        </button>
      )}
      {phone && (
        <a className="ctx-item" href={`tel:${phone}`} onClick={onClose}>
          <span className="ctx-icon">📞</span> Call {phone}
        </a>
      )}
      {phone && (
        <a className="ctx-item" href={`sms:${phone}`} onClick={onClose}>
          <span className="ctx-icon">💬</span> Send message
        </a>
      )}

      <div className="ctx-divider" />
      <div className="ctx-section-label">Status</div>
      {APT_STATUSES.map(s => (
        <button
          key={s.value}
          className={`ctx-item ctx-status ${apt.status === s.value ? 'active' : ''}`}
          onClick={() => { onStatusChange(apt.id, s.value); onClose(); }}
        >
          <span className="ctx-icon">{s.icon}</span>
          <span>{s.label}</span>
          {apt.status === s.value && <span className="ctx-check">✓</span>}
        </button>
      ))}

      <div className="ctx-divider" />
      <button className="ctx-item" onClick={() => { onEdit(apt); onClose(); }}>
        <span className="ctx-icon">✏️</span> Edit
      </button>
      <button className="ctx-item" onClick={() => { onCopy(apt); onClose(); }}>
        <span className="ctx-icon">📋</span> Copy appointment
      </button>
      <button className="ctx-item ctx-danger" onClick={() => { onDelete(apt); onClose(); }}>
        <span className="ctx-icon">🗑️</span> Delete
      </button>
    </div>
  );
};

const IconPlus        = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconChevLeft    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconChevRight   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const IconFilter      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IconCalEmpty    = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const IconPhone       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMail        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconRefresh     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
const IconX           = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const IconSearch      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconPrint       = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>;
const IconEyeOff      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" x2="23" y1="1" y2="23"/></svg>;
const IconEye         = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconMapPin      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconChevDown    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const IconPalette     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;

// ─── Status Legend ────────────────────────────────────────────────────────────

const StatusLegend: React.FC<{
  colors: Record<string, string>;
  onChange: (status: string, color: string) => void;
  onReset: () => void;
  onClose: () => void;
}> = ({ colors, onChange, onReset, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} className="status-legend">
      <div className="status-legend-header">
        <span>Status Colors</span>
        <div className="status-legend-actions">
          <button className="status-legend-reset" onClick={onReset} title="Reset all to defaults">Reset</button>
          <button className="status-legend-close" onClick={onClose}>✕</button>
        </div>
      </div>
      {APT_STATUSES.map(s => (
        <label key={s.value} className="status-legend-row">
          <span className="status-legend-icon">{s.icon}</span>
          <span className="status-legend-label">{s.label}</span>
          <div className="status-legend-color-wrap">
            <div className="status-legend-swatch" style={{ background: colors[s.value] ?? '#888' }} />
            <input
              type="color"
              className="status-legend-color-input"
              value={colors[s.value] ?? '#888888'}
              onChange={e => onChange(s.value, e.target.value)}
            />
          </div>
        </label>
      ))}
    </div>
  );
};

const DEFAULT_HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08–20 fallback
const SLOT_H = 60; // px per hour

// ─── Overlap layout ────────────────────────────────────────────────────────
// Returns each appointment enriched with colIndex + totalCols for side-by-side rendering
const layoutDayAppointments = (apts: any[]): { apt: any; colIndex: number; totalCols: number }[] => {
  if (!apts.length) return [];
  const sorted = [...apts].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const columns: any[][] = [];
  const aptCol = new Map<string, number>();

  for (const apt of sorted) {
    const s = new Date(apt.startTime).getTime();
    let placed = false;
    for (let ci = 0; ci < columns.length; ci++) {
      const last = columns[ci][columns[ci].length - 1];
      if (new Date(last.endTime).getTime() <= s) {
        columns[ci].push(apt);
        aptCol.set(apt.id, ci);
        placed = true;
        break;
      }
    }
    if (!placed) {
      aptCol.set(apt.id, columns.length);
      columns.push([apt]);
    }
  }

  return sorted.map(apt => {
    const s = new Date(apt.startTime).getTime();
    const e = new Date(apt.endTime).getTime();
    const ci = aptCol.get(apt.id) ?? 0;
    const concurrent = columns.filter(col =>
      col.some(a => new Date(a.startTime).getTime() < e && new Date(a.endTime).getTime() > s)
    ).length;
    return { apt, colIndex: ci, totalCols: concurrent };
  });
};

// ─── Skeleton patterns (7 variations, rotated per day column) ──────────────
const SKEL = [
  [{ h: 9, m: 0, dur: 60 }, { h: 11, m: 30, dur: 45 }, { h: 15, m: 0, dur: 30 }],
  [{ h: 10, m: 0, dur: 45 }, { h: 13, m: 0, dur: 60 }, { h: 16, m: 30, dur: 45 }],
  [{ h: 9, m: 30, dur: 30 }, { h: 12, m: 0, dur: 60 }, { h: 14, m: 30, dur: 45 }],
  [{ h: 10, m: 30, dur: 60 }, { h: 14, m: 0, dur: 30 }, { h: 17, m: 0, dur: 45 }],
  [{ h: 9, m: 0, dur: 45 }, { h: 11, m: 0, dur: 30 }, { h: 16, m: 0, dur: 60 }],
  [{ h: 10, m: 0, dur: 60 }, { h: 13, m: 30, dur: 45 }, { h: 15, m: 30, dur: 30 }],
  [{ h: 9, m: 30, dur: 45 }, { h: 12, m: 30, dur: 60 }, { h: 16, m: 30, dur: 30 }],
];

// ─── Appointment Tooltip ───────────────────────────────────────────────────
const AptTooltip: React.FC<{ apt: any; x: number; y: number; locale: string }> = ({ apt, x, y, locale }) => {
  const patientName = `${apt.patient?.lastName ?? ''} ${apt.patient?.firstName ?? ''}`.trim() || 'Patient';
  const start = new Date(apt.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const end   = new Date(apt.endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const phone  = apt.patient?.phone;
  const status = APT_STATUSES.find(s => s.value === apt.status);

  const clampedX = Math.min(x, window.innerWidth - 230);
  const clampedY = Math.max(8, Math.min(y, window.innerHeight - 130));

  return ReactDOM.createPortal(
    <div className="apt-tooltip" style={{ left: clampedX, top: clampedY }}>
      <div className="apt-tooltip-name">{patientName}</div>
      <div className="apt-tooltip-time">{start} – {end}</div>
      {phone && <div className="apt-tooltip-row">📞 {phone}</div>}
      {status && <div className="apt-tooltip-status">{status.icon} {status.label}</div>}
    </div>,
    document.body
  );
};

const getGridMin = () => parseInt(localStorage.getItem('calendarGridMin') || '60', 10);

const hoursFromWorkingSchedule = (workingHours: any[]): number[] => {
  if (!workingHours?.length) return DEFAULT_HOURS;
  const open = workingHours.filter((h: any) => h.isOpen);
  if (!open.length) return DEFAULT_HOURS;
  const minH = Math.min(...open.map((h: any) => parseInt(h.startTime)));
  const maxH = Math.max(...open.map((h: any) => parseInt(h.endTime)));
  if (isNaN(minH) || isNaN(maxH) || maxH <= minH) return DEFAULT_HOURS;
  // Include one buffer hour before/after for visual comfort
  const from = Math.max(0, minH - 1);
  const to   = Math.min(23, maxH + 1);
  return Array.from({ length: to - from }, (_, i) => i + from);
};

// Returns {start, end} working hours for a given JS weekday (0=Sun..6=Sat)
const getWorkingHoursForDay = (workingHours: any[], jsDay: number): { start: number; end: number } | null => {
  if (!workingHours?.length) return null;
  const wDay = jsDay === 0 ? 6 : jsDay - 1; // Mon=0 convention
  const wh = workingHours.find((h: any) => h.dayOfWeek === wDay);
  if (!wh || !wh.isOpen) return null;
  return { start: parseInt(wh.startTime), end: parseInt(wh.endTime) };
};

const getWeekDays = (date: Date): Date[] => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const getMonthDays = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  // Start from Monday of the first week
  const startDow = firstDay.getDay();
  const startOffset = startDow === 0 ? -6 : 1 - startDow;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() + startOffset);
  // Fill 6 weeks (42 cells)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const statusColor: Record<string, string> = {
  CONFIRMED: 'confirmed',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
};

// ─── Details Panel ────────────────────────────────────────────────────────────

const DetailsPanel: React.FC<{
  apt: any;
  locale: string;
  onEdit: () => void;
  onCancel: () => void;
}> = ({ apt, locale, onEdit, onCancel }) => {
  const patientName = `${apt.patient?.lastName ?? ''} ${apt.patient?.firstName ?? ''}`.trim() || 'Unknown';
  const statusKey = statusColor[apt.status] || 'scheduled';

  const infoRows = [
    { label: 'Date',   value: new Date(apt.startTime).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Time',   value: `${new Date(apt.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} – ${new Date(apt.endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}` },
    { label: 'Status', value: apt.status.replace('_', ' ').toLowerCase() },
  ];

  return (
    <div className="details-active">
      <div className="details-patient-section">
        <div className="details-avatar-wrap">
          <Avatar size={80} name={patientName} variant="beam" colors={['#0D7377','#14919B','#45B7A0','#F2CC8F','#FF6B6B']} />
        </div>
        <h2 className="details-patient-name">{patientName}</h2>
        <div className="details-contact">
          <span className="details-contact-row"><IconPhone /> {apt.patient?.phone || '+7 — '}</span>
          <span className="details-contact-row"><IconMail /> {apt.patient?.email || '—'}</span>
        </div>
      </div>

      <div className="details-divider" />

      <div className="details-info-grid">
        {infoRows.map(row => (
          <div key={row.label} className="details-info-row">
            <span className="details-info-label">{row.label}</span>
            {row.label === 'Status' ? (
              <span className={`status-chip ${statusKey}`}>{row.value}</span>
            ) : (
              <span className="details-info-value">{row.value}</span>
            )}
          </div>
        ))}
      </div>

      {apt.notes && (
        <>
          <div className="details-divider" />
          <div className="details-notes">
            <span className="details-info-label">Notes</span>
            <p className="details-notes-text">{apt.notes}</p>
          </div>
        </>
      )}

      <div className="details-divider" />

      <div className="details-actions">
        <button className="details-btn secondary" onClick={onEdit}><IconRefresh /> Reschedule</button>
        <button className="details-btn danger" onClick={onCancel}><IconX /> Cancel Appointment</button>
      </div>
    </div>
  );
};

// ─── Time Grid (shared by Day and Week views) ──────────────────────────────

const TimeGrid: React.FC<{
  days: Date[];
  appointments: any[];
  today: Date;
  locale: string;
  selectedApt: any;
  hours: number[];
  gridMin: number;
  isLoading: boolean;
  workingHours?: any[];
  slotMin: number;
  doctors: any[];
  colorMode: 'status' | 'doctor';
  onSelect: (apt: any) => void;
  onDoubleClick: (apt: any) => void;
  onContextMenu: (e: React.MouseEvent, apt: any) => void;
  onSlotContextMenu: (e: React.MouseEvent, date: Date, hour: number, minute: number) => void;
  onDragReschedule: (aptId: string, newStart: string, newEnd: string) => void;
  gridRef: React.RefObject<HTMLDivElement | null>;
}> = ({ days, appointments, today, locale, selectedApt, hours, gridMin, isLoading, workingHours, slotMin, doctors, colorMode, onSelect, onDoubleClick, onContextMenu, onSlotContextMenu, onDragReschedule, gridRef }) => {
  // dayOfWeek in workingHours: 0=Mon … 6=Sun; JS getDay(): 0=Sun … 6=Sat
  const isDayOff = (d: Date) => {
    if (!workingHours?.length) return false;
    const jsDay = d.getDay(); // 0=Sun
    const wDay = jsDay === 0 ? 6 : jsDay - 1; // convert to Mon=0
    const wh = workingHours.find(h => h.dayOfWeek === wDay);
    return wh ? !wh.isOpen : false;
  };
  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  const startHour = hours[0] ?? 8;
  const [tooltip, setTooltip] = useState<{ apt: any; x: number; y: number } | null>(null);
  const calBodyRef = useRef<HTMLDivElement>(null);

  // ── Drag-to-reschedule ──
  type DragAptState = { apt: any; durationMin: number; clickOffsetMin: number; startX: number; startY: number; isDragging: boolean };
  const dragAptRef    = useRef<DragAptState | null>(null);
  const dragWasActive = useRef(false);
  const [dragGhost, setDragGhost] = useState<{ apt: any; dayIdx: number; topMin: number; durationMin: number } | null>(null);
  const dragGhostRef  = useRef(dragGhost);
  useEffect(() => { dragGhostRef.current = dragGhost; }, [dragGhost]);

  // Use a stable ref for values needed inside document event handlers
  const dragCtx = useRef({ days, startHour, gridMin, onDragReschedule });
  useEffect(() => { dragCtx.current = { days, startHour, gridMin, onDragReschedule }; });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragAptRef.current;
      if (!drag) return;
      if (!drag.isDragging) {
        if (Math.abs(e.clientX - drag.startX) < 5 && Math.abs(e.clientY - drag.startY) < 5) return;
        drag.isDragging = true;
      }
      const { days: _days, startHour: _sh, gridMin: _gm } = dragCtx.current;
      const bodyEl = calBodyRef.current;
      const gridEl = gridRef.current;
      if (!bodyEl || !gridEl) return;
      const bodyRect = bodyEl.getBoundingClientRect();
      const relX = e.clientX - bodyRect.left;
      const dayIdx = Math.max(0, Math.min(_days.length - 1, Math.floor(relX / (bodyRect.width / _days.length))));
      const gridRect = gridEl.getBoundingClientRect();
      const relY = e.clientY - gridRect.top + gridEl.scrollTop;
      const rawMin = (relY / SLOT_H) * 60 - drag.clickOffsetMin;
      const topMin = Math.max(0, Math.round(rawMin / _gm) * _gm);
      setDragGhost({ apt: drag.apt, dayIdx, topMin, durationMin: drag.durationMin });
    };

    const onUp = () => {
      const drag = dragAptRef.current;
      if (!drag) return;
      dragAptRef.current = null;
      if (!drag.isDragging) { setDragGhost(null); return; }
      dragWasActive.current = true;
      setTimeout(() => { dragWasActive.current = false; }, 0);
      const ghost = dragGhostRef.current;
      setDragGhost(null);
      if (!ghost) return;
      const { days: _days, startHour: _sh, onDragReschedule: _reschedule } = dragCtx.current;
      const absStartMin = _sh * 60 + ghost.topMin;
      const absEndMin   = absStartMin + ghost.durationMin;
      const targetDay   = _days[ghost.dayIdx];
      if (!targetDay) return;
      const newStart = new Date(targetDay); newStart.setHours(Math.floor(absStartMin / 60), absStartMin % 60, 0, 0);
      const newEnd   = new Date(targetDay); newEnd.setHours(Math.floor(absEndMin / 60),   absEndMin % 60,   0, 0);
      _reschedule(ghost.apt.id, newStart.toISOString(), newEnd.toISOString());
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, []); // stable — uses refs

  // ── LMB drag-to-select ──
  type DragSel = { dayIndex: number; startMin: number; endMin: number } | null;
  const [dragSel, setDragSel]       = useState<DragSel>(null);
  const dragStartMin = useRef<number | null>(null);
  const dragDayIdx   = useRef<number | null>(null);

  const minFromMouseY = useCallback((e: React.MouseEvent, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    const offsetY = e.clientY - rect.top + container.scrollTop;
    const totalMinFromStart = (offsetY / SLOT_H) * 60;
    const absMin = Math.round(totalMinFromStart / (gridMin)) * gridMin;
    return Math.max(0, absMin);
  }, [gridMin]);

  const handleSlotMouseDown = useCallback((e: React.MouseEvent, di: number) => {
    if (e.button !== 0) return; // LMB only
    e.preventDefault();
    const col = e.currentTarget as HTMLElement;
    const grid = col.closest('.grid-content') as HTMLElement;
    if (!grid) return;
    const startMin = minFromMouseY(e, grid);
    dragStartMin.current = startMin;
    dragDayIdx.current   = di;
    setDragSel({ dayIndex: di, startMin, endMin: startMin + gridMin });
  }, [minFromMouseY, gridMin]);

  const handleSlotMouseMove = useCallback((e: React.MouseEvent, di: number) => {
    if (dragStartMin.current === null || dragDayIdx.current !== di) return;
    const col = e.currentTarget as HTMLElement;
    const grid = col.closest('.grid-content') as HTMLElement;
    if (!grid) return;
    const curMin = minFromMouseY(e, grid);
    const s = Math.min(dragStartMin.current, curMin);
    const en = Math.max(dragStartMin.current, curMin) + gridMin;
    setDragSel({ dayIndex: di, startMin: s, endMin: en });
  }, [minFromMouseY, gridMin]);

  const handleSlotMouseUp = useCallback((e: React.MouseEvent, di: number, d: Date) => {
    if (dragStartMin.current === null || dragDayIdx.current !== di) {
      dragStartMin.current = null;
      dragDayIdx.current   = null;
      setDragSel(null);
      return;
    }
    const sel = dragSel;
    dragStartMin.current = null;
    dragDayIdx.current   = null;
    setDragSel(null);
    if (!sel || sel.endMin - sel.startMin < gridMin) return;
    // Open new appointment with selected time range
    const startH   = Math.floor((startHour * 60 + sel.startMin) / 60);
    const startMn  = (startHour * 60 + sel.startMin) % 60;
    const endH     = Math.floor((startHour * 60 + sel.endMin) / 60);
    const endMn    = (startHour * 60 + sel.endMin) % 60;
    const start = new Date(d); start.setHours(startH, startMn, 0, 0);
    const end   = new Date(d); end.setHours(endH, endMn, 0, 0);
    // Bubble up via a synthetic "new apt" — we call onSlotContextMenu is not ideal,
    // so we use a custom callback pattern via a detail event on the grid container
    const ev = new CustomEvent('drag-new-apt', { detail: { startISO: start.toISOString(), endISO: end.toISOString() }, bubbles: true });
    (e.currentTarget as HTMLElement).dispatchEvent(ev);
  }, [dragSel, startHour, gridMin]);

  const aptStyle = (apt: any, colIndex = 0, totalCols = 1): React.CSSProperties => {
    const start = new Date(apt.startTime);
    const end = new Date(apt.endTime);
    const top    = (start.getHours() + start.getMinutes() / 60 - startHour) * SLOT_H + 2;
    const height = Math.max(((end.getTime() - start.getTime()) / 3600000) * SLOT_H - 4, 28);
    if (totalCols <= 1) return { top: `${top}px`, height: `${height}px` };
    const pct = 100 / totalCols;
    return {
      top:    `${top}px`,
      height: `${height}px`,
      left:   `calc(${colIndex * pct}% + 4px)`,
      right:  'auto',
      width:  `calc(${pct}% - 6px)`,
    };
  };

  const nowTop = () => {
    const h = today.getHours() + today.getMinutes() / 60;
    return `${(h - startHour) * SLOT_H}px`;
  };

  const colCount = days.length;

  return (
    <>
      <div className="grid-header" style={{ gridTemplateColumns: `72px repeat(${colCount}, 1fr)` }}>
        <div className="time-col-header" />
        {days.map((d, i) => (
          <div key={i} className={`day-col-header ${isToday(d) ? 'today' : ''} ${isWeekend(d) ? 'weekend' : ''} ${isDayOff(d) ? 'day-off' : ''}`}>
            <span className="day-name">{d.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()}</span>
            <span className="day-date">{d.getDate()}</span>
            {isToday(d) && <div className="today-dot" />}
            {isDayOff(d) ? (
              <span className="day-off-label">Day off</span>
            ) : (
              <>
                <span className="day-apt-count">
                  {appointments.filter(a => new Date(a.startTime).toDateString() === d.toDateString()).length} appts
                </span>
                {(() => {
                  const jsDay = d.getDay();
                  const wDay = jsDay === 0 ? 6 : jsDay - 1;
                  const wh = workingHours?.find((h: any) => h.dayOfWeek === wDay);
                  const dayAptCount = appointments.filter(a => new Date(a.startTime).toDateString() === d.toDateString()).length;
                  if (!wh?.isOpen || dayAptCount === 0) return null;
                  const totalSlots = Math.max(1, ((parseInt(wh.endTime) - parseInt(wh.startTime)) * 60) / slotMin);
                  const pct = Math.min(100, Math.round((dayAptCount / totalSlots) * 100));
                  const color = pct >= 85 ? '#EF4444' : pct >= 60 ? '#F59E0B' : '#10B981';
                  return (
                    <div className="day-util-bar-wrap">
                      <div className="day-util-bar" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid-content" ref={gridRef}>
        <div className="time-labels-col">
          {hours.flatMap(h => {
            const open = workingHours?.filter((wh: any) => wh.isOpen) ?? [];
            const globalStart = open.length ? Math.min(...open.map((wh: any) => parseInt(wh.startTime))) : null;
            const globalEnd   = open.length ? Math.max(...open.map((wh: any) => parseInt(wh.endTime)))   : null;
            const isWorkTime  = globalStart !== null && globalEnd !== null && h >= globalStart && h < globalEnd;
            const offLabel    = !isWorkTime && globalStart !== null;
            const subCount    = 60 / gridMin;
            const subH        = SLOT_H / subCount;
            return Array.from({ length: subCount }, (_, si) => {
              const minute = si * gridMin;
              return (
                <div
                  key={`${h}-${si}`}
                  className={`time-label ${si === 0 ? 'hour-label' : 'sub-label'} ${offLabel ? 'off-hours-label' : ''}`}
                  style={{ height: `${subH}px` }}
                >
                  {si === 0 ? `${h}:00` : (gridMin < 60 ? `${String(minute).padStart(2,'0')}` : '')}
                </div>
              );
            });
          })}
        </div>

        <div className="calendar-body" ref={calBodyRef} style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
          {days.map((d, di) => {
            const dayWH = workingHours ? getWorkingHoursForDay(workingHours, d.getDay()) : null;
            return (
            <div
              key={di}
              className={`day-column ${isWeekend(d) ? 'weekend' : ''} ${isDayOff(d) ? 'day-off' : ''}`}
              onMouseDown={e => handleSlotMouseDown(e, di)}
              onMouseMove={e => handleSlotMouseMove(e, di)}
              onMouseUp={e => handleSlotMouseUp(e, di, d)}
            >
              {hours.flatMap(h => {
                const offHours = dayWH ? (h < dayWH.start || h >= dayWH.end) : false;
                const subCount = 60 / gridMin;
                const subH = SLOT_H / subCount;
                return Array.from({ length: subCount }, (_, si) => {
                  const minute = si * gridMin;
                  return (
                    <div
                      key={`${h}-${si}`}
                      className={`hour-slot ${si === 0 ? 'hour-boundary' : 'sub-slot'} ${offHours ? 'off-hours' : ''}`}
                      style={{ height: `${subH}px` }}
                      onContextMenu={e => { e.preventDefault(); onSlotContextMenu(e, d, h, minute); }}
                    />
                  );
                });
              })}

              {/* Drag selection overlay */}
              {dragSel && dragSel.dayIndex === di && (
                <div
                  className="drag-selection"
                  style={{
                    top:    `${dragSel.startMin / 60 * SLOT_H}px`,
                    height: `${Math.max((dragSel.endMin - dragSel.startMin) / 60 * SLOT_H, 4)}px`,
                  }}
                >
                  <span className="drag-selection-label">
                    {(() => {
                      const pad = (n: number) => String(n).padStart(2, '0');
                      const sH = Math.floor((startHour * 60 + dragSel.startMin) / 60);
                      const sM = (startHour * 60 + dragSel.startMin) % 60;
                      const eH = Math.floor((startHour * 60 + dragSel.endMin) / 60);
                      const eM = (startHour * 60 + dragSel.endMin) % 60;
                      return `${pad(sH)}:${pad(sM)} – ${pad(eH)}:${pad(eM)}`;
                    })()}
                  </span>
                </div>
              )}

              {isToday(d) && (
                <div className="now-line" style={{ top: nowTop() }}>
                  <div className="now-handle">NOW</div>
                </div>
              )}

              {isLoading
                ? SKEL[di % SKEL.length].map((b, i) => {
                    const top    = (b.h + b.m / 60 - startHour) * SLOT_H;
                    const height = (b.dur / 60) * SLOT_H - 4;
                    if (top < 0) return null;
                    return <div key={i} className="skeleton-block" style={{ top: `${top}px`, height: `${height}px` }} />;
                  })
                : (() => {
                    const dayApts = layoutDayAppointments(
                      appointments.filter(a => new Date(a.startTime).toDateString() === d.toDateString())
                    );
                    return (
                      <>
                        {/* Ghost block for dragged appointment */}
                        {dragGhost?.dayIdx === di && (
                          <div
                            className={`calendar-apt-block drag-ghost ${dragGhost.apt.color ? 'custom-color' : statusColor[dragGhost.apt.status] || 'scheduled'}`}
                            style={{
                              top:    `${dragGhost.topMin / 60 * SLOT_H + 2}px`,
                              height: `${Math.max(dragGhost.durationMin / 60 * SLOT_H - 4, 28)}px`,
                              ...(dragGhost.apt.color ? { background: dragGhost.apt.color + '22', borderLeftColor: dragGhost.apt.color } : {}),
                            }}
                          >
                            <div className="apt-block-time">
                              {(() => { const a = startHour * 60 + dragGhost.topMin; return `${String(Math.floor(a/60)).padStart(2,'0')}:${String(a%60).padStart(2,'0')}`; })()}
                            </div>
                            <div className="apt-name">{dragGhost.apt.patient?.lastName ?? '—'}</div>
                          </div>
                        )}

                        {dayApts.map(({ apt, colIndex, totalCols }) => {
                          const doctorColor = getDoctorColor(apt.doctorId, doctors);
                          const isDocMode = colorMode === 'doctor';
                          const blockClass = `calendar-apt-block ${isDocMode ? 'custom-color' : (apt.color ? 'custom-color' : statusColor[apt.status] || 'scheduled')} ${selectedApt?.id === apt.id ? 'selected' : ''} ${dragGhost?.apt.id === apt.id ? 'dragging' : ''}`;
                          const blockStyle: React.CSSProperties = {
                            ...aptStyle(apt, colIndex, totalCols),
                            ...(apt.color && !isDocMode ? { background: apt.color + '22', borderLeftColor: apt.color } :
                                isDocMode ? { background: doctorColor + '22', borderLeftColor: doctorColor } : {}),
                            cursor: dragGhost?.apt.id === apt.id ? 'grabbing' : 'grab',
                          };
                          const isDragged = dragGhost?.apt.id === apt.id;
                          return (
                            <div
                              key={apt.id}
                              className={blockClass}
                              style={blockStyle}
                              onClick={() => { if (dragWasActive.current) return; onSelect(apt); }}
                              onDoubleClick={() => { if (dragWasActive.current) return; onDoubleClick(apt); }}
                              onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onContextMenu(e, apt); }}
                              onMouseDown={e => {
                                if (e.button !== 0) return;
                                e.stopPropagation();
                                const durationMin = (new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime()) / 60000;
                                const rect = e.currentTarget.getBoundingClientRect();
                                dragAptRef.current = {
                                  apt, durationMin,
                                  clickOffsetMin: ((e.clientY - rect.top) / SLOT_H) * 60,
                                  startX: e.clientX, startY: e.clientY,
                                  isDragging: false,
                                };
                              }}
                              onMouseEnter={e => {
                                if (dragAptRef.current) return;
                                const r = e.currentTarget.getBoundingClientRect();
                                setTooltip({ apt, x: r.right + 10, y: r.top });
                              }}
                              onMouseLeave={() => setTooltip(null)}
                            >
                              {apt.doctor && (
                                <div className="apt-doctor-strip" style={{ background: doctorColor }} title={apt.doctor.name} />
                              )}
                              <div className="apt-block-time">
                                {new Date(apt.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="apt-name">{apt.patient?.lastName ?? '—'}</div>
                              <div className="apt-proc">{apt.notes || 'Checkup'}</div>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()
              }
            </div>
          );
          })}
        </div>
      </div>
      {tooltip && <AptTooltip apt={tooltip.apt} x={tooltip.x} y={tooltip.y} locale={locale} />}
    </>
  );
};

// ─── Month View ────────────────────────────────────────────────────────────────

const MonthView: React.FC<{
  currentDate: Date;
  appointments: any[];
  today: Date;
  locale: string;
  selectedApt: any;
  onSelect: (apt: any) => void;
  onDoubleClick: (apt: any) => void;
  onContextMenu: (e: React.MouseEvent, apt: any) => void;
  onSlotContextMenu: (e: React.MouseEvent, date: Date, hour: number) => void;
}> = ({ currentDate, appointments, today, locale, selectedApt, onSelect, onDoubleClick, onContextMenu, onSlotContextMenu }) => {
  const days = getMonthDays(currentDate);
  const currentMonth = currentDate.getMonth();
  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  const isCurrentMonth = (d: Date) => d.getMonth() === currentMonth;

  const weekDayNames = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(days[i]);
    return d.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase();
  });

  return (
    <div className="month-view">
      <div className="month-header-row">
        {weekDayNames.map((name, i) => (
          <div key={i} className={`month-header-cell ${i >= 5 ? 'weekend' : ''}`}>{name}</div>
        ))}
      </div>
      <div className="month-grid">
        {days.map((d, i) => {
          const dayApts = appointments.filter(a => new Date(a.startTime).toDateString() === d.toDateString());
          return (
            <div
              key={i}
              className={`month-cell ${isToday(d) ? 'today' : ''} ${isWeekend(d) ? 'weekend' : ''} ${!isCurrentMonth(d) ? 'other-month' : ''}`}
              onContextMenu={e => { e.preventDefault(); onSlotContextMenu(e, d, 9); }}
            >
              <span className="month-cell-date">{d.getDate()}</span>
              <div className="month-cell-apts">
                {dayApts.slice(0, 3).map(apt => {
                  const customStyle = apt.color
                    ? { background: apt.color + '22', borderLeftColor: apt.color }
                    : {};
                  return (
                    <div
                      key={apt.id}
                      className={`month-apt-chip ${apt.color ? 'custom-color' : statusColor[apt.status] || 'scheduled'} ${selectedApt?.id === apt.id ? 'selected' : ''}`}
                      style={customStyle}
                      onClick={() => onSelect(apt)}
                      onDoubleClick={() => onDoubleClick(apt)}
                      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onContextMenu(e, apt); }}
                    >
                      <span className="month-apt-time">
                        {new Date(apt.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="month-apt-name">{apt.patient?.lastName ?? '—'}</span>
                    </div>
                  );
                })}
                {dayApts.length > 3 && (
                  <div className="month-apt-more">+{dayApts.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Search Panel ─────────────────────────────────────────────────────────────

const SearchPanel: React.FC<{
  onClose: () => void;
  onJumpTo: (date: Date) => void;
  locale: string;
}> = ({ onClose, onJumpTo, locale }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Debounced live search — fires 350ms after user stops typing (min 2 chars)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      if (searched) { setResults([]); setSearched(false); }
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.get('/appointments', { q });
        const items = Array.isArray(data) ? data : (data?.data?.items ?? data?.data ?? []);
        setResults(items);
        setSearched(true);
      } catch {}
      finally { setIsSearching(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const fmtDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()} ${d.toLocaleDateString(locale, { month: 'short' })} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="search-panel-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="search-panel">
        <div className="search-panel-header">
          <span className="search-panel-title">Extended Search</span>
          <button className="search-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="search-panel-input-row">
          <input
            ref={inputRef}
            className="search-panel-input"
            placeholder="Patient name or phone number..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {isSearching && <div className="search-panel-spinner" />}
        </div>

        {query.trim().length > 0 && query.trim().length < 2 && (
          <div className="search-panel-meta">Type at least 2 characters…</div>
        )}
        {searched && !isSearching && (
          <div className="search-panel-meta">
            {results.length === 0
              ? 'No appointments found'
              : `Found: ${results.length} appointment${results.length !== 1 ? 's' : ''}`}
          </div>
        )}

        <div className="search-results">
          {results.map(apt => {
            const patientName = `${apt.patient?.lastName ?? ''} ${apt.patient?.firstName ?? ''}`.trim() || 'Patient';
            const phone = apt.patient?.contacts?.[0]?.value ?? apt.patient?.phone ?? '';
            const statusInfo = APT_STATUSES.find(s => s.value === apt.status);
            return (
              <div key={apt.id} className="search-result-row">
                <div className="search-result-left">
                  <div className="search-result-name">{patientName}</div>
                  {phone && <div className="search-result-phone">📞 {phone}</div>}
                </div>
                <div className="search-result-mid">
                  <div className="search-result-datetime">{fmtDateTime(apt.startTime)}</div>
                  <div className="search-result-doctor">{apt.doctor?.name ?? '—'}</div>
                </div>
                <div className="search-result-right">
                  <span className={`status-chip ${statusColor[apt.status] || 'scheduled'}`}>
                    {statusInfo?.icon} {statusInfo?.label}
                  </span>
                  <button
                    className="search-result-jump"
                    onClick={() => { onJumpTo(new Date(apt.startTime)); onClose(); }}
                  >
                    Jump →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Mini Calendar (date picker in toolbar) ────────────────────────────────

const MiniCalendar: React.FC<{
  value: Date;
  today: Date;
  locale: string;
  onChange: (d: Date) => void;
  onClose: () => void;
}> = ({ value, today, locale, onChange, onClose }) => {
  const [nav, setNav] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const days = getMonthDays(nav);
  const monthLabel = nav.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  return (
    <div ref={ref} className="mini-cal">
      <div className="mini-cal-header">
        <button className="mini-cal-nav" onClick={() => setNav(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>‹</button>
        <span className="mini-cal-month">{monthLabel}</span>
        <button className="mini-cal-nav" onClick={() => setNav(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>›</button>
      </div>
      <div className="mini-cal-grid">
        {['M','T','W','T','F','S','S'].map((n, i) => (
          <div key={i} className={`mini-cal-dow ${i >= 5 ? 'weekend' : ''}`}>{n}</div>
        ))}
        {days.map((d, i) => {
          const isThisMonth = d.getMonth() === nav.getMonth();
          const isToday     = d.toDateString() === today.toDateString();
          const isSelected  = d.toDateString() === value.toDateString();
          const isWeekend   = d.getDay() === 0 || d.getDay() === 6;
          return (
            <button
              key={i}
              className={`mini-cal-day ${isThisMonth ? '' : 'other'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isWeekend && isThisMonth ? 'weekend' : ''}`}
              onClick={() => { onChange(d); onClose(); }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Calendar ─────────────────────────────────────────────────────────────────

const Calendar: React.FC<{ onOpenPatient?: (patientId: string) => void }> = ({ onOpenPatient }) => {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [colorMode] = useState<'status' | 'doctor'>(() =>
    (localStorage.getItem(COLOR_MODE_KEY) as 'status' | 'doctor') || 'status'
  );
  const slotMin = parseInt(localStorage.getItem('calendarSlotMin') || '15', 10);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [miniCalOpen, setMiniCalOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [statusColors, setStatusColors] = useState<Record<string, string>>(loadStatusColors);
  const gridRef = useRef<HTMLDivElement>(null);
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  const today = new Date();
  const weekDays = getWeekDays(currentDate);

  const calendarHours = React.useMemo(() => {
    const branch = branches.find(b => b.id === selectedBranchId);
    return hoursFromWorkingSchedule(branch?.workingHours ?? []);
  }, [branches, selectedBranchId]);

  const [gridMin, setGridMin] = React.useState(getGridMin);

  // Re-read gridMin from localStorage when calendar tab becomes active
  React.useEffect(() => {
    setGridMin(getGridMin());
  }, []);

  // Listen for drag-to-create events from TimeGrid
  React.useEffect(() => {
    const handler = (e: Event) => {
      const { startISO, endISO } = (e as CustomEvent).detail;
      setEditingApt({ startTime: startISO, endTime: endISO });
      setIsModalOpen(true);
    };
    document.addEventListener('drag-new-apt', handler);
    return () => document.removeEventListener('drag-new-apt', handler);
  }, []);

  // Inject dynamic CSS for customizable status colors
  React.useEffect(() => {
    let el = document.getElementById('apt-status-colors') as HTMLStyleElement | null;
    if (!el) { el = document.createElement('style'); el.id = 'apt-status-colors'; document.head.appendChild(el); }
    el.textContent = APT_STATUSES.map(s => {
      const color = statusColors[s.value];
      const cls   = statusColor[s.value];
      return `
        .calendar-apt-block.${cls} { background: ${color}22 !important; border-left-color: ${color} !important; }
        .month-apt-chip.${cls}     { background: ${color}22 !important; border-left-color: ${color} !important; }
        .status-chip.${cls}        { background: ${color}22 !important; color: ${color} !important; }
      `;
    }).join('');
    return () => { document.getElementById('apt-status-colors')?.remove(); };
  }, [statusColors]);

  const handleColorChange = (status: string, color: string) => {
    const next = { ...statusColors, [status]: color };
    setStatusColors(next);
    localStorage.setItem(STATUS_COLORS_KEY, JSON.stringify(next));
  };

  const handleResetColors = () => {
    setStatusColors({ ...DEFAULT_STATUS_COLORS });
    localStorage.removeItem(STATUS_COLORS_KEY);
  };

  const handleDragReschedule = async (aptId: string, newStart: string, newEnd: string) => {
    // Optimistic update
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, startTime: newStart, endTime: newEnd } : a));
    setSelectedApt((prev: any) => prev?.id === aptId ? { ...prev, startTime: newStart, endTime: newEnd } : prev);
    try {
      await api.put(`/appointments/${aptId}`, { startTime: newStart, endTime: newEnd });
    } catch {
      fetchAppointments(); // revert on error
    }
  };

  // Filtered appointments based on cancelled toggle
  const filteredAppointments = appointments.filter(apt => {
    if (!showCancelled && (apt.status === 'CANCELLED')) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  // Scroll to current time on mount (time-grid views only)
  useEffect(() => {
    if (gridRef.current && (view === 'week' || view === 'day')) {
      const hour = today.getHours();
      const startHour = calendarHours[0] ?? 8;
      const offset = (hour - startHour) * SLOT_H - 60;
      gridRef.current.scrollTop = Math.max(0, offset);
    }
  }, [isLoading, view, calendarHours]);

  const getDateRange = () => {
    if (view === 'day') {
      const start = new Date(currentDate); start.setHours(0, 0, 0, 0);
      const end = new Date(currentDate); end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    if (view === 'month') {
      const days = getMonthDays(currentDate);
      const start = new Date(days[0]); start.setHours(0, 0, 0, 0);
      const end = new Date(days[41]); end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    // week
    const days = getWeekDays(currentDate);
    const start = new Date(days[0]); start.setHours(0, 0, 0, 0);
    const end = new Date(days[6]); end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  // Load branches once on mount
  useEffect(() => {
    api.get('/branches').then((data: any) => {
      const list: any[] = Array.isArray(data) ? data : (data?.data ?? []);
      setBranches(list);
      const main = list.find((b: any) => b.isMain) ?? list[0];
      if (main) setSelectedBranchId(main.id);
    }).catch(() => {});
  }, []);

  // Load doctors on mount
  useEffect(() => {
    api.get('/staff', { role: 'DOCTOR', limit: '100' }).then((data: any) => {
      const list = Array.isArray(data) ? data : (data?.data?.items ?? data?.data ?? []);
      setDoctors(list);
    }).catch(() => {});
  }, []);

  // Close branch dropdown on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target as Node)) {
        setBranchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const { start, end } = getDateRange();
      const params: Record<string, string> = {
        start: start.toISOString(),
        end: end.toISOString(),
      };
      if (selectedBranchId) params.branchId = selectedBranchId;
      const data = await api.get('/appointments', params);
      const items = Array.isArray(data) ? data : (data?.data?.items ?? data?.data ?? []);
      setAppointments(items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [currentDate, view, selectedBranchId]);

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (view === 'day') {
      d.setDate(d.getDate() + dir);
    } else if (view === 'month') {
      d.setMonth(d.getMonth() + dir);
    } else {
      d.setDate(d.getDate() + dir * 7);
    }
    setCurrentDate(d);
  };

  const rangeLabel = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (view === 'month') {
      return currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    }
    const days = getWeekDays(currentDate);
    return `${days[0].toLocaleDateString(locale, { day: 'numeric', month: 'short' })} — ${days[6].toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const handleSelect = (apt: any) => setSelectedApt(apt);
  const handleDoubleClick = (apt: any) => { setEditingApt(apt); setIsModalOpen(true); };

  const handleCtxApt = useCallback((e: React.MouseEvent, apt: any) => {
    setCtxMenu({ type: 'apt', x: e.clientX, y: e.clientY, apt });
    setSelectedApt(apt);
  }, []);

  const handleCtxSlot = useCallback((e: React.MouseEvent, date: Date, hour: number, minute: number = 0) => {
    setCtxMenu({ type: 'slot', x: e.clientX, y: e.clientY, date, hour, minute });
  }, []);

  const handleStatusChange = async (aptId: string, status: string) => {
    try {
      await api.put(`/appointments/${aptId}`, { status, color: null });
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status, color: null } : a));
      setSelectedApt((prev: any) => prev?.id === aptId ? { ...prev, status, color: null } : prev);
    } catch {}
  };

  const handleCopyApt = (apt: any) => {
    // Copy: same data but no id — creates new appointment, user can change time/patient
    setEditingApt({ ...apt, id: undefined, _copy: true });
    setIsModalOpen(true);
  };

  const handleDeleteApt = async (apt: any) => {
    if (!window.confirm(`Delete appointment for ${apt.patient?.lastName ?? 'patient'}?`)) return;
    try {
      await api.delete(`/appointments/${apt.id}`);
      setAppointments(prev => prev.filter(a => a.id !== apt.id));
      if (selectedApt?.id === apt.id) setSelectedApt(null);
    } catch {}
  };

  const handleNewAptAt = (date: Date, hour: number, minute: number = 0) => {
    const slotMin = parseInt(localStorage.getItem('calendarSlotMin') || '15', 10);
    const start = new Date(date);
    start.setHours(hour, minute, 0, 0);
    const end = new Date(start.getTime() + slotMin * 60000);
    setEditingApt({ startTime: start.toISOString(), endTime: end.toISOString() });
    setIsModalOpen(true);
  };


  return (
    <div className="calendar-page-wrapper" onContextMenu={e => e.preventDefault()}>

      {/* Search Panel */}
      {searchPanelOpen && (
        <SearchPanel
          onClose={() => setSearchPanelOpen(false)}
          onJumpTo={date => { setCurrentDate(date); setView('day'); }}
          locale={locale}
        />
      )}

      {/* Context menu */}
      {ctxMenu && (
        <ContextMenu
          menu={ctxMenu}
          onClose={() => setCtxMenu(null)}
          onStatusChange={handleStatusChange}
          onEdit={apt => { setEditingApt(apt); setIsModalOpen(true); }}
          onDelete={handleDeleteApt}
          onCopy={handleCopyApt}
          onNewApt={handleNewAptAt}
          onOpenPatient={onOpenPatient}
        />
      )}

      {/* Toolbar */}
      <header className="calendar-toolbar card">
        <div className="toolbar-left flex items-center gap-m">
          {/* Branch selector */}
          {branches.length > 0 && (
            <div className="branch-selector" ref={branchDropdownRef}>
              <button
                className={`branch-trigger ${branchDropdownOpen ? 'open' : ''}`}
                onClick={() => setBranchDropdownOpen(p => !p)}
              >
                {(() => {
                  const b = branches.find(b => b.id === selectedBranchId);
                  return (
                    <>
                      <span
                        className="branch-color-dot"
                        style={{ background: b?.color ?? 'var(--primary-light-teal)' }}
                      />
                      <span className="branch-trigger-name">{b?.name ?? 'Branch'}</span>
                      {b?.isMain && <span className="branch-main-badge">Main</span>}
                      <IconChevDown />
                    </>
                  );
                })()}
              </button>

              {branchDropdownOpen && (
                <div className="branch-dropdown">
                  <div className="branch-dropdown-header">
                    <IconMapPin /> Branches
                  </div>
                  {branches.map(b => (
                    <button
                      key={b.id}
                      className={`branch-option ${b.id === selectedBranchId ? 'active' : ''}`}
                      onClick={() => { setSelectedBranchId(b.id); setBranchDropdownOpen(false); }}
                    >
                      <span
                        className="branch-color-dot"
                        style={{ background: b.color ?? 'var(--primary-light-teal)' }}
                      />
                      <span className="branch-option-name">{b.name}</span>
                      {b.isMain && <span className="branch-main-badge">Main</span>}
                      <span className="branch-option-count">{b._count?.appointments ?? ''}</span>
                      {b.id === selectedBranchId && <span className="branch-check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="toolbar-divider" />

          <div className="range-label-wrap" style={{ position: 'relative' }}>
            <button className="week-range-label range-label-btn" onClick={() => setMiniCalOpen(p => !p)}>
              {rangeLabel()}
            </button>
            {miniCalOpen && (
              <MiniCalendar
                value={currentDate}
                today={today}
                locale={locale}
                onChange={d => setCurrentDate(d)}
                onClose={() => setMiniCalOpen(false)}
              />
            )}
          </div>
          <div className="nav-group flex items-center">
            <button className="nav-arrow" onClick={() => navigate(-1)}><IconChevLeft /></button>
            <button className="today-btn" onClick={() => setCurrentDate(new Date())}>{t('calendar.today')}</button>
            <button className="nav-arrow" onClick={() => navigate(1)}><IconChevRight /></button>
          </div>

          <div className="toolbar-divider" />

          {/* Utility action group */}
          <div className="cal-util-group">
            {/* Patient search */}
            <button
              className={`cal-util-btn ${searchPanelOpen ? 'active' : ''}`}
              title="Extended search"
              onClick={() => setSearchPanelOpen(true)}
            >
              <IconSearch />
              <span>Search</span>
            </button>

            {/* Show cancelled toggle */}
            <button
              className={`cal-util-btn ${showCancelled ? 'active' : ''}`}
              title={showCancelled ? 'Hide cancelled' : 'Show cancelled'}
              onClick={() => setShowCancelled(prev => !prev)}
            >
              {showCancelled ? <IconEye /> : <IconEyeOff />}
              <span>Cancelled</span>
              {showCancelled && <span className="cal-util-dot" />}
            </button>

            {/* Print */}
            <button className="cal-util-btn" title="Print schedule" onClick={handlePrint}>
              <IconPrint />
              <span>Print</span>
            </button>

            {/* Status legend + color customization */}
            <div style={{ position: 'relative' }}>
              <button
                className={`cal-util-btn ${legendOpen ? 'active' : ''}`}
                title="Status legend & colors"
                onClick={() => setLegendOpen(p => !p)}
              >
                <IconPalette />
                <span>Legend</span>
              </button>
              {legendOpen && (
                <StatusLegend
                  colors={statusColors}
                  onChange={handleColorChange}
                  onReset={handleResetColors}
                  onClose={() => setLegendOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="toolbar-right flex items-center gap-m">
          <div className="view-toggle flex">
            {(['day', 'week', 'month'] as const).map(v => (
              <button key={v} className={`toggle-item ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
                {t(`calendar.${v}`)}
              </button>
            ))}
          </div>
          <button className="icon-btn"><IconFilter /></button>
          <button className="new-apt-btn flex items-center gap-s" onClick={() => { setEditingApt(null); setIsModalOpen(true); }}>
            <IconPlus /> {t('calendar.booking')}
          </button>
        </div>
      </header>

      {/* Stats strip */}
      {!isLoading && filteredAppointments.length > 0 && (view === 'week' || view === 'day') && (
        <div className="stats-strip">
          {(() => {
            const total = filteredAppointments.length;
            const byStatus = APT_STATUSES.map(s => ({
              ...s,
              count: filteredAppointments.filter(a => a.status === s.value).length,
            })).filter(s => s.count > 0);
            return (
              <>
                <span className="stats-item total">{total} appointments</span>
                <span className="stats-divider">·</span>
                {byStatus.map(s => (
                  <span key={s.value} className="stats-item">
                    {s.icon} {s.count} {s.label.toLowerCase()}
                  </span>
                ))}
              </>
            );
          })()}
        </div>
      )}

      {/* Main layout: grid + details */}
      <div className="calendar-main-layout">

        {/* Grid */}
        <div className={`calendar-grid-container card ${view === 'month' ? 'month-mode' : ''}`}>
          {view === 'month' ? (
            <MonthView
              currentDate={currentDate}
              appointments={filteredAppointments}
              today={today}
              locale={locale}
              selectedApt={selectedApt}
              onSelect={handleSelect}
              onDoubleClick={handleDoubleClick}
              onContextMenu={handleCtxApt}
              onSlotContextMenu={handleCtxSlot}
            />
          ) : (
            <TimeGrid
              days={view === 'day' ? [currentDate] : weekDays}
              appointments={filteredAppointments}
              today={today}
              locale={locale}
              selectedApt={selectedApt}
              hours={calendarHours}
              gridMin={gridMin}
              isLoading={isLoading}
              workingHours={branches.find(b => b.id === selectedBranchId)?.workingHours}
              slotMin={slotMin}
              doctors={doctors}
              colorMode={colorMode}
              onSelect={handleSelect}
              onDoubleClick={handleDoubleClick}
              onContextMenu={handleCtxApt}
              onSlotContextMenu={handleCtxSlot}
              onDragReschedule={handleDragReschedule}
              gridRef={gridRef}
            />
          )}
        </div>

        {/* Details panel */}
        <div className="apt-details-panel card">
          {selectedApt ? (
            <DetailsPanel
              apt={selectedApt}
              locale={locale}
              onEdit={() => { setEditingApt(selectedApt); setIsModalOpen(true); }}
              onCancel={() => handleStatusChange(selectedApt.id, 'CANCELLED')}
            />
          ) : (
            <div className="empty-selection">
              <div className="empty-icon-bg"><IconCalEmpty /></div>
              <p>{t('calendar.empty_selection')}</p>
            </div>
          )}
        </div>

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApt?._copy ? 'Copy appointment' : editingApt ? t('calendar.edit_appointment') : t('calendar.booking')}
      >
        <AppointmentForm
          initialData={editingApt}
          onSuccess={() => { setIsModalOpen(false); fetchAppointments(); setSelectedApt(null); }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Calendar;
