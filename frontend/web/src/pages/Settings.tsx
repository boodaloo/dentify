import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import './Settings.css';

const SLOT_MIN_KEY = 'calendarSlotMin';

// Mon=0 … Sun=6  (same convention as branchController seed)
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 23; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2,'0')}:00`);
  if (h < 23) TIME_OPTIONS.push(`${String(h).padStart(2,'0')}:30`);
}

type WorkingHour = { dayOfWeek: number; isOpen: boolean; startTime: string; endTime: string };

const defaultHours = (): WorkingHour[] =>
  Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    isOpen:    i < 5,
    startTime: '09:00',
    endTime:   '21:00',
  }));

const IconUser     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconGlobe    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconBell     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const IconLock     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [slotMin, setSlotMin] = useState(() => parseInt(localStorage.getItem(SLOT_MIN_KEY) || '15', 10));
  const [branchId, setBranchId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(defaultHours());
  const [isHoursSaving, setIsHoursSaving] = useState(false);
  const [hoursSaveStatus, setHoursSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Rooms state
  const [rooms, setRooms]           = useState<any[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [roomError, setRoomError]   = useState('');

  const [clinicData, setClinicData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    api.get('/branches').then((res: any) => {
      const branches: any[] = Array.isArray(res) ? res : (res?.data ?? []);
      const main = branches.find(b => b.isMain) ?? branches[0];
      if (main) {
        setBranchId(main.id);
        setClinicData({
          name:    main.name    ?? '',
          address: main.address ?? '',
          phone:   main.phone   ?? '',
          email:   main.email   ?? '',
          website: '',
        });
        loadRooms(main.id);
        // Merge API hours with defaults to ensure all 7 days present
        if (main.workingHours?.length) {
          const merged = defaultHours().map(def => {
            const saved = main.workingHours.find((h: WorkingHour) => h.dayOfWeek === def.dayOfWeek);
            return saved ? { ...def, ...saved } : def;
          });
          setWorkingHours(merged);
        }
      }
    }).catch(() => {});
  }, []);

  const loadRooms = (bid: string) => {
    api.get(`/branches/${bid}/rooms`).then((res: any) => {
      const items = res?.data?.items ?? res?.data ?? res ?? [];
      setRooms(Array.isArray(items) ? items : []);
    }).catch(() => {});
  };

  const handleAddRoom = async () => {
    if (!branchId || !newRoomName.trim()) return;
    setIsAddingRoom(true);
    setRoomError('');
    try {
      await api.post(`/branches/${branchId}/rooms`, { name: newRoomName.trim() });
      setNewRoomName('');
      loadRooms(branchId);
    } catch {
      setRoomError('Failed to add room');
    } finally {
      setIsAddingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!branchId || !window.confirm('Delete this room?')) return;
    try {
      await api.put(`/branches/${branchId}/rooms/${roomId}`, { isActive: false });
      loadRooms(branchId);
    } catch {
      setRoomError('Failed to delete room');
    }
  };

  const handleSave = async () => {
    if (!branchId) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await api.put(`/branches/${branchId}`, {
        name:    clinicData.name,
        address: clinicData.address,
        phone:   clinicData.phone,
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateHour = (dayOfWeek: number, field: keyof WorkingHour, value: any) => {
    setWorkingHours(prev => prev.map(h =>
      h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
    ));
  };

  const handleSaveHours = async () => {
    if (!branchId) return;
    setIsHoursSaving(true);
    setHoursSaveStatus('idle');
    try {
      await api.put(`/branches/${branchId}/working-hours`, { hours: workingHours });
      setHoursSaveStatus('success');
      setTimeout(() => setHoursSaveStatus('idle'), 3000);
    } catch {
      setHoursSaveStatus('error');
    } finally {
      setIsHoursSaving(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1>{t('nav.settings')}</h1>
        <p className="subtext">{t('settings.subtitle')}</p>
      </header>

      <div className="settings-container flex gap-xl">
        <aside className="settings-sidebar card">
          <button
            className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <IconUser />
            <span>{t('settings.profile')}</span>
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'localization' ? 'active' : ''}`}
            onClick={() => setActiveTab('localization')}
          >
            <IconGlobe />
            <span>{t('settings.localization')}</span>
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <IconBell />
            <span>{t('settings.notifications')}</span>
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <IconLock />
            <span>{t('settings.security')}</span>
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <IconCalendar />
            <span>Calendar</span>
          </button>
        </aside>

        <main className="settings-content card flex-1">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h3>{t('settings.profile_title')}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('settings.clinic_name')}</label>
                  <input type="text" value={clinicData.name} onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('settings.address')}</label>
                  <input type="text" value={clinicData.address} onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('settings.phone')}</label>
                  <input type="text" value={clinicData.phone} onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('settings.email')}</label>
                  <input type="email" value={clinicData.email} onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })} />
                </div>
              </div>
              {saveStatus === 'success' && (
                <div style={{ color: 'var(--color-teal-500)', fontSize: '13px', marginBottom: '12px' }}>
                  ✓ Changes saved successfully
                </div>
              )}
              {saveStatus === 'error' && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
                  Failed to save changes
                </div>
              )}
              <button className="primary mt-l" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : t('settings.save_changes')}
              </button>
            </div>
          )}

          {activeTab === 'localization' && (
            <div className="settings-section">
              <h3>{t('settings.localization_title')}</h3>
              <div className="lang-options flex-col gap-m mt-m">
                <div
                  className={`lang-card flex items-center justify-between ${i18n.language.startsWith('en') ? 'selected' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  <div className="flex items-center gap-m">
                    <span className="flag-icon">🇺🇸</span>
                    <div className="lang-info">
                      <div className="lang-name">English</div>
                      <div className="lang-native">Default System Language</div>
                    </div>
                  </div>
                  {i18n.language.startsWith('en') && <div className="check-mark">✓</div>}
                </div>
                <div
                  className={`lang-card flex items-center justify-between ${i18n.language.startsWith('ru') ? 'selected' : ''}`}
                  onClick={() => handleLanguageChange('ru')}
                >
                  <div className="flex items-center gap-m">
                    <span className="flag-icon">🇷🇺</span>
                    <div className="lang-info">
                      <div className="lang-name">Русский</div>
                      <div className="lang-native">Russian Localization</div>
                    </div>
                  </div>
                  {i18n.language.startsWith('ru') && <div className="check-mark">✓</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>{t('settings.notifications_title')}</h3>
              <p className="placeholder-text">Notification preferences will appear here.</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h3>{t('settings.security_title')}</h3>
              <p className="placeholder-text">Security and password settings will appear here.</p>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="settings-section">
              <h3>Calendar Settings</h3>
              <p className="settings-description">Configure how the appointment calendar behaves.</p>

              {/* Slot interval */}
              <div className="settings-field-group mt-l">
                <div className="settings-field-label">Minimum appointment slot</div>
                <div className="settings-field-desc">Controls the time intervals shown when booking appointments.</div>
                <div className="slot-options mt-m">
                  {[5, 10, 15, 30, 60].map(min => (
                    <button
                      key={min}
                      className={`slot-option-btn ${slotMin === min ? 'active' : ''}`}
                      onClick={() => { setSlotMin(min); localStorage.setItem(SLOT_MIN_KEY, String(min)); }}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
                <div className="slot-preview mt-m">
                  Preview: 09:00
                  {Array.from({ length: 4 }, (_, i) => {
                    const totalMin = 9 * 60 + (i + 1) * slotMin;
                    const h = Math.floor(totalMin / 60);
                    const m = totalMin % 60;
                    return ` → ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                  }).join('')} …
                </div>
              </div>

              {/* Working Hours */}
              <div className="settings-field-group mt-xl">
                <div className="settings-field-label">Working Hours</div>
                <div className="settings-field-desc">Set clinic operating hours. The calendar will display only this time range.</div>

                <div className="wh-grid mt-m">
                  {workingHours.map(day => (
                    <div key={day.dayOfWeek} className={`wh-row ${!day.isOpen ? 'closed' : ''}`}>
                      <div className="wh-day-name">
                        <span className="wh-day-short">{DAY_SHORT[day.dayOfWeek]}</span>
                        <span className="wh-day-full">{DAY_NAMES[day.dayOfWeek]}</span>
                      </div>

                      <label className="wh-toggle">
                        <input
                          type="checkbox"
                          checked={day.isOpen}
                          onChange={e => updateHour(day.dayOfWeek, 'isOpen', e.target.checked)}
                        />
                        <span className="wh-toggle-track" />
                        <span className="wh-toggle-label">{day.isOpen ? 'Open' : 'Closed'}</span>
                      </label>

                      {day.isOpen ? (
                        <div className="wh-times">
                          <select
                            className="wh-time-select"
                            value={day.startTime}
                            onChange={e => updateHour(day.dayOfWeek, 'startTime', e.target.value)}
                          >
                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span className="wh-dash">—</span>
                          <select
                            className="wh-time-select"
                            value={day.endTime}
                            onChange={e => updateHour(day.dayOfWeek, 'endTime', e.target.value)}
                          >
                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="wh-closed-label">Day off</div>
                      )}
                    </div>
                  ))}
                </div>

                {hoursSaveStatus === 'success' && (
                  <div className="wh-status success mt-m">✓ Working hours saved</div>
                )}
                {hoursSaveStatus === 'error' && (
                  <div className="wh-status error mt-m">Failed to save. Please try again.</div>
                )}

                <button
                  className="slot-option-btn active mt-m"
                  onClick={handleSaveHours}
                  disabled={isHoursSaving || !branchId}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {isHoursSaving ? 'Saving…' : 'Save working hours'}
                </button>
              </div>

              {/* Rooms & Chairs */}
              <div className="settings-field-group mt-xl">
                <div className="settings-field-label">Rooms &amp; Chairs</div>
                <div className="settings-field-desc">Manage treatment rooms available for appointment booking.</div>

                {roomError && (
                  <div style={{ color: '#fca5a5', fontSize: '13px', marginTop: '8px' }}>{roomError}</div>
                )}

                <div className="rooms-list mt-m">
                  {rooms.length === 0 && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '8px 0' }}>
                      No rooms added yet. Add a room to enable room selection when booking.
                    </div>
                  )}
                  {rooms.map((room: any) => (
                    <div key={room.id} className="room-item">
                      <span className="room-item-name">{room.name || `Room ${room.number ?? room.id}`}</span>
                      <button
                        className="room-item-delete"
                        onClick={() => handleDeleteRoom(room.id)}
                        title="Delete room"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="room-add-row mt-m">
                  <input
                    type="text"
                    className="room-add-input"
                    placeholder="Room name (e.g. Room 1, Chair A…)"
                    value={newRoomName}
                    onChange={e => setNewRoomName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddRoom()}
                  />
                  <button
                    className="slot-option-btn active"
                    onClick={handleAddRoom}
                    disabled={isAddingRoom || !newRoomName.trim()}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {isAddingRoom ? 'Adding…' : '+ Add room'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
