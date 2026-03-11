import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// ─── Context Menu ──────────────────────────────────────────────────────────────

type CtxMenu =
  | { type: 'apt';  x: number; y: number; apt: any }
  | { type: 'slot'; x: number; y: number; date: Date; hour: number };

const ContextMenu: React.FC<{
  menu: CtxMenu;
  onClose: () => void;
  onStatusChange: (aptId: string, status: string) => void;
  onEdit: (apt: any) => void;
  onDelete: (apt: any) => void;
  onCopy: (apt: any) => void;
  onNewApt: (date: Date, hour: number) => void;
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
    const timeLabel = `${pad(menu.hour)}:00 – ${pad(menu.hour + 1)}:00`;
    const dateLabel = menu.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    return (
      <div ref={ref} className="ctx-menu" style={style}>
        <div className="ctx-menu-header">{dateLabel}, {timeLabel}</div>
        <button className="ctx-item" onClick={() => { onNewApt(menu.date, menu.hour); onClose(); }}>
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

const DEFAULT_HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08–20 fallback
const SLOT_H = 60; // px per hour

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
  workingHours?: any[];
  onSelect: (apt: any) => void;
  onDoubleClick: (apt: any) => void;
  onContextMenu: (e: React.MouseEvent, apt: any) => void;
  onSlotContextMenu: (e: React.MouseEvent, date: Date, hour: number) => void;
  gridRef: React.RefObject<HTMLDivElement | null>;
}> = ({ days, appointments, today, locale, selectedApt, hours, workingHours, onSelect, onDoubleClick, onContextMenu, onSlotContextMenu, gridRef }) => {
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

  const aptStyle = (apt: any) => {
    const start = new Date(apt.startTime);
    const end = new Date(apt.endTime);
    const top = (start.getHours() + start.getMinutes() / 60 - startHour) * SLOT_H + 2;
    const height = Math.max(((end.getTime() - start.getTime()) / 3600000) * SLOT_H - 4, 28);
    return { top: `${top}px`, height: `${height}px` };
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
              <span className="day-apt-count">
                {appointments.filter(a => new Date(a.startTime).toDateString() === d.toDateString()).length} appts
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid-content" ref={gridRef}>
        <div className="time-labels-col">
          {hours.map(h => {
            const open = workingHours?.filter((wh: any) => wh.isOpen) ?? [];
            const globalStart = open.length ? Math.min(...open.map((wh: any) => parseInt(wh.startTime))) : null;
            const globalEnd   = open.length ? Math.max(...open.map((wh: any) => parseInt(wh.endTime)))   : null;
            const isWorkTime  = globalStart !== null && globalEnd !== null && h >= globalStart && h < globalEnd;
            return (
              <div key={h} className={`time-label ${!isWorkTime && globalStart !== null ? 'off-hours-label' : ''}`}>
                {h}:00
              </div>
            );
          })}
        </div>

        <div className="calendar-body" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
          {days.map((d, di) => {
            const dayWH = workingHours ? getWorkingHoursForDay(workingHours, d.getDay()) : null;
            return (
            <div key={di} className={`day-column ${isWeekend(d) ? 'weekend' : ''} ${isDayOff(d) ? 'day-off' : ''}`}>
              {hours.map(h => {
                const offHours = dayWH ? (h < dayWH.start || h >= dayWH.end) : false;
                return (
                <div
                  key={h}
                  className={`hour-slot ${offHours ? 'off-hours' : ''}`}
                  onContextMenu={e => { e.preventDefault(); onSlotContextMenu(e, d, h); }}
                />
                );
              })}

              {isToday(d) && (
                <div className="now-line" style={{ top: nowTop() }}>
                  <div className="now-handle">NOW</div>
                </div>
              )}

              {appointments
                .filter(a => new Date(a.startTime).toDateString() === d.toDateString())
                .map(apt => {
                  const customStyle = apt.color
                    ? { background: apt.color + '22', borderLeftColor: apt.color }
                    : {};
                  return (
                    <div
                      key={apt.id}
                      className={`calendar-apt-block ${apt.color ? 'custom-color' : statusColor[apt.status] || 'scheduled'} ${selectedApt?.id === apt.id ? 'selected' : ''}`}
                      style={{ ...aptStyle(apt), ...customStyle }}
                      onClick={() => onSelect(apt)}
                      onDoubleClick={() => onDoubleClick(apt)}
                      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onContextMenu(e, apt); }}
                    >
                      <div className="apt-block-time">
                        {new Date(apt.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="apt-name">{apt.patient?.lastName ?? '—'}</div>
                      <div className="apt-proc">{apt.notes || 'Checkup'}</div>
                    </div>
                  );
                })
              }
            </div>
          );
          })}
        </div>
      </div>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showCancelled, setShowCancelled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  const today = new Date();
  const weekDays = getWeekDays(currentDate);

  const calendarHours = React.useMemo(() => {
    const branch = branches.find(b => b.id === selectedBranchId);
    return hoursFromWorkingSchedule(branch?.workingHours ?? []);
  }, [branches, selectedBranchId]);

  // Filtered appointments based on search query and cancelled toggle
  const filteredAppointments = appointments.filter(apt => {
    if (!showCancelled && (apt.status === 'CANCELLED')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const full = `${apt.patient?.lastName ?? ''} ${apt.patient?.firstName ?? ''} ${apt.patient?.middleName ?? ''}`.toLowerCase();
      if (!full.includes(q)) return false;
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSearchToggle = () => {
    setSearchOpen(prev => {
      if (prev) setSearchQuery('');
      else setTimeout(() => searchRef.current?.focus(), 50);
      return !prev;
    });
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

  const handleCtxSlot = useCallback((e: React.MouseEvent, date: Date, hour: number) => {
    setCtxMenu({ type: 'slot', x: e.clientX, y: e.clientY, date, hour });
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

  const handleNewAptAt = (date: Date, hour: number) => {
    const slotMin = parseInt(localStorage.getItem('calendarSlotMin') || '15', 10);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString() && hour === now.getHours();

    const start = new Date(date);
    if (isToday) {
      // Snap current minutes up to the nearest slot boundary
      const snappedMin = Math.ceil(now.getMinutes() / slotMin) * slotMin;
      start.setHours(hour, snappedMin >= 60 ? 0 : snappedMin, 0, 0);
      if (snappedMin >= 60) start.setHours(hour + 1, 0, 0, 0);
    } else {
      start.setHours(hour, 0, 0, 0);
    }

    const end = new Date(start.getTime() + slotMin * 60000);
    setEditingApt({ startTime: start.toISOString(), endTime: end.toISOString() });
    setIsModalOpen(true);
  };


  return (
    <div className="calendar-page-wrapper" onContextMenu={e => e.preventDefault()}>

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

          <h2 className="week-range-label">{rangeLabel()}</h2>
          <div className="nav-group flex items-center">
            <button className="nav-arrow" onClick={() => navigate(-1)}><IconChevLeft /></button>
            <button className="today-btn" onClick={() => setCurrentDate(new Date())}>{t('calendar.today')}</button>
            <button className="nav-arrow" onClick={() => navigate(1)}><IconChevRight /></button>
          </div>

          <div className="toolbar-divider" />

          {/* Utility action group */}
          <div className="cal-util-group">
            {/* Patient search */}
            <div className={`cal-search-wrap ${searchOpen ? 'open' : ''}`}>
              <button
                className={`cal-util-btn ${searchOpen ? 'active' : ''}`}
                title="Search by patient name"
                onClick={handleSearchToggle}
              >
                <IconSearch />
                <span>Search</span>
              </button>
              {searchOpen && (
                <input
                  ref={searchRef}
                  className="cal-search-input"
                  placeholder="Patient name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && handleSearchToggle()}
                />
              )}
              {searchQuery && (
                <span className="cal-search-count">{filteredAppointments.length}</span>
              )}
            </div>

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
              workingHours={branches.find(b => b.id === selectedBranchId)?.workingHours}
              onSelect={handleSelect}
              onDoubleClick={handleDoubleClick}
              onContextMenu={handleCtxApt}
              onSlotContextMenu={handleCtxSlot}
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
