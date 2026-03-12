import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from 'boring-avatars';
import { api } from '../services/api';
import PhoneInput from '../components/PhoneInput';
import { getPhoneMask, setPhoneMaskPref, formatPhone, maskToPlaceholder, PHONE_MASK_PRESETS, PHONE_MASK_KEY } from '../utils/phoneMask';
import './Settings.css';

const getCurrentUser = (): any => {
  try { return JSON.parse(localStorage.getItem('orisios_user') || '{}'); }
  catch { return {}; }
};
const canManageStaff = (): boolean => {
  const u = getCurrentUser();
  return u.isOwner === true || u.role === 'OWNER' || u.role === 'ADMIN';
};

const STAFF_ROLES = ['DOCTOR', 'ADMIN', 'RECEPTIONIST', 'ASSISTANT', 'NURSE'];
const ROLE_COLOR: Record<string, string> = {
  OWNER:        '#7C3AED',
  ADMIN:        '#2563EB',
  DOCTOR:       '#0D9488',
  RECEPTIONIST: '#D97706',
  ASSISTANT:    '#6B7280',
  NURSE:        '#EC4899',
};

const SLOT_MIN_KEY  = 'calendarSlotMin';
const GRID_MIN_KEY  = 'calendarGridMin';

// Mon=0 … Sun=6  (same convention as branchController seed)
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 23; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2,'0')}:00`);
  if (h < 23) TIME_OPTIONS.push(`${String(h).padStart(2,'0')}:30`);
}

type WorkingHour    = { dayOfWeek: number; isOpen: boolean; startTime: string; endTime: string };
type DoctorSchedRow = { dayOfWeek: number; isWorking: boolean; startTime: string; endTime: string };

const defaultDoctorSchedule = (): DoctorSchedRow[] =>
  Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    isWorking: i < 5,
    startTime: '09:00',
    endTime:   '18:00',
  }));

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
const IconStaff    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [slotMin,  setSlotMin]  = useState(() => parseInt(localStorage.getItem(SLOT_MIN_KEY) || '15', 10));
  const [gridMin,  setGridMin]  = useState(() => parseInt(localStorage.getItem(GRID_MIN_KEY) || '60', 10));
  const [colorMode, setColorMode] = useState<'status' | 'doctor'>(() =>
    (localStorage.getItem('calendarColorMode') as 'status' | 'doctor') || 'status'
  );
  const [phoneMask, setPhoneMask] = useState(getPhoneMask);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(defaultHours());
  const [isHoursSaving, setIsHoursSaving] = useState(false);
  const [hoursSaveStatus, setHoursSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Staff management state (OWNER/ADMIN only)
  const [allStaff, setAllStaff]             = useState<any[]>([]);
  const [staffMgmtLoading, setStaffMgmtLoading] = useState(false);
  const [showAddStaff, setShowAddStaff]     = useState(false);
  const [addForm, setAddForm]               = useState({ email: '', password: '', name: '', phone: '', title: '', role: 'DOCTOR' });
  const [addError, setAddError]             = useState('');
  const [addSaving, setAddSaving]           = useState(false);
  const [editingStaff, setEditingStaff]     = useState<{ id: string; role: string; isActive: boolean } | null>(null);
  const [editSaving, setEditSaving]         = useState(false);

  // Doctor schedules state
  const [staffList, setStaffList]         = useState<any[]>([]);
  const [selDoctorId, setSelDoctorId]     = useState('');
  const [doctorSched, setDoctorSched]     = useState<DoctorSchedRow[]>(defaultDoctorSchedule());
  const [docSchedLoading, setDocSchedLoading] = useState(false);
  const [docSchedSaving, setDocSchedSaving]   = useState(false);
  const [docSchedStatus, setDocSchedStatus]   = useState<'idle'|'success'|'error'>('idle');

  // Exception state
  const [excDate, setExcDate] = useState('');
  const [excType, setExcType] = useState('DAY_OFF');
  const [excStartTime, setExcStartTime] = useState('');
  const [excEndTime, setExcEndTime] = useState('');
  const [excSaving, setExcSaving] = useState(false);
  const [excError, setExcError] = useState('');
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [excLoading, setExcLoading] = useState(false);

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

  // Load staff list once
  useEffect(() => {
    api.get('/staff', { role: 'DOCTOR', limit: '100' }).then((res: any) => {
      const items = Array.isArray(res) ? res : (res?.data?.items ?? res?.data ?? []);
      setStaffList(Array.isArray(items) ? items : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selDoctorId) loadExceptions(selDoctorId);
  }, [selDoctorId]);

  // Load doctor schedule when doctor selection or branchId changes
  useEffect(() => {
    if (!selDoctorId || !branchId) return;
    setDocSchedLoading(true);
    api.get(`/staff/${selDoctorId}/schedule`, { branchId }).then((res: any) => {
      const rows: any[] = Array.isArray(res) ? res : (res?.data ?? []);
      // Merge API rows with defaults to ensure all 7 days present
      const merged = defaultDoctorSchedule().map(def => {
        const saved = rows.find((r: any) => r.dayOfWeek === def.dayOfWeek);
        return saved ? { dayOfWeek: saved.dayOfWeek, isWorking: saved.isWorking, startTime: saved.startTime, endTime: saved.endTime } : def;
      });
      setDoctorSched(merged);
    }).catch(() => {
      setDoctorSched(defaultDoctorSchedule());
    }).finally(() => setDocSchedLoading(false));
  }, [selDoctorId, branchId]);

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

  // ── Staff management ──────────────────────────────────────────────────────

  const loadAllStaff = () => {
    setStaffMgmtLoading(true);
    api.get('/staff', { limit: '200' }).then((res: any) => {
      const items = Array.isArray(res) ? res : (res?.data?.items ?? res?.data ?? []);
      setAllStaff(Array.isArray(items) ? items : []);
    }).catch(() => {}).finally(() => setStaffMgmtLoading(false));
  };

  const handleAddStaff = async () => {
    if (!addForm.email.trim() || !addForm.password.trim() || !addForm.name.trim()) {
      setAddError('Email, password and name are required');
      return;
    }
    setAddSaving(true);
    setAddError('');
    try {
      await api.post('/staff', {
        email:    addForm.email.trim(),
        password: addForm.password.trim(),
        name:     addForm.name.trim(),
        phone:    addForm.phone.trim() || undefined,
        title:    addForm.title.trim() || undefined,
        role:     addForm.role,
        branchIds: branchId ? [branchId] : [],
      });
      setShowAddStaff(false);
      setAddForm({ email: '', password: '', name: '', phone: '', title: '', role: 'DOCTOR' });
      loadAllStaff();
    } catch (e: any) {
      setAddError(e?.message || 'Failed to add staff member');
    } finally {
      setAddSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingStaff) return;
    setEditSaving(true);
    try {
      await api.put(`/staff/${editingStaff.id}`, { role: editingStaff.role, isActive: editingStaff.isActive });
      setEditingStaff(null);
      loadAllStaff();
    } catch {}
    finally { setEditSaving(false); }
  };

  const handleDeactivate = async (userId: string, name: string) => {
    if (!window.confirm(`Deactivate ${name}? They will lose access to the system.`)) return;
    try {
      await api.delete(`/staff/${userId}`);
      loadAllStaff();
    } catch {}
  };

  const updateDocSched = (dayOfWeek: number, field: keyof DoctorSchedRow, value: any) => {
    setDoctorSched(prev => prev.map(d => d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d));
  };

  const handleSaveDoctorSchedule = async () => {
    if (!selDoctorId || !branchId) return;
    setDocSchedSaving(true);
    setDocSchedStatus('idle');
    try {
      await api.put(`/staff/${selDoctorId}/schedule`, {
        branchId,
        days: doctorSched.map(d => ({
          dayOfWeek: d.dayOfWeek,
          startTime: d.startTime,
          endTime:   d.endTime,
          isWorking: d.isWorking,
        })),
      });
      setDocSchedStatus('success');
      setTimeout(() => setDocSchedStatus('idle'), 3000);
    } catch {
      setDocSchedStatus('error');
    } finally {
      setDocSchedSaving(false);
    }
  };

  const loadExceptions = async (doctorId: string) => {
    if (!doctorId) return;
    setExcLoading(true);
    try {
      const today = new Date();
      const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const to = new Date(today.getFullYear(), today.getMonth() + 3, 0).toISOString().split('T')[0];
      const data: any = await api.get(`/staff/${doctorId}/schedule/exceptions`, { from, to });
      const items = Array.isArray(data) ? data : (data?.data ?? []);
      setExceptions(items);
    } catch { setExceptions([]); } finally { setExcLoading(false); }
  };

  const handleSaveException = async () => {
    if (!selDoctorId || !excDate) { setExcError('Select doctor and date'); return; }
    setExcSaving(true); setExcError('');
    try {
      await api.post(`/staff/${selDoctorId}/schedule/exceptions`, {
        date: excDate,
        type: excType,
        isAvailable: excType === 'CUSTOM_HOURS',
        startTime: excType === 'CUSTOM_HOURS' ? excStartTime || null : null,
        endTime:   excType === 'CUSTOM_HOURS' ? excEndTime   || null : null,
      });
      setExcDate(''); setExcType('DAY_OFF'); setExcStartTime(''); setExcEndTime('');
      await loadExceptions(selDoctorId);
    } catch (e: any) { setExcError(e.message || 'Failed to save'); } finally { setExcSaving(false); }
  };

  const handleDeleteException = async (excId: string) => {
    if (!selDoctorId) return;
    try {
      await api.delete(`/staff/${selDoctorId}/schedule/exceptions/${excId}`);
      await loadExceptions(selDoctorId);
    } catch {}
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
          <button
            className={`settings-nav-item ${activeTab === 'staff-schedules' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff-schedules')}
          >
            <IconStaff />
            <span>Staff Schedules</span>
          </button>
          {canManageStaff() && (
            <button
              className={`settings-nav-item ${activeTab === 'staff-management' ? 'active' : ''}`}
              onClick={() => { setActiveTab('staff-management'); loadAllStaff(); }}
            >
              <IconUser />
              <span>Staff</span>
            </button>
          )}
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
                  <PhoneInput
                    value={clinicData.phone}
                    onChange={e => setClinicData({ ...clinicData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('settings.email')}</label>
                  <input type="email" value={clinicData.email} onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })} />
                </div>
              </div>
              {/* Phone mask */}
              <div className="settings-field-group mt-xl">
                <div className="settings-field-label">Phone number format</div>
                <div className="settings-field-desc">
                  Choose how phone numbers are entered and displayed. Use <code style={{ fontFamily: 'monospace', background: 'var(--bg-off-white)', padding: '1px 5px', borderRadius: '4px' }}>X</code> as digit placeholder.
                </div>
                <div className="slot-options mt-m" style={{ flexWrap: 'wrap' }}>
                  {PHONE_MASK_PRESETS.map(p => (
                    <button
                      key={p.mask}
                      className={`slot-option-btn ${phoneMask === p.mask ? 'active' : ''}`}
                      onClick={() => { setPhoneMask(p.mask); setPhoneMaskPref(p.mask); }}
                      title={p.mask}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="phone-mask-custom mt-m">
                  <input
                    type="text"
                    className="room-add-input"
                    value={phoneMask}
                    onChange={e => { setPhoneMask(e.target.value); setPhoneMaskPref(e.target.value); }}
                    placeholder="e.g. 7(XXX)XXX-XX-XX"
                    style={{ maxWidth: '200px' }}
                  />
                  <span className="phone-mask-preview">
                    {formatPhone('9161234567', phoneMask) || maskToPlaceholder(phoneMask)}
                  </span>
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

              {/* Grid divisions */}
              <div className="settings-field-group mt-xl">
                <div className="settings-field-label">Calendar grid divisions</div>
                <div className="settings-field-desc">Sets how the time grid is divided in day and week views.</div>
                <div className="slot-options mt-m">
                  {[{ val: 60, label: '1 hour' }, { val: 30, label: '30 min' }, { val: 15, label: '15 min' }].map(({ val, label }) => (
                    <button
                      key={val}
                      className={`slot-option-btn ${gridMin === val ? 'active' : ''}`}
                      onClick={() => { setGridMin(val); localStorage.setItem(GRID_MIN_KEY, String(val)); }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="grid-preview mt-m">
                  {Array.from({ length: 60 / gridMin }, (_, i) => (
                    <div key={i} className={`grid-preview-row ${i === 0 ? 'hour' : 'sub'}`}>
                      {i === 0 ? '09:00' : `09:${String(i * gridMin).padStart(2, '0')}`}
                    </div>
                  ))}
                  <div className="grid-preview-row hour">10:00</div>
                </div>
              </div>

              {/* Color mode */}
              <div className="settings-field-group mt-xl">
                <div className="settings-field-label">Appointment color mode</div>
                <div className="settings-field-desc">Choose what determines the color of appointment blocks.</div>
                <div className="color-mode-options mt-m">
                  {[
                    { val: 'status', label: 'By Status', desc: 'Each status has its own color (Confirmed, Scheduled, etc.)' },
                    { val: 'doctor', label: 'By Doctor', desc: 'Each doctor gets a unique color across all appointments' },
                  ].map(opt => (
                    <div
                      key={opt.val}
                      className={`color-mode-card ${colorMode === opt.val ? 'active' : ''}`}
                      onClick={() => { setColorMode(opt.val as 'status' | 'doctor'); localStorage.setItem('calendarColorMode', opt.val); }}
                    >
                      <div className="color-mode-radio">{colorMode === opt.val ? '●' : '○'}</div>
                      <div>
                        <div className="color-mode-label">{opt.label}</div>
                        <div className="color-mode-desc">{opt.desc}</div>
                      </div>
                    </div>
                  ))}
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
          {activeTab === 'staff-management' && canManageStaff() && (
            <div className="settings-section">
              <div className="staff-mgmt-header">
                <div>
                  <h3>Staff Management</h3>
                  <p className="settings-description">Add, edit and deactivate clinic staff. Only owners and administrators can manage staff.</p>
                </div>
                <button
                  className="slot-option-btn active"
                  style={{ whiteSpace: 'nowrap', alignSelf: 'flex-start' }}
                  onClick={() => { setShowAddStaff(p => !p); setAddError(''); }}
                >
                  {showAddStaff ? '✕ Cancel' : '+ Add Staff'}
                </button>
              </div>

              {/* Add staff form */}
              {showAddStaff && (
                <div className="staff-add-form mt-l">
                  <div className="staff-add-title">New Staff Member</div>
                  {addError && <div className="staff-add-error">{addError}</div>}
                  <div className="staff-add-grid">
                    <div className="staff-add-field">
                      <label>Full name <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="text"
                        placeholder="Dr. Ivan Ivanov"
                        value={addForm.name}
                        onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="staff-add-field">
                      <label>Role <span style={{ color: '#ef4444' }}>*</span></label>
                      <select
                        value={addForm.role}
                        onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                      >
                        {STAFF_ROLES.map(r => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
                      </select>
                    </div>
                    <div className="staff-add-field">
                      <label>Email <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="email"
                        placeholder="doctor@clinic.com"
                        value={addForm.email}
                        onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div className="staff-add-field">
                      <label>Password <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="password"
                        placeholder="Temporary password"
                        value={addForm.password}
                        onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))}
                      />
                    </div>
                    <div className="staff-add-field">
                      <label>Phone</label>
                      <PhoneInput
                        value={addForm.phone}
                        onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                    <div className="staff-add-field">
                      <label>Title / Specialization</label>
                      <input
                        type="text"
                        placeholder="Orthodontist, Surgeon…"
                        value={addForm.title}
                        onChange={e => setAddForm(p => ({ ...p, title: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button
                    className="slot-option-btn active mt-m"
                    onClick={handleAddStaff}
                    disabled={addSaving}
                  >
                    {addSaving ? 'Adding…' : 'Add staff member'}
                  </button>
                </div>
              )}

              {/* Staff list */}
              <div className="staff-list mt-l">
                {staffMgmtLoading && (
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '8px 0' }}>Loading staff…</div>
                )}
                {!staffMgmtLoading && allStaff.length === 0 && (
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '8px 0' }}>No staff members found.</div>
                )}
                {allStaff.map((member: any) => {
                  const userId   = member.userId || member.id;
                  const name     = member.user?.name || member.name || 'Unknown';
                  const email    = member.user?.email || member.email || '';
                  const phone    = member.user?.phone || member.phone || '';
                  const title    = member.user?.title || member.title || '';
                  const role     = member.role || 'STAFF';
                  const isActive = member.isActive !== false;
                  const isEditing = editingStaff?.id === userId;
                  const currentUserId = getCurrentUser().id;
                  const isSelf = userId === currentUserId;

                  return (
                    <div key={userId} className={`staff-item ${!isActive ? 'inactive' : ''}`}>
                      <div className="staff-item-avatar">
                        <Avatar size={40} name={name} variant="beam" colors={['#0D7377','#14919B','#45B7A0','#F2CC8F','#FF6B6B']} />
                      </div>

                      <div className="staff-item-info">
                        <div className="staff-item-name">
                          {name}
                          {isSelf && <span className="staff-item-self-badge">You</span>}
                        </div>
                        <div className="staff-item-meta">
                          {email && <span>{email}</span>}
                          {phone && <span>· {phone}</span>}
                          {title && <span>· {title}</span>}
                        </div>
                      </div>

                      <div className="staff-item-right">
                        {isEditing ? (
                          <div className="staff-edit-row">
                            <select
                              className="wh-time-select"
                              value={editingStaff.role}
                              onChange={e => setEditingStaff(p => p ? { ...p, role: e.target.value } : p)}
                            >
                              {STAFF_ROLES.map(r => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
                            </select>
                            <label className="wh-toggle" style={{ gap: '6px' }}>
                              <input
                                type="checkbox"
                                checked={editingStaff.isActive}
                                onChange={e => setEditingStaff(p => p ? { ...p, isActive: e.target.checked } : p)}
                              />
                              <span className="wh-toggle-track" />
                              <span className="wh-toggle-label" style={{ width: 'auto', fontSize: '12px' }}>
                                {editingStaff.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </label>
                            <button className="staff-action-btn save" onClick={handleSaveEdit} disabled={editSaving}>
                              {editSaving ? '…' : '✓'}
                            </button>
                            <button className="staff-action-btn" onClick={() => setEditingStaff(null)}>✕</button>
                          </div>
                        ) : (
                          <div className="staff-item-badges">
                            <span
                              className="staff-role-badge"
                              style={{ background: (ROLE_COLOR[role] ?? '#6B7280') + '18', color: ROLE_COLOR[role] ?? '#6B7280', borderColor: (ROLE_COLOR[role] ?? '#6B7280') + '40' }}
                            >
                              {role.charAt(0) + role.slice(1).toLowerCase()}
                            </span>
                            {!isActive && <span className="staff-inactive-badge">Inactive</span>}
                          </div>
                        )}

                        {!isEditing && !isSelf && (
                          <div className="staff-item-actions">
                            <button
                              className="staff-action-btn"
                              title="Edit role"
                              onClick={() => setEditingStaff({ id: userId, role, isActive })}
                            >
                              ✏️
                            </button>
                            {isActive && (
                              <button
                                className="staff-action-btn danger"
                                title="Deactivate"
                                onClick={() => handleDeactivate(userId, name)}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'staff-schedules' && (
            <div className="settings-section">
              <h3>Staff Schedules</h3>
              <p className="settings-description">
                Set each doctor's weekly working hours. This controls appointment availability
                and is used by the booking widget and external integrations.
                If a doctor has no schedule set, one will be created automatically when their first appointment is booked.
              </p>

              {/* Doctor selector */}
              <div className="settings-field-group mt-l">
                <div className="settings-field-label">Doctor</div>
                <div className="settings-field-desc">Select a staff member to view and edit their schedule.</div>
                <select
                  className="wh-time-select mt-m"
                  style={{ width: '100%', maxWidth: '320px', height: '38px' }}
                  value={selDoctorId}
                  onChange={e => { setSelDoctorId(e.target.value); setDocSchedStatus('idle'); }}
                >
                  <option value="">— Choose a doctor —</option>
                  {staffList.map((d: any) => (
                    <option key={d.userId || d.id} value={d.userId || d.id}>
                      {d.user?.name || d.name || `Staff ${d.userId}`}
                      {d.role ? ` (${d.role.toLowerCase()})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weekly schedule grid */}
              {selDoctorId && (
                <div className="settings-field-group mt-xl">
                  <div className="settings-field-label">Weekly Schedule</div>
                  <div className="settings-field-desc">Toggle each day and set working hours. Days marked closed won't be available for booking.</div>

                  {docSchedLoading ? (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px' }}>Loading schedule…</div>
                  ) : (
                    <div className="wh-grid mt-m">
                      {doctorSched.map(day => (
                        <div key={day.dayOfWeek} className={`wh-row ${!day.isWorking ? 'closed' : ''}`}>
                          <div className="wh-day-name">
                            <span className="wh-day-short">{DAY_SHORT[day.dayOfWeek]}</span>
                            <span className="wh-day-full">{DAY_NAMES[day.dayOfWeek]}</span>
                          </div>

                          <label className="wh-toggle">
                            <input
                              type="checkbox"
                              checked={day.isWorking}
                              onChange={e => updateDocSched(day.dayOfWeek, 'isWorking', e.target.checked)}
                            />
                            <span className="wh-toggle-track" />
                            <span className="wh-toggle-label">{day.isWorking ? 'Works' : 'Day off'}</span>
                          </label>

                          {day.isWorking ? (
                            <div className="wh-times">
                              <select
                                className="wh-time-select"
                                value={day.startTime}
                                onChange={e => updateDocSched(day.dayOfWeek, 'startTime', e.target.value)}
                              >
                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <span className="wh-dash">—</span>
                              <select
                                className="wh-time-select"
                                value={day.endTime}
                                onChange={e => updateDocSched(day.dayOfWeek, 'endTime', e.target.value)}
                              >
                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          ) : (
                            <div className="wh-closed-label">Not working</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {docSchedStatus === 'success' && (
                    <div className="wh-status success mt-m">✓ Schedule saved</div>
                  )}
                  {docSchedStatus === 'error' && (
                    <div className="wh-status error mt-m">Failed to save. Please try again.</div>
                  )}

                  {!docSchedLoading && (
                    <button
                      className="slot-option-btn active mt-m"
                      onClick={handleSaveDoctorSchedule}
                      disabled={docSchedSaving || !branchId}
                      style={{ alignSelf: 'flex-start' }}
                    >
                      {docSchedSaving ? 'Saving…' : 'Save schedule'}
                    </button>
                  )}

                  <div className="sched-section-title">Exceptions (days off, sick leave, vacation)</div>
                  <div className="exc-add-row">
                    <input type="date" value={excDate} onChange={e => setExcDate(e.target.value)} className="exc-date-input" />
                    <select value={excType} onChange={e => setExcType(e.target.value)} className="exc-type-select">
                      <option value="DAY_OFF">Day Off</option>
                      <option value="NO_SHOW">No Show</option>
                      <option value="SICK_LEAVE">Sick Leave</option>
                      <option value="VACATION">Vacation</option>
                      <option value="CUSTOM_HOURS">Custom Hours</option>
                    </select>
                    {excType === 'CUSTOM_HOURS' && (
                      <>
                        <input type="time" value={excStartTime} onChange={e => setExcStartTime(e.target.value)} placeholder="Start" />
                        <input type="time" value={excEndTime}   onChange={e => setExcEndTime(e.target.value)}   placeholder="End" />
                      </>
                    )}
                    <button className="staff-action-btn save" onClick={handleSaveException} disabled={excSaving || !selDoctorId}>
                      {excSaving ? 'Saving…' : 'Add'}
                    </button>
                  </div>
                  {excError && <div className="staff-add-error">{excError}</div>}
                  {excLoading ? (
                    <div className="sched-loading">Loading exceptions…</div>
                  ) : exceptions.length === 0 ? (
                    <div className="sched-empty">No exceptions in the next 3 months</div>
                  ) : (
                    <div className="exc-list">
                      {exceptions.map(exc => {
                        const EXC_LABELS: Record<string, string> = { DAY_OFF: 'Day Off', NO_SHOW: 'No Show', SICK_LEAVE: 'Sick Leave', VACATION: 'Vacation', CUSTOM_HOURS: 'Custom Hours' };
                        const EXC_COLORS: Record<string, string> = { DAY_OFF: '#94A3B8', NO_SHOW: '#F97316', SICK_LEAVE: '#EAB308', VACATION: '#3B82F6', CUSTOM_HOURS: '#10B981' };
                        const t2 = exc.type ?? 'CUSTOM_HOURS';
                        return (
                          <div key={exc.id} className="exc-item">
                            <span className="exc-date">{new Date(exc.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="exc-type-badge" style={{ background: (EXC_COLORS[t2] ?? '#888') + '22', color: EXC_COLORS[t2] ?? '#888', border: `1px solid ${EXC_COLORS[t2] ?? '#888'}` }}>
                              {EXC_LABELS[t2] ?? t2}
                            </span>
                            {exc.type === 'CUSTOM_HOURS' && exc.startTime && exc.endTime && (
                              <span className="exc-hours">{exc.startTime}–{exc.endTime}</span>
                            )}
                            <button className="exc-delete-btn" onClick={() => handleDeleteException(exc.id)}>✕</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {staffList.length === 0 && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '16px' }}>
                  No staff members found. Add doctors in the Staff section first.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
