import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import AppointmentForm from '../components/AppointmentForm';
import './Dashboard.css';

const IconTrendingUp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const IconClock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    revenue: "0₽",
    patients: "0",
    completion: "0/0",
    avgTime: "0 min"
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const data = await api.get('/appointments', {
        start: today.toISOString(),
        end: tomorrow.toISOString()
      });
      
      setAppointments(data);
      
      // Calculate mock stats based on real data
      setStats({
        revenue: `${data.length * 5200}₽`,
        patients: data.length.toString(),
        completion: `${data.filter((a: any) => a.status === 'COMPLETED').length}/${data.length}`,
        avgTime: "45 min"
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpis = [
    { label: t('dashboard.revenue'), value: stats.revenue, trend: "+8.2% ↑", icon: IconTrendingUp, color: 'seafoam' },
    { label: t('dashboard.total_patients'), value: stats.patients, trend: "+2 vs yesterday", icon: IconUsers, color: 'coral' },
    { label: t('dashboard.appointments'), value: stats.completion, progress: 66, icon: IconCalendar, color: 'teal' },
    { label: t('dashboard.avg_time'), value: stats.avgTime, trend: "-5 min", icon: IconClock, color: 'saffron' },
  ];

  return (
    <div className="dashboard-container">
      <section className="greeting-section flex justify-between items-center">
        <div>
          <h1>{t('dashboard.greeting')}</h1>
          <p className="subtext">
            {new Date().toLocaleDateString(t('i18n.locale') === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })} | {t('dashboard.patients_today', { count: appointments.length })}
          </p>
        </div>
        <div className="ai-insight">
          <span className="insight-icon">💡</span>
          <span>Tip: {appointments.length > 5 ? t('dashboard.tip_busy') : t('dashboard.tip_light')}</span>
        </div>
      </section>

      <section className="timeline-section card">
        <div className="timeline-header flex justify-between">
          <h3>{t('dashboard.live_timeline')}</h3>
          <div className="now-indicator">
            <span className="pulse"></span>
            {t('dashboard.now')}
          </div>
        </div>
        <div className="timeline-visual">
          <div className="time-labels">
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
          </div>
          <div className="timeline-bar">
            {appointments.map((apt) => {
              const start = new Date(apt.startTime);
              const hour = start.getHours() + start.getMinutes() / 60;
              const left = ((hour - 8) / 12) * 100;
              if (left < 0 || left > 100) return null;
              return (
                <div 
                  key={apt.id} 
                  className={`apt-block ${apt.status.toLowerCase()}`} 
                  style={{left: `${left}%`, width: '10%'}}
                >
                  {apt.patient?.lastName}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card card">
            <div className={`kpi-icon-bg ${kpi.color}`}>
              <kpi.icon />
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
            {kpi.trend && <div className={`kpi-trend ${kpi.trend.includes('↑') || kpi.trend.includes('min') ? 'positive' : ''}`}>{kpi.trend}</div>}
            {kpi.progress !== undefined && (
              <div className="kpi-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${kpi.progress}%`}}></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      <div className="dashboard-grid">
        <section className="appointments-column card">
          <div className="column-header flex justify-between items-center">
            <h3>{t('dashboard.upcoming')}</h3>
            <a href="#" className="view-all">{t('dashboard.view_all')}</a>
          </div>
          <div className="appointment-list">
            {isLoading ? (
              <div className="loading-placeholder">Loading...</div>
            ) : (
              appointments.map(apt => (
                <div key={apt.id} className="appointment-item flex items-center">
                  <div className={`status-strip ${apt.status.toLowerCase()}`}></div>
                  <div className="apt-avatar">
                    <div className={`generative-pattern p${apt.id.slice(-1)}`}></div>
                  </div>
                  <div className="apt-info">
                    <div className="apt-top flex justify-between">
                      <span className="patient-name">{apt.patient?.firstName} {apt.patient?.lastName}</span>
                      <span className="apt-time">
                        {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="apt-bottom flex justify-between">
                      <span className="procedure-name">{apt.notes || 'Routine Checkup'}</span>
                      <span className={`status-badge ${apt.status.toLowerCase()}`}>{apt.status.toLowerCase().replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {!isLoading && appointments.length === 0 && (
              <div className="empty-state">{t('dashboard.empty_state')}</div>
            )}
          </div>
        </section>

        <section className="actions-column flex-col gap-l">
          <div className="tasks-card card">
            <div className="column-header flex justify-between items-center">
              <h3>{t('dashboard.tasks_today')}</h3>
              <span className="task-badge">3</span>
            </div>
            <div className="task-list flex-col gap-m">
              <label className="task-item flex items-center gap-s">
                <input type="checkbox" />
                <span>Call patient about appointment</span>
              </label>
              <label className="task-item flex items-center gap-s checked">
                <input type="checkbox" defaultChecked />
                <span>Review lab results</span>
              </label>
              <label className="task-item flex items-center gap-s">
                <input type="checkbox" />
                <span>Update patient records</span>
              </label>
            </div>
            <button className="add-task-btn">+ {t('nav.tasks')}</button>
          </div>

          <div className="quick-actions-card card">
            <h3>{t('dashboard.quick_actions')}</h3>
            <div className="actions-stack flex-col gap-m">
              <button className="action-btn primary" onClick={() => setIsModalOpen(true)}>
                <IconPlus />
                {t('dashboard.new_appointment')}
              </button>
              <button className="action-btn secondary">
                <IconUsers />
                {t('dashboard.add_patient')}
              </button>
            </div>
          </div>
        </section>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={t('dashboard.new_appointment')}
      >
        <AppointmentForm 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
