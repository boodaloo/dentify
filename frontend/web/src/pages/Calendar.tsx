import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import Modal from '../components/Modal';
import AppointmentForm from '../components/AppointmentForm';
import './Calendar.css';

const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconChevronLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;

const Calendar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00

  const getWeekDays = (date: Date) => {
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

  const weekDays = getWeekDays(currentDate);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const start = new Date(weekDays[0]);
      start.setHours(0, 0, 0, 0);
      const end = new Date(weekDays[6]);
      end.setHours(23, 59, 59, 999);

      const data = await api.get('/appointments', {
        start: start.toISOString(),
        end: end.toISOString()
      });
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const getAptStyle = (apt: any) => {
    const start = new Date(apt.startTime);
    const end = new Date(apt.endTime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return {
      top: `${(startHour - 8) * 80 + 2}px`,
      height: `${duration * 80 - 4}px`,
    };
  };

  const handleCreateNew = () => {
    setEditingApt(null);
    setIsModalOpen(true);
  };

  const handleEdit = (apt: any) => {
    setEditingApt(apt);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="calendar-page flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';

  return (
    <div className="calendar-page">
      <div className="calendar-main card">
        <header className="calendar-toolbar flex justify-between items-center">
          <div className="flex items-center gap-l">
            <h2 className="month-label">
              {currentDate.toLocaleString(locale, { month: 'long', year: 'numeric' })}
            </h2>
            <div className="nav-buttons flex">
              <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}>
                <IconChevronLeft />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="today-btn">{t('calendar.today')}</button>
              <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}>
                <IconChevronRight />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-m">
            <div className="view-switcher flex">
              <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>{t('calendar.day')}</button>
              <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>{t('calendar.week')}</button>
              <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>{t('calendar.month')}</button>
            </div>
            <button className="icon-btn"><IconSettings /></button>
            <button className="add-apt-btn primary flex items-center gap-s" onClick={handleCreateNew}>
              <IconPlus />
              {t('calendar.booking')}
            </button>
          </div>
        </header>

        <div className="calendar-grid-wrapper">
          <div className="time-column">
            <div className="grid-header-spacer"></div>
            {hours.map(h => (
              <div key={h} className="time-slot-label">{h}:00</div>
            ))}
          </div>
          
          <div className="days-grid">
            <div className="grid-header flex">
              {weekDays.map((date, i) => (
                <div key={i} className={`day-header flex-1 ${date.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                  <span className="day-name">{date.toLocaleString(locale, { weekday: 'short' })}</span>
                  <span className="day-number">{date.getDate()}</span>
                </div>
              ))}
            </div>
            
            <div className="grid-content flex">
              {weekDays.map((date, i) => (
                <div key={i} className="day-column flex-1">
                  {hours.map(h => <div key={h} className="hour-cell"></div>)}
                  
                  {appointments
                    .filter(apt => new Date(apt.startTime).toDateString() === date.toDateString())
                    .map(apt => (
                      <div 
                        key={apt.id} 
                        className={`apt-card ${apt.status.toLowerCase()}`}
                        style={getAptStyle(apt)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApt(apt);
                        }}
                        onDoubleClick={() => handleEdit(apt)}
                      >
                        <div className="apt-card-time">
                          {new Date(apt.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="apt-card-name">{apt.patient?.lastName}</div>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <aside className="calendar-sidebar flex-col gap-l">
        <div className="mini-calendar card">
          <div className="mini-cal-header flex justify-between items-center">
            <h4>{t('calendar.select_date')}</h4>
            <IconCalendar />
          </div>
          <div className="mini-cal-placeholder">
            [{currentDate.toLocaleString(locale, { month: 'short', year: 'numeric' })}]
          </div>
        </div>

        <div className="apt-details card">
          <h3>{t('calendar.appointment_details')}</h3>
          {selectedApt ? (
            <div className="details-content flex-col gap-m">
              <div className="detail-item">
                <label>{t('calendar.patient')}</label>
                <div className="detail-value">{selectedApt.patient?.firstName} {selectedApt.patient?.lastName}</div>
              </div>
              <div className="detail-item">
                <label>{t('calendar.time')}</label>
                <div className="detail-value">
                  {new Date(selectedApt.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(selectedApt.endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="detail-item">
                <label>{t('calendar.procedure')}</label>
                <div className="detail-value">{selectedApt.notes || 'Routine Checkup'}</div>
              </div>
              <div className="detail-item">
                <label>{t('calendar.status')}</label>
                <span className={`status-badge ${selectedApt.status.toLowerCase()}`}>
                  {selectedApt.status.toLowerCase()}
                </span>
              </div>
              <button className="action-btn secondary" onClick={() => handleEdit(selectedApt)}>
                {t('calendar.edit_appointment')}
              </button>
            </div>
          ) : (
            <div className="empty-selection">{t('calendar.empty_selection')}</div>
          )}
        </div>
      </aside>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingApt ? t('calendar.edit_appointment') : t('calendar.booking')}
      >
        <AppointmentForm 
          initialData={editingApt}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchAppointments();
          }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default Calendar;
