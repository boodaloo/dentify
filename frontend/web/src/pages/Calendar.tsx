import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import Modal from '../components/Modal';
import AppointmentForm from '../components/AppointmentForm';
import './Calendar.css';

const IconPlus        = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconChevLeft    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconChevRight   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const IconFilter      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IconCalEmpty    = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const IconPhone       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMail        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconPlay        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IconRefresh     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
const IconX           = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08–20
const SLOT_H = 60; // px per hour

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
  const lastDay = new Date(year, month + 1, 0);
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
}> = ({ apt, locale, onEdit }) => {
  const patientName = `${apt.patient?.firstName ?? ''} ${apt.patient?.lastName ?? ''}`.trim();
  const initials = patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const statusKey = statusColor[apt.status] || 'scheduled';

  const infoRows = [
    { label: 'Date', value: new Date(apt.startTime).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Time', value: `${new Date(apt.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} – ${new Date(apt.endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}` },
    { label: 'Procedure', value: apt.notes || 'Routine Checkup' },
    { label: 'Status', value: apt.status.replace('_', ' ').toLowerCase() },
  ];

  return (
    <div className="details-active">
      <div className="details-patient-section">
        <div className="details-avatar-wrap">
          <div className="details-avatar">{initials}</div>
        </div>
        <h2 className="details-patient-name">{patientName || 'Unknown'}</h2>
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
          <div className="details-notes-section">
            <h4>Notes</h4>
            <div className="details-notes-box">{apt.notes}</div>
          </div>
        </>
      )}

      <div className="details-divider" />

      <div className="details-actions">
        <button className="details-btn primary" onClick={onEdit}><IconPlay /> Start Visit</button>
        <button className="details-btn secondary" onClick={onEdit}><IconRefresh /> Reschedule</button>
        <button className="details-btn danger"><IconX /> Cancel Appointment</button>
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
  onSelect: (apt: any) => void;
  onDoubleClick: (apt: any) => void;
  gridRef: React.RefObject<HTMLDivElement>;
}> = ({ days, appointments, today, locale, selectedApt, onSelect, onDoubleClick, gridRef }) => {
  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  const aptStyle = (apt: any) => {
    const start = new Date(apt.startTime);
    const end = new Date(apt.endTime);
    const top = (start.getHours() + start.getMinutes() / 60 - 8) * SLOT_H + 2;
    const height = Math.max(((end.getTime() - start.getTime()) / 3600000) * SLOT_H - 4, 28);
    return { top: `${top}px`, height: `${height}px` };
  };

  const nowTop = () => {
    const h = today.getHours() + today.getMinutes() / 60;
    return `${(h - 8) * SLOT_H}px`;
  };

  const colCount = days.length;

  return (
    <>
      <div className="grid-header" style={{ gridTemplateColumns: `72px repeat(${colCount}, 1fr)` }}>
        <div className="time-col-header" />
        {days.map((d, i) => (
          <div key={i} className={`day-col-header ${isToday(d) ? 'today' : ''} ${isWeekend(d) ? 'weekend' : ''}`}>
            <span className="day-name">{d.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()}</span>
            <span className="day-date">{d.getDate()}</span>
            {isToday(d) && <div className="today-dot" />}
            <span className="day-apt-count">
              {appointments.filter(a => new Date(a.startTime).toDateString() === d.toDateString()).length} appts
            </span>
          </div>
        ))}
      </div>

      <div className="grid-content" ref={gridRef}>
        <div className="time-labels-col">
          {HOURS.map(h => (
            <div key={h} className="time-label">{h}:00</div>
          ))}
        </div>

        <div className="calendar-body" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
          {days.map((d, di) => (
            <div key={di} className={`day-column ${isWeekend(d) ? 'weekend' : ''}`}>
              {HOURS.map(h => <div key={h} className="hour-slot" />)}

              {isToday(d) && (
                <div className="now-line" style={{ top: nowTop() }}>
                  <div className="now-handle">NOW</div>
                </div>
              )}

              {appointments
                .filter(a => new Date(a.startTime).toDateString() === d.toDateString())
                .map(apt => (
                  <div
                    key={apt.id}
                    className={`calendar-apt-block ${statusColor[apt.status] || 'scheduled'} ${selectedApt?.id === apt.id ? 'selected' : ''}`}
                    style={aptStyle(apt)}
                    onClick={() => onSelect(apt)}
                    onDoubleClick={() => onDoubleClick(apt)}
                  >
                    <div className="apt-block-time">
                      {new Date(apt.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="apt-name">{apt.patient?.lastName ?? '—'}</div>
                    <div className="apt-proc">{apt.notes || 'Checkup'}</div>
                  </div>
                ))
              }
            </div>
          ))}
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
}> = ({ currentDate, appointments, today, locale, selectedApt, onSelect, onDoubleClick }) => {
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
            >
              <span className="month-cell-date">{d.getDate()}</span>
              <div className="month-cell-apts">
                {dayApts.slice(0, 3).map(apt => (
                  <div
                    key={apt.id}
                    className={`month-apt-chip ${statusColor[apt.status] || 'scheduled'} ${selectedApt?.id === apt.id ? 'selected' : ''}`}
                    onClick={() => onSelect(apt)}
                    onDoubleClick={() => onDoubleClick(apt)}
                  >
                    <span className="month-apt-time">
                      {new Date(apt.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="month-apt-name">{apt.patient?.lastName ?? '—'}</span>
                  </div>
                ))}
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

const Calendar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  const today = new Date();
  const weekDays = getWeekDays(currentDate);

  // Scroll to current time on mount (time-grid views only)
  useEffect(() => {
    if (gridRef.current && (view === 'week' || view === 'day')) {
      const hour = today.getHours();
      const offset = (hour - 8) * SLOT_H - 60;
      gridRef.current.scrollTop = Math.max(0, offset);
    }
  }, [isLoading, view]);

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

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const { start, end } = getDateRange();
      const data = await api.get('/appointments', {
        start: start.toISOString(),
        end: end.toISOString(),
      });
      const items = Array.isArray(data) ? data : (data?.data?.items ?? data?.data ?? []);
      setAppointments(items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [currentDate, view]);

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

  return (
    <div className="calendar-page-wrapper">

      {/* Toolbar */}
      <header className="calendar-toolbar card">
        <div className="toolbar-left flex items-center gap-m">
          <h2 className="week-range-label">{rangeLabel()}</h2>
          <div className="nav-group flex items-center">
            <button className="nav-arrow" onClick={() => navigate(-1)}><IconChevLeft /></button>
            <button className="today-btn" onClick={() => setCurrentDate(new Date())}>{t('calendar.today')}</button>
            <button className="nav-arrow" onClick={() => navigate(1)}><IconChevRight /></button>
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
              appointments={appointments}
              today={today}
              locale={locale}
              selectedApt={selectedApt}
              onSelect={handleSelect}
              onDoubleClick={handleDoubleClick}
            />
          ) : (
            <TimeGrid
              days={view === 'day' ? [currentDate] : weekDays}
              appointments={appointments}
              today={today}
              locale={locale}
              selectedApt={selectedApt}
              onSelect={handleSelect}
              onDoubleClick={handleDoubleClick}
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
        title={editingApt ? t('calendar.edit_appointment') : t('calendar.booking')}
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
