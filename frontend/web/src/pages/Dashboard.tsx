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
const IconPhone = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMail = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconCake = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>;

// ─── Birthday Widget ─────────────────────────────────────────────────────────

const mockBirthdays = {
  today: [
    { id: '1', name: 'Emma Wilson', age: 42, phone: '+7 999 123-4567', initials: 'EW' },
    { id: '2', name: 'Mark Peterson', age: 35, phone: '+7 985 456-7890', initials: 'MP' },
  ],
  tomorrow: [
    { id: '3', name: 'Sarah Davis', age: 28, phone: '+7 916 234-5678', initials: 'SD' },
  ],
  soon: [
    { id: '4', name: 'Alex Johnson', age: 51, phone: '+7 901 345-6789', initials: 'AJ' },
    { id: '5', name: 'Nina Brown', age: 39, phone: '+7 977 567-8901', initials: 'NB' },
    { id: '6', name: 'Tom White', age: 44, phone: '+7 903 678-9012', initials: 'TW' },
  ],
};

const BirthdayItem: React.FC<{ patient: typeof mockBirthdays.today[0] }> = ({ patient }) => (
  <div className="birthday-item flex items-center">
    <div className="birthday-avatar">{patient.initials}</div>
    <div className="birthday-info flex-1">
      <div className="birthday-name">{patient.name}</div>
      <div className="birthday-meta">{patient.age} years · {patient.phone}</div>
    </div>
    <div className="birthday-actions flex">
      <button className="birthday-action-btn call" title="Call"><IconPhone /></button>
      <button className="birthday-action-btn sms" title="SMS"><IconMail /></button>
    </div>
  </div>
);

const BirthdayWidget: React.FC = () => (
  <div className="birthday-widget card">
    <div className="column-header flex justify-between items-center">
      <h3 className="flex items-center gap-s"><IconCake /> Upcoming Birthdays</h3>
      <a href="#" className="view-all">View All</a>
    </div>

    {mockBirthdays.today.length > 0 && (
      <>
        <div className="birthday-group-label">🎉 Today ({mockBirthdays.today.length})</div>
        {mockBirthdays.today.map(p => <BirthdayItem key={p.id} patient={p} />)}
      </>
    )}
    {mockBirthdays.tomorrow.length > 0 && (
      <>
        <div className="birthday-group-label">📅 Tomorrow ({mockBirthdays.tomorrow.length})</div>
        {mockBirthdays.tomorrow.map(p => <BirthdayItem key={p.id} patient={p} />)}
      </>
    )}
    {mockBirthdays.soon.length > 0 && (
      <>
        <div className="birthday-group-label">📆 In 2–3 days ({mockBirthdays.soon.length})</div>
        {mockBirthdays.soon.slice(0, 2).map(p => <BirthdayItem key={p.id} patient={p} />)}
        {mockBirthdays.soon.length > 2 && (
          <a href="#" className="birthday-show-more">... {mockBirthdays.soon.length - 2} more</a>
        )}
      </>
    )}
  </div>
);

// ─── Weekly Revenue Chart ────────────────────────────────────────────────────

const weekChartData = [
  { day: 'Mon', value: 42000 },
  { day: 'Tue', value: 55000 },
  { day: 'Wed', value: 38000 },
  { day: 'Thu', value: 67000 },
  { day: 'Fri', value: 51000 },
  { day: 'Sat', value: 29000 },
  { day: 'Sun', value: 44000 },
];

const WeeklyChart: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 900;
  const H = 200;
  const pad = { top: 16, bottom: 32, left: 48, right: 24 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const maxVal = Math.max(...weekChartData.map(d => d.value));
  const minVal = Math.min(...weekChartData.map(d => d.value));

  const px = (i: number) => pad.left + (i / (weekChartData.length - 1)) * innerW;
  const py = (v: number) => pad.top + innerH - ((v - minVal) / (maxVal - minVal || 1)) * innerH * 0.9;

  const linePath = weekChartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(d.value)}`).join(' ');
  const areaPath = `${linePath} L ${px(weekChartData.length - 1)} ${H - pad.bottom} L ${px(0)} ${H - pad.bottom} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(t => minVal + t * (maxVal - minVal));

  return (
    <section className="weekly-chart-section card">
      <div className="column-header flex justify-between items-center">
        <h3>Weekly Revenue</h3>
        <select className="chart-filter">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="revenue-chart">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14919B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#14919B" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((v, i) => (
          <g key={i}>
            <line
              x1={pad.left} x2={W - pad.right}
              y1={py(v)} y2={py(v)}
              stroke="#E8E8ED" strokeWidth="1"
            />
            <text x={pad.left - 6} y={py(v) + 4} textAnchor="end" fontSize="10" fill="#5A5A72">
              {(v / 1000).toFixed(0)}k
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#14919B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points + labels */}
        {weekChartData.map((d, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
            <circle cx={px(i)} cy={py(d.value)} r={hovered === i ? 6 : 5} fill="#FF6B6B" stroke="white" strokeWidth="2" />
            <text x={px(i)} y={H - pad.bottom + 18} textAnchor="middle" fontSize="11" fill="#5A5A72" fontWeight="500">
              {d.day}
            </text>
            {hovered === i && (
              <g>
                <rect x={px(i) - 30} y={py(d.value) - 28} width="60" height="22" rx="4" fill="#1A1A2E" />
                <text x={px(i)} y={py(d.value) - 13} textAnchor="middle" fontSize="11" fill="white" fontWeight="600">
                  {(d.value / 1000).toFixed(0)}k ₽
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </section>
  );
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

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
      setStats({
        revenue: `${(data.length * 5200).toLocaleString()}₽`,
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

      {/* Greeting */}
      <section className="greeting-section flex justify-between items-center">
        <div>
          <h1>{t('dashboard.greeting')}</h1>
          <p className="subtext">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} | {t('dashboard.patients_today', { count: appointments.length })}
          </p>
        </div>
        <div className="ai-insight">
          <span className="insight-icon">💡</span>
          <span>{appointments.length > 5 ? t('dashboard.tip_busy') : t('dashboard.tip_light')}</span>
        </div>
      </section>

      {/* Live Timeline */}
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
            <span>08:00</span><span>10:00</span><span>12:00</span>
            <span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span>
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
                  style={{ left: `${left}%`, width: '8%' }}
                  title={`${apt.patient?.firstName} ${apt.patient?.lastName}`}
                >
                  {apt.patient?.lastName}
                </div>
              );
            })}
            {/* NOW marker */}
            <div className="now-marker" style={{ left: `${Math.min(((new Date().getHours() + new Date().getMinutes() / 60) - 8) / 12 * 100, 100)}%` }}>
              <div className="now-line-bar"></div>
              <div className="now-chip">NOW</div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card card">
            <div className={`kpi-icon-bg ${kpi.color}`}>
              <kpi.icon />
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
            {kpi.trend && (
              <div className={`kpi-trend ${kpi.trend.includes('↑') || kpi.trend.includes('-5') ? 'positive' : ''}`}>
                {kpi.trend}
              </div>
            )}
            {kpi.progress !== undefined && (
              <div className="kpi-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${kpi.progress}%` }}></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Main Grid: Appointments + Right Column */}
      <div className="dashboard-grid">

        {/* Appointments List */}
        <section className="appointments-column card">
          <div className="column-header flex justify-between items-center">
            <h3>{t('dashboard.upcoming')}</h3>
            <a href="#" className="view-all">{t('dashboard.view_all')}</a>
          </div>
          <div className="appointment-list">
            {isLoading ? (
              <div className="loading-placeholder">Loading...</div>
            ) : appointments.length === 0 ? (
              <div className="empty-state">{t('dashboard.empty_state')}</div>
            ) : (
              appointments.map(apt => (
                <div key={apt.id} className="appointment-item flex items-center">
                  <div className={`status-strip ${apt.status.toLowerCase().replace('_', '-')}`}></div>
                  <div className="apt-avatar">
                    <div className={`generative-pattern p${(parseInt(apt.id.slice(-1), 16) % 5) + 1}`}></div>
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
                      <span className={`status-badge ${apt.status.toLowerCase().replace('_', '-')}`}>
                        {apt.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column */}
        <section className="actions-column flex-col gap-l">

          {/* Tasks */}
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

          {/* Quick Actions */}
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

          {/* Birthday Widget */}
          <BirthdayWidget />

        </section>
      </div>

      {/* Weekly Revenue Chart */}
      <WeeklyChart />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('dashboard.new_appointment')}
      >
        <AppointmentForm
          onSuccess={() => { setIsModalOpen(false); fetchData(); }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
