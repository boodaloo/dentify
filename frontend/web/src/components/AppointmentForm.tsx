import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import PhoneInput from './PhoneInput';
import './AppointmentForm.css';

interface AppointmentFormProps {
  initialData?: any;
  defaultDate?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const STATUSES = [
  { value: 'SCHEDULED',   label: 'Scheduled',   color: '#6B7280' },
  { value: 'CONFIRMED',   label: 'Confirmed',   color: '#2563EB' },
  { value: 'IN_PROGRESS', label: 'In chair',    color: '#7C3AED' },
  { value: 'COMPLETED',   label: 'Completed',   color: '#059669' },
  { value: 'CANCELLED',   label: 'Cancelled',   color: '#DC2626' },
  { value: 'NO_SHOW',     label: 'No show',     color: '#D97706' },
];

const COLORS = ['#14919B', '#45B7A0', '#2563EB', '#7C3AED', '#DC2626', '#D97706', '#059669', '#DB2777'];

const REFERRAL_SOURCES = [
  { value: 'INTERNET',       label: 'Internet / Website' },
  { value: 'RECOMMENDATION', label: 'Recommendation' },
  { value: 'ADVERTISEMENT',  label: 'Advertisement' },
  { value: 'SOCIAL_MEDIA',   label: 'Social media' },
  { value: 'WALK_IN',        label: 'Walk-in' },
  { value: 'OTHER',          label: 'Other' },
];

const SLOT_MIN_KEY = 'calendarSlotMin';
export const getSlotMin = () => parseInt(localStorage.getItem(SLOT_MIN_KEY) || '15', 10);

const buildTimeOptions = (intervalMin: number) => {
  const opts: { label: string; value: string }[] = [];
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += intervalMin) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      opts.push({ label: `${hh}:${mm}`, value: `${hh}:${mm}` });
    }
  }
  return opts;
};

const snapTime = (timeStr: string, intervalMin: number): string => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const snapped = Math.floor(m / intervalMin) * intervalMin;
  return `${String(h).padStart(2, '0')}:${String(snapped).padStart(2, '0')}`;
};

/** Round current time UP to the next slot boundary, clamped to 06:00–23:00 */
const nowSnappedUp = (intervalMin: number): string => {
  const now = new Date();
  const totalMin = now.getHours() * 60 + now.getMinutes();
  const snapped = Math.ceil(totalMin / intervalMin) * intervalMin;
  // Clamp: at least 06:00, at most 23:00
  const clamped = Math.max(6 * 60, Math.min(snapped, 23 * 60));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** Add minutes to a HH:MM string, returns HH:MM */
const addMinutes = (timeStr: string, minutes: number): string => {
  const [h, m] = timeStr.split(':').map(Number);
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const pad = (n: number) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const isoToDateStr = (iso: string) => { if (!iso) return ''; const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const isoToTimeStr = (iso: string) => { if (!iso) return ''; const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const combineDatetime = (date: string, time: string) =>
  date && time ? `${date}T${time}` : '';

// ─── TimeSelect ───────────────────────────────────────────────────────────────

const TimeSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  intervalMin: number;
}> = ({ value, onChange, intervalMin }) => {
  const options = buildTimeOptions(intervalMin);
  return (
    <select
      className="apt-time-select"
      value={snapTime(value, intervalMin)}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
};

// ─── Main Form ────────────────────────────────────────────────────────────────

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  initialData, defaultDate, onSuccess, onCancel,
}) => {
  const { t } = useTranslation();
  const slotMin = getSlotMin();

  const initDate = defaultDate
    ? isoToDateStr(new Date(defaultDate).toISOString())
    : initialData?.startTime ? isoToDateStr(new Date(initialData.startTime).toISOString()) : today();

  const initStartTime = defaultDate
    ? isoToTimeStr(new Date(defaultDate).toISOString())
    : initialData?.startTime
      ? snapTime(isoToTimeStr(new Date(initialData.startTime).toISOString()), slotMin)
      : nowSnappedUp(slotMin);

  const initEndTime = initialData?.endTime
    ? snapTime(isoToTimeStr(new Date(initialData.endTime).toISOString()), slotMin)
    : defaultDate
      ? snapTime(isoToTimeStr(new Date(new Date(defaultDate).getTime() + slotMin * 60000).toISOString()), slotMin)
      : addMinutes(initStartTime, slotMin);

  const [date, setDate]           = useState(initDate);
  const [startTime, setStartTime] = useState(initStartTime);
  const [endTime, setEndTime]     = useState(initEndTime);

  // Base form fields
  const [formData, setFormData] = useState({
    patientId:      initialData?.patientId || '',
    doctorId:       initialData?.doctorId  || '',
    notes:          initialData?.notes     || '',
    status:         initialData?.status    || 'SCHEDULED',
    color:          initialData?.color     || '',
    roomId:         initialData?.roomId    || '',
    promotionId:    '',
    referralSource: (initialData?.patient?.referralSource ?? '') as string,
  });
  // track whether referralSource was changed for existing patients
  const [referralSourceChanged, setReferralSourceChanged] = useState(false);

  // Patient search
  const [patientSearch, setPatientSearch] = useState(
    initialData?.patient
      ? `${initialData.patient.lastName} ${initialData.patient.firstName}`
      : ''
  );
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // New patient mode
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ lastName: '', firstName: '', middleName: '', phone: '' });

  // Other data
  const [doctors, setDoctors]         = useState<any[]>([]);
  const [rooms, setRooms]             = useState<any[]>([]);
  const [promotions, setPromotions]   = useState<any[]>([]);
  const [branchId, setBranchId]       = useState<string>(initialData?.branchId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    // Load doctors — default to current logged-in user if they appear in the list
    const currentUserId = (() => {
      try { return JSON.parse(localStorage.getItem('orisios_user') || '{}').id ?? ''; }
      catch { return ''; }
    })();

    api.get('/staff').then((res: any) => {
      const items = res?.data?.items ?? res?.data ?? res ?? [];
      const list: any[] = Array.isArray(items) ? items : [];
      setDoctors(list);
      // Only auto-set if this is a new appointment (no existing doctorId)
      if (!initialData?.doctorId) {
        const me = list.find(d => (d.userId || d.id) === currentUserId);
        if (me) {
          setFormData(prev => ({ ...prev, doctorId: me.userId || me.id }));
        }
      }
    }).catch(() => {});

    // Load promotions
    api.get('/finance/promotions', { isActive: 'true' }).then((res: any) => {
      const items = res?.data?.items ?? res?.data ?? res ?? [];
      setPromotions(Array.isArray(items) ? items : []);
    }).catch(() => {});

    // Load branch + rooms
    if (!branchId) {
      api.get('/branches').then((res: any) => {
        const branches: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        const main = branches.find((b: any) => b.isMain) ?? branches[0];
        if (main) {
          setBranchId(main.id);
          loadRooms(main.id);
        }
      }).catch(() => {});
    } else {
      loadRooms(branchId);
    }
  }, []);

  const loadRooms = (bid: string) => {
    api.get(`/branches/${bid}/rooms`).then((res: any) => {
      const items = res?.data?.items ?? res?.data ?? res ?? [];
      const list = Array.isArray(items) ? items : [];
      setRooms(list);
      // Default to first room if no room selected yet
      if (!formData.roomId && list.length > 0) {
        setFormData(prev => ({ ...prev, roomId: list[0].id }));
      }
    }).catch(() => {});
  };

  const handlePatientSearch = (value: string) => {
    setPatientSearch(value);
    if (!value.trim()) {
      setFormData(prev => ({ ...prev, patientId: '' }));
      setPatientResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res: any = await api.get('/patients', { search: value, limit: '8' });
        const items = res?.data?.items ?? res?.data ?? res ?? [];
        setPatientResults(Array.isArray(items) ? items : []);
        setShowPatientDropdown(true);
      } catch {}
    }, 250);
  };

  const selectPatient = (p: any) => {
    setFormData(prev => ({
      ...prev,
      patientId:      p.id,
      referralSource: p.referralSource ?? '',
    }));
    setReferralSourceChanged(false);
    setPatientSearch(`${p.lastName} ${p.firstName}`);
    setPatientResults([]);
    setShowPatientDropdown(false);
  };

  const handleStartTimeChange = (newTime: string) => {
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const durationMin = (eh * 60 + em) - (sh * 60 + sm);
      const [nh, nm] = newTime.split(':').map(Number);
      const newEndMin = nh * 60 + nm + Math.max(durationMin, slotMin);
      const clampedEndMin = Math.min(newEndMin, 21 * 60);
      const newEndH = Math.floor(clampedEndMin / 60);
      const snappedEndM = Math.floor((clampedEndMin % 60) / slotMin) * slotMin;
      setEndTime(`${String(newEndH).padStart(2, '0')}:${String(snappedEndM).padStart(2, '0')}`);
    }
    setStartTime(newTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) { setError('Please select a date'); return; }
    if (!branchId) { setError('No branch found. Please configure a branch in Settings.'); return; }

    if (isNewPatient) {
      if (!newPatient.lastName.trim()) { setError('Last name is required'); return; }
      if (!newPatient.firstName.trim()) { setError('First name is required'); return; }
      if (!newPatient.phone.trim()) { setError('Phone is required'); return; }
    } else if (!formData.patientId) {
      setError('Please select a patient');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let patientId = formData.patientId;

      // Create new patient if needed
      if (isNewPatient) {
        const created: any = await api.post('/patients', {
          lastName:       newPatient.lastName.trim(),
          firstName:      newPatient.firstName.trim(),
          middleName:     newPatient.middleName.trim() || undefined,
          phone:          newPatient.phone.trim(),
          referralSource: formData.referralSource || undefined,
          branchId,
        });
        patientId = created?.data?.id ?? created?.id;
      } else if (referralSourceChanged && patientId && formData.referralSource) {
        // Update referral source for existing patient
        await api.put(`/patients/${patientId}`, {
          referralSource: formData.referralSource,
        }).catch(() => {}); // non-critical, don't block appointment save
      }

      const payload: any = {
        patientId,
        doctorId:  formData.doctorId  || undefined,
        branchId,
        startTime: combineDatetime(date, startTime),
        endTime:   combineDatetime(date, endTime),
        notes:     formData.notes     || undefined,
        status:    formData.status,
        color:     formData.color     || undefined,
        roomId:    formData.roomId    || undefined,
      };

      if (initialData?.id) {
        await api.put(`/appointments/${initialData.id}`, payload);
      } else {
        await api.post('/appointments', payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this appointment?')) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/appointments/${initialData.id}`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusObj = STATUSES.find(s => s.value === formData.status);

  return (
    <form className="apt-form" onSubmit={handleSubmit}>
      {error && <div className="apt-error">{error}</div>}

      {/* ── Section: Patient ── */}
      <div className="apt-section">
        <div className="apt-section-header">
          <span className="apt-section-title">Patient</span>
          <label className="apt-toggle-label">
            <input
              type="checkbox"
              className="apt-toggle-check"
              checked={isNewPatient}
              onChange={e => { setIsNewPatient(e.target.checked); setError(''); }}
            />
            <span className="apt-toggle-text">New patient</span>
          </label>
        </div>

        {isNewPatient ? (
          <div className="apt-new-patient">
            <div className="apt-row apt-row-4">
              <div className="apt-field">
                <label>Last name <span className="apt-req">*</span></label>
                <input
                  type="text"
                  placeholder="Ivanov"
                  value={newPatient.lastName}
                  onChange={e => setNewPatient(p => ({ ...p, lastName: e.target.value }))}
                />
              </div>
              <div className="apt-field">
                <label>First name <span className="apt-req">*</span></label>
                <input
                  type="text"
                  placeholder="Ivan"
                  value={newPatient.firstName}
                  onChange={e => setNewPatient(p => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="apt-field">
                <label>Middle name</label>
                <input
                  type="text"
                  placeholder="Ivanovich"
                  value={newPatient.middleName}
                  onChange={e => setNewPatient(p => ({ ...p, middleName: e.target.value }))}
                />
              </div>
              <div className="apt-field">
                <label>Phone <span className="apt-req">*</span></label>
                <PhoneInput
                  value={newPatient.phone}
                  onChange={e => setNewPatient(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="apt-field" style={{ position: 'relative' }}>
            <label>Search patient <span className="apt-req">*</span></label>
            <div className="apt-search-wrap">
              <svg className="apt-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                className="apt-search-input"
                placeholder="Last name or first name…"
                value={patientSearch}
                onChange={e => handlePatientSearch(e.target.value)}
                onFocus={() => patientResults.length > 0 && setShowPatientDropdown(true)}
                onBlur={() => setTimeout(() => setShowPatientDropdown(false), 150)}
                autoComplete="off"
              />
              {formData.patientId && (
                <span className="apt-search-check">✓</span>
              )}
            </div>
            {showPatientDropdown && patientResults.length > 0 && (
              <div className="apt-patient-dropdown">
                {patientResults.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className="apt-patient-item"
                    onMouseDown={() => selectPatient(p)}
                  >
                    <span className="apt-patient-name">{p.lastName} {p.firstName}</span>
                    {p.phone && <span className="apt-patient-phone">{p.phone}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section: Schedule ── */}
      <div className="apt-section">
        <div className="apt-section-title">Schedule</div>
        <div className="apt-row apt-row-3">
          <div className="apt-field apt-field-wide">
            <label>Date <span className="apt-req">*</span></label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div className="apt-field">
            <label>Start</label>
            <TimeSelect value={startTime} onChange={handleStartTimeChange} intervalMin={slotMin} />
          </div>
          <div className="apt-field">
            <label>End</label>
            <TimeSelect value={endTime} onChange={setEndTime} intervalMin={slotMin} />
          </div>
        </div>
      </div>

      {/* ── Section: Doctor & Room ── */}
      <div className="apt-section">
        <div className="apt-section-title">Assignment</div>
        <div className="apt-row">
          <div className="apt-field apt-field-grow">
            <label>Doctor</label>
            <select
              value={formData.doctorId}
              onChange={e => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
            >
              <option value="">— Any doctor —</option>
              {doctors.map((d: any) => (
                <option key={d.userId || d.id} value={d.userId || d.id}>
                  {d.user?.name || d.name || `Doctor ${d.userId}`}
                </option>
              ))}
            </select>
          </div>
          {rooms.length > 0 && (
            <div className="apt-field apt-field-room">
              <label>Room / Chair</label>
              <select
                value={formData.roomId}
                onChange={e => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
              >
                {rooms.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name || `Room ${r.number ?? r.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Section: Notes ── */}
      <div className="apt-section">
        <div className="apt-field">
          <label>Notes</label>
          <textarea
            placeholder="Appointment notes…"
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={2}
          />
        </div>
      </div>

      {/* ── Section: Marketing ── */}
      <div className="apt-section">
        <div className="apt-section-title">Marketing</div>
        <div className="apt-row">
          <div className="apt-field apt-field-grow">
            <label>Referral source</label>
            <select
              value={formData.referralSource}
              onChange={e => {
                setFormData(prev => ({ ...prev, referralSource: e.target.value }));
                setReferralSourceChanged(true);
              }}
            >
              <option value="">— Not specified —</option>
              {REFERRAL_SOURCES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          {promotions.length > 0 && (
            <div className="apt-field apt-field-grow">
              <label>Promotional campaign</label>
              <select
                value={formData.promotionId}
                onChange={e => setFormData(prev => ({ ...prev, promotionId: e.target.value }))}
              >
                <option value="">— None —</option>
                {promotions.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.value && p.type === 'DISCOUNT_PERCENT' ? ` (−${p.value}%)` : ''}
                    {p.value && p.type === 'DISCOUNT_FIXED'   ? ` (−${p.value} ₽)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Section: Status & Color ── */}
      <div className="apt-section">
        <div className="apt-section-title">Status</div>
        <div className="apt-status-row">
          {STATUSES.map(s => (
            <button
              key={s.value}
              type="button"
              className={`apt-status-chip ${formData.status === s.value ? 'active' : ''}`}
              style={formData.status === s.value ? { background: s.color, borderColor: s.color } : {}}
              onClick={() => setFormData(prev => ({ ...prev, status: s.value }))}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="apt-color-row">
          <span className="apt-color-label">
            Custom color
            {statusObj && !formData.color && (
              <span className="apt-color-hint"> (using status color)</span>
            )}
          </span>
          <div className="apt-color-swatches">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`apt-color-dot ${formData.color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setFormData(prev => ({ ...prev, color: prev.color === c ? '' : c }))}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="apt-actions">
        <div>
          {initialData?.id && (
            <button
              type="button"
              className="apt-btn apt-btn-danger"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete
            </button>
          )}
        </div>
        <div className="apt-actions-right">
          <button type="button" className="apt-btn apt-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="apt-btn apt-btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : initialData?.id ? 'Save changes' : 'Create appointment'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AppointmentForm;
