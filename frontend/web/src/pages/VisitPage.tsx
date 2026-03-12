import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import './VisitPage.css';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconBack        = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconSave        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconCheck       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconX           = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const IconSearch      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconCalendar    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const IconUser        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>;
const IconAlert       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate  = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime  = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const fmtCur   = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
const calcAge  = (dob: string) => Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  SCHEDULED:   { label: 'Scheduled',   cls: 'vp-chip yellow' },
  CONFIRMED:   { label: 'Confirmed',   cls: 'vp-chip teal' },
  IN_PROGRESS: { label: 'In Progress', cls: 'vp-chip coral' },
  COMPLETED:   { label: 'Completed',   cls: 'vp-chip green' },
  CANCELLED:   { label: 'Cancelled',   cls: 'vp-chip gray' },
  NO_SHOW:     { label: 'No Show',     cls: 'vp-chip red' },
};

const INV_STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'Pending',   cls: 'vp-chip yellow' },
  DRAFT:     { label: 'Draft',     cls: 'vp-chip gray' },
  ISSUED:    { label: 'Issued',    cls: 'vp-chip yellow' },
  PAID:      { label: 'Paid',      cls: 'vp-chip green' },
  PARTIAL:   { label: 'Partial',   cls: 'vp-chip teal' },
  CANCELLED: { label: 'Cancelled', cls: 'vp-chip gray' },
  OVERDUE:   { label: 'Overdue',   cls: 'vp-chip red' },
};

// ─── Dental Chart ─────────────────────────────────────────────────────────────

type ToothStatus = 'healthy' | 'filled' | 'cavity' | 'crown' | 'missing' | 'implant';
const API_TO_LOCAL: Record<string, ToothStatus> = {
  HEALTHY: 'healthy', FILLED: 'healthy', CARIES: 'cavity',
  CROWN: 'crown', EXTRACTED: 'missing', IMPLANT: 'implant',
  BRIDGE: 'crown', MISSING: 'missing', PROSTHESIS: 'crown',
  VENEER: 'filled', INLAY: 'filled',
};
const LOCAL_TO_API: Record<ToothStatus, string> = {
  healthy: 'HEALTHY', filled: 'FILLED', cavity: 'CARIES',
  crown: 'CROWN', missing: 'MISSING', implant: 'IMPLANT',
};
const TOOTH_LABELS: Record<ToothStatus, string> = {
  healthy: 'Healthy', filled: 'Filled', cavity: 'Cavity',
  crown: 'Crown', missing: 'Missing', implant: 'Implant',
};

const TOOTH_STATUSES: ToothStatus[] = ['healthy', 'filled', 'cavity', 'crown', 'missing', 'implant'];

interface ToothProps { number: number; status: ToothStatus; selected: boolean; onClick: () => void; }
const ToothCell: React.FC<ToothProps> = ({ number, status, selected, onClick }) => (
  <div className={`vp-tooth ${status} ${selected ? 'sel' : ''}`} onClick={onClick} title={`#${number} — ${TOOTH_LABELS[status]}`}>
    <div className="vp-tooth-crown" />
    <div className="vp-tooth-roots"><div className="vp-tooth-root" /><div className="vp-tooth-root" /></div>
    <span className="vp-tooth-num">{number}</span>
  </div>
);

// ─── Block: NOTES ─────────────────────────────────────────────────────────────

interface NotesBlockProps {
  record: any;
  onChange: (data: any) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}
const NotesBlock: React.FC<NotesBlockProps> = ({ record, onChange, saving, saved, onSave }) => {
  const [data, setData] = useState({
    complaints:    record?.complaints    ?? '',
    anamnesis:     record?.anamnesis     ?? '',
    treatmentPlan: record?.treatmentPlan ?? '',
    notes:         record?.notes         ?? '',
  });

  // sync when record loads
  useEffect(() => {
    setData({
      complaints:    record?.complaints    ?? '',
      anamnesis:     record?.anamnesis     ?? '',
      treatmentPlan: record?.treatmentPlan ?? '',
      notes:         record?.notes         ?? '',
    });
  }, [record?.id]);

  const handle = (field: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = { ...data, [field]: e.target.value };
    setData(next);
    onChange(next);
  };

  return (
    <div className="vp-block">
      <div className="vp-block-header"><span className="vp-block-title">Clinical Notes</span></div>
      <div className="vp-notes-grid">
        <div className="vp-form-group">
          <label>Complaints</label>
          <textarea rows={2} placeholder="Patient's chief complaints…" value={data.complaints} onChange={handle('complaints')} />
        </div>
        <div className="vp-form-group">
          <label>Anamnesis</label>
          <textarea rows={2} placeholder="Medical history, previous conditions…" value={data.anamnesis} onChange={handle('anamnesis')} />
        </div>
        <div className="vp-form-group">
          <label>Treatment Plan</label>
          <textarea rows={2} placeholder="Planned procedures…" value={data.treatmentPlan} onChange={handle('treatmentPlan')} />
        </div>
        <div className="vp-form-group">
          <label>Additional Notes</label>
          <textarea rows={2} placeholder="Any other relevant information…" value={data.notes} onChange={handle('notes')} />
        </div>
      </div>
      <div className="vp-block-footer">
        <button className="vp-btn-primary" onClick={onSave} disabled={saving}>
          <IconSave /> {saving ? 'Saving…' : 'Save Notes'}
        </button>
        {saved && <span className="vp-saved-indicator"><IconCheck /> Saved</span>}
      </div>
    </div>
  );
};

// ─── Block: DENTAL_CHART ──────────────────────────────────────────────────────

interface DentalChartBlockProps {
  patientId: string;
  initialChart: any[];
}
const DentalChartBlock: React.FC<DentalChartBlockProps> = ({ patientId, initialChart }) => {
  const [teeth, setTeeth] = useState<Record<number, ToothStatus>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const map: Record<number, ToothStatus> = {};
    initialChart.forEach(t => { map[t.toothNumber] = API_TO_LOCAL[t.status] ?? 'healthy'; });
    setTeeth(map);
  }, [initialChart]);

  const statusOf = (n: number): ToothStatus => teeth[n] ?? 'healthy';

  const setStatus = async (status: ToothStatus) => {
    if (!selected) return;
    const prev = { ...teeth };
    const next = { ...teeth, [selected]: status };
    setTeeth(next);
    try {
      await api.put(`/clinical/patients/${patientId}/dental-chart/${selected}`, { status: LOCAL_TO_API[status] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setTeeth(prev);
      setSaved(false);
    }
  };

  const upper = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lower = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  return (
    <div className="vp-block">
      <div className="vp-block-header">
        <span className="vp-block-title">Dental Chart</span>
        {saved && <span className="vp-saved-indicator"><IconCheck /> Saved</span>}
      </div>
      <div className="vp-chart-wrap">
        <div className="vp-jaw-label">Upper Jaw</div>
        <div className="vp-jaw-row">{upper.map(n => <ToothCell key={n} number={n} status={statusOf(n)} selected={selected === n} onClick={() => setSelected(p => p === n ? null : n)} />)}</div>
        <div className="vp-jaw-divider" />
        <div className="vp-jaw-row">{lower.map(n => <ToothCell key={n} number={n} status={statusOf(n)} selected={selected === n} onClick={() => setSelected(p => p === n ? null : n)} />)}</div>
        <div className="vp-jaw-label">Lower Jaw</div>
      </div>

      {selected && (
        <div className="vp-tooth-editor">
          <span className="vp-tooth-editor-label">Tooth #{selected} — set status:</span>
          <div className="vp-tooth-status-btns">
            {TOOTH_STATUSES.map(s => (
              <button
                key={s}
                className={`vp-ts-btn ${s} ${statusOf(selected) === s ? 'active' : ''}`}
                onClick={() => setStatus(s)}
                disabled={false}
              >
                {TOOTH_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="vp-chart-legend">
        {[
          { s: 'healthy', color: '#E8E8ED' },
          { s: 'filled',  color: 'rgba(13,115,119,0.3)' },
          { s: 'cavity',  color: 'rgba(242,204,143,0.5)' },
          { s: 'crown',   color: 'rgba(20,145,155,0.3)' },
          { s: 'missing', color: 'transparent', dash: true },
          { s: 'implant', color: 'rgba(90,90,114,0.2)' },
        ].map(l => (
          <div key={l.s} className="vp-legend-item">
            <div className="vp-legend-swatch" style={{ background: l.color, border: l.dash ? '2px dashed #C0C0CC' : `2px solid ${l.color === 'transparent' ? '#C0C0CC' : l.color}` }} />
            <span>{TOOTH_LABELS[l.s as ToothStatus]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Block: SERVICES ──────────────────────────────────────────────────────────

interface ServiceLine { serviceId: string; name: string; price: number; quantity: number; discount: number; }
interface ServicesBlockProps {
  initial: ServiceLine[];
  onChange: (lines: ServiceLine[]) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}
const ServicesBlock: React.FC<ServicesBlockProps> = ({ initial, onChange, saving, saved, onSave }) => {
  const [lines, setLines]         = useState<ServiceLine[]>(initial);
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLines(initial);
  }, [JSON.stringify(initial)]);

  const search = (q: string) => {
    setQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res: any = await api.get('/price-list', { search: q, limit: '10' });
        setResults(res?.data?.items ?? res?.data ?? []);
      } catch { } finally { setSearching(false); }
    }, 300);
  };

  const addService = (svc: any) => {
    const exists = lines.find(l => l.serviceId === svc.id);
    let next: ServiceLine[];
    if (exists) {
      next = lines.map(l => l.serviceId === svc.id ? { ...l, quantity: l.quantity + 1 } : l);
    } else {
      next = [...lines, { serviceId: svc.id, name: svc.name, price: Number(svc.price), quantity: 1, discount: 0 }];
    }
    setLines(next);
    onChange(next);
    setQuery('');
    setResults([]);
  };

  const updateLine = (idx: number, field: keyof ServiceLine, value: any) => {
    const next = lines.map((l, i) => i === idx ? { ...l, [field]: Number(value) } : l);
    setLines(next);
    onChange(next);
  };

  const removeLine = (idx: number) => {
    const next = lines.filter((_, i) => i !== idx);
    setLines(next);
    onChange(next);
  };

  const total    = lines.reduce((s, l) => s + l.price * l.quantity - l.discount, 0);
  const discount = lines.reduce((s, l) => s + l.discount, 0);

  return (
    <div className="vp-block">
      <div className="vp-block-header">
        <span className="vp-block-title">Services</span>
        {saved && <span className="vp-saved-indicator"><IconCheck /> Saved</span>}
      </div>

      {/* Search */}
      <div className="vp-svc-search-wrap">
        <div className="vp-svc-search">
          <IconSearch />
          <input
            placeholder="Search services to add…"
            value={query}
            onChange={e => search(e.target.value)}
          />
          {searching && <span className="vp-svc-searching">…</span>}
        </div>
        {results.length > 0 && (
          <div className="vp-svc-dropdown">
            {results.map(r => (
              <div key={r.id} className="vp-svc-option" onClick={() => addService(r)}>
                <span className="vp-svc-opt-name">{r.name}</span>
                <span className="vp-svc-opt-price">{fmtCur(Number(r.price))}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lines */}
      {lines.length > 0 ? (
        <table className="vp-svc-table">
          <thead>
            <tr>
              <th>Service</th>
              <th className="num">Price</th>
              <th className="num">Qty</th>
              <th className="num">Discount</th>
              <th className="num">Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i}>
                <td>{l.name}</td>
                <td className="num">
                  <input
                    type="number"
                    className="vp-cell-input"
                    value={l.price}
                    min={0}
                    onChange={e => updateLine(i, 'price', e.target.value)}
                  />
                </td>
                <td className="num">
                  <input
                    type="number"
                    className="vp-cell-input narrow"
                    value={l.quantity}
                    min={1}
                    onChange={e => updateLine(i, 'quantity', e.target.value)}
                  />
                </td>
                <td className="num">
                  <input
                    type="number"
                    className="vp-cell-input"
                    value={l.discount}
                    min={0}
                    onChange={e => updateLine(i, 'discount', e.target.value)}
                  />
                </td>
                <td className="num total-cell">{fmtCur(l.price * l.quantity - l.discount)}</td>
                <td>
                  <button className="vp-remove-btn" onClick={() => removeLine(i)} title="Remove"><IconX /></button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} />
              <td className="num tfoot-label">Discount</td>
              <td className="num tfoot-val">{discount > 0 ? fmtCur(discount) : '—'}</td>
              <td />
            </tr>
            <tr className="total-row">
              <td colSpan={3} />
              <td className="num tfoot-label bold">Total</td>
              <td className="num tfoot-val bold">{fmtCur(total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      ) : (
        <div className="vp-empty-state">No services added yet — search above to add</div>
      )}

      <div className="vp-block-footer">
        <button className="vp-btn-primary" onClick={onSave} disabled={saving || lines.length === 0}>
          <IconSave /> {saving ? 'Saving…' : 'Save Services'}
        </button>
      </div>
    </div>
  );
};

// ─── Block: INVOICE ───────────────────────────────────────────────────────────

interface InvoiceBlockProps {
  invoice: any;
}
const InvoiceBlock: React.FC<InvoiceBlockProps> = ({ invoice }) => {
  const cfg = invoice ? (INV_STATUS_CFG[invoice.status] ?? { label: invoice.status, cls: 'vp-chip gray' }) : null;

  if (!invoice) {
    return (
      <div className="vp-block">
        <div className="vp-block-header"><span className="vp-block-title">Invoice</span></div>
        <div className="vp-empty-state">No invoice yet — add services to generate one automatically</div>
      </div>
    );
  }

  const paid    = Number(invoice.paidAmount ?? 0);
  const total   = Number(invoice.totalAmount ?? 0);
  const balance = total - paid;

  return (
    <div className="vp-block">
      <div className="vp-block-header">
        <span className="vp-block-title">Invoice</span>
        {cfg && <span className={cfg.cls}>{cfg.label}</span>}
      </div>

      <div className="vp-invoice-summary">
        <div className="vp-inv-row"><span>Total</span><span className="vp-inv-val">{fmtCur(total)}</span></div>
        {Number(invoice.discountAmount) > 0 && (
          <div className="vp-inv-row"><span>Discount</span><span className="vp-inv-val discount">−{fmtCur(Number(invoice.discountAmount))}</span></div>
        )}
        <div className="vp-inv-row"><span>Paid</span><span className="vp-inv-val paid">{fmtCur(paid)}</span></div>
        {balance > 0 && (
          <div className="vp-inv-row balance"><span>Balance due</span><span className="vp-inv-val balance">{fmtCur(balance)}</span></div>
        )}
      </div>

      {invoice.items?.length > 0 && (
        <div className="vp-inv-items">
          {invoice.items.map((item: any, i: number) => (
            <div key={i} className="vp-inv-item">
              <span>{item.name}</span>
              <span className="vp-inv-item-right">
                {item.quantity > 1 && <span className="vp-inv-qty">×{item.quantity}</span>}
                {fmtCur(Number(item.price) * item.quantity - Number(item.discount ?? 0))}
              </span>
            </div>
          ))}
        </div>
      )}

      {invoice.payments?.length > 0 && (
        <div className="vp-inv-payments">
          <div className="vp-inv-pay-title">Payments</div>
          {invoice.payments.map((p: any, i: number) => (
            <div key={i} className="vp-inv-pay-row">
              <span>{fmtDate(p.paidAt ?? p.createdAt)}</span>
              <span>{p.method}</span>
              <span className="vp-inv-pay-amount">{fmtCur(Number(p.amount))}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Block: NEXT_APPOINTMENT ──────────────────────────────────────────────────

interface NextAptBlockProps {
  patientId: string;
  doctorId: string;
  branchId: string;
  onCreated: () => void;
}
const NextAptBlock: React.FC<NextAptBlockProps> = ({ patientId, doctorId, branchId, onCreated }) => {
  const [date,     setDate]     = useState('');
  const [time,     setTime]     = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [reason,   setReason]   = useState('');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');

  const handleCreate = async () => {
    if (!date) { setError('Date is required'); return; }
    setSaving(true);
    setError('');
    try {
      const startTime = new Date(`${date}T${time}:00`);
      const endTime   = new Date(startTime.getTime() + duration * 60000);
      await api.post('/appointments', {
        patientId,
        doctorId,
        branchId,
        startTime: startTime.toISOString(),
        endTime:   endTime.toISOString(),
        reason,
        status: 'SCHEDULED',
      });
      setSaved(true);
      onCreated();
      setTimeout(() => setSaved(false), 4000);
    } catch (e: any) {
      setError(e.message || 'Failed to create appointment');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="vp-block">
        <div className="vp-block-header"><span className="vp-block-title">Next Appointment</span></div>
        <div className="vp-next-success">
          <IconCheck /> Appointment scheduled for {date} at {time}
        </div>
      </div>
    );
  }

  return (
    <div className="vp-block">
      <div className="vp-block-header"><span className="vp-block-title">Next Appointment</span></div>
      {error && <div className="vp-block-error"><IconAlert /> {error}</div>}
      <div className="vp-next-form">
        <div className="vp-form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="vp-form-group">
          <label>Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>
        <div className="vp-form-group">
          <label>Duration (min)</label>
          <select value={duration} onChange={e => setDuration(Number(e.target.value))}>
            {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
        <div className="vp-form-group full">
          <label>Reason / Chief complaint</label>
          <input type="text" placeholder="Follow-up, crown fitting…" value={reason} onChange={e => setReason(e.target.value)} />
        </div>
      </div>
      <div className="vp-block-footer">
        <button className="vp-btn-primary" onClick={handleCreate} disabled={saving || !date}>
          <IconCalendar /> {saving ? 'Scheduling…' : 'Schedule Appointment'}
        </button>
      </div>
    </div>
  );
};

// ─── Main VisitPage ───────────────────────────────────────────────────────────

interface VisitPageProps {
  appointmentId: string;
  onBack: () => void;
}

const VisitPage: React.FC<VisitPageProps> = ({ appointmentId, onBack }) => {
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [appointment, setAppointment] = useState<any>(null);
  const [dentalChart, setDentalChart] = useState<any[]>([]);
  const [template,    setTemplate]    = useState<any>(null);

  // Block data refs (for saving)
  const notesDataRef    = useRef<any>(null);
  const servicesDataRef = useRef<any[] | null>(null);

  // Save states per block
  const [notesSaving,    setNotesSaving]    = useState(false);
  const [notesSaved,     setNotesSaved]     = useState(false);
  const [svcSaving,      setSvcSaving]      = useState(false);
  const [svcSaved,       setSvcSaved]       = useState(false);
  const [completing,     setCompleting]     = useState(false);

  const userRaw = localStorage.getItem('orisios_user');
  const userRole: string = userRaw ? (JSON.parse(userRaw).role ?? 'DOCTOR') : 'DOCTOR';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [visitRes, templatesRes] = await Promise.all([
        api.get(`/appointments/${appointmentId}/visit`),
        api.get('/visit-templates'),
      ]);

      const vData = visitRes?.data ?? visitRes;
      setAppointment(vData?.appointment);
      setDentalChart(vData?.dentalChart ?? []);

      const tpls: any[] = templatesRes?.data ?? (Array.isArray(templatesRes) ? templatesRes : []);
      const match = tpls.find((t: any) => t.role === userRole && t.isDefault)
                 ?? tpls.find((t: any) => t.role === userRole)
                 ?? tpls[0];
      setTemplate(match);

      // init refs from loaded data
      if (vData?.appointment?.medicalRecord) {
        notesDataRef.current = {
          complaints:    vData.appointment.medicalRecord.complaints    ?? '',
          anamnesis:     vData.appointment.medicalRecord.anamnesis     ?? '',
          treatmentPlan: vData.appointment.medicalRecord.treatmentPlan ?? '',
          notes:         vData.appointment.medicalRecord.notes         ?? '',
        };
      }
      if (vData?.appointment?.services?.length) {
        servicesDataRef.current = vData.appointment.services.map((s: any) => ({
          serviceId: s.serviceId,
          name:      s.service?.name ?? s.serviceId,
          price:     Number(s.price),
          quantity:  s.quantity,
          discount:  Number(s.discount ?? 0),
        }));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load visit data');
    } finally {
      setLoading(false);
    }
  }, [appointmentId, userRole]);

  useEffect(() => { load(); }, [load]);

  const handleSaveNotes = async () => {
    if (!notesDataRef.current) return;
    setNotesSaving(true);
    try {
      await api.put(`/appointments/${appointmentId}/medical-record`, notesDataRef.current);
      // Update local state
      setAppointment((prev: any) => ({
        ...prev,
        medicalRecord: { ...(prev.medicalRecord ?? {}), ...notesDataRef.current },
      }));
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch { } finally { setNotesSaving(false); }
  };

  const handleSaveServices = async () => {
    if (!servicesDataRef.current) return;
    setSvcSaving(true);
    try {
      await api.put(`/appointments/${appointmentId}/services`, { services: servicesDataRef.current });
      // Reload to get updated invoice
      await load();
      setSvcSaved(true);
      setTimeout(() => setSvcSaved(false), 3000);
    } catch { } finally { setSvcSaving(false); }
  };

  const handleComplete = async () => {
    if (!window.confirm('Mark this appointment as Completed?')) return;
    setCompleting(true);
    try {
      await api.post(`/appointments/${appointmentId}/complete`, {});
      setAppointment((prev: any) => ({ ...prev, status: 'COMPLETED' }));
    } catch { } finally { setCompleting(false); }
  };

  if (loading) {
    return (
      <div className="vp-root">
        <div className="vp-loading">Loading visit…</div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="vp-root">
        <div className="vp-error"><IconAlert /> {error || 'Visit not found'}</div>
        <button className="vp-btn-ghost" onClick={onBack}><IconBack /> Back</button>
      </div>
    );
  }

  const { patient, doctor, branch, services: aptServices, invoices, medicalRecord, status } = appointment;
  const invoice = invoices?.[0] ?? null;

  const patientName = [patient?.lastName, patient?.firstName, patient?.middleName].filter(Boolean).join(' ');
  const initialServiceLines: ServiceLine[] = (aptServices ?? []).map((s: any) => ({
    serviceId: s.serviceId,
    name:      s.service?.name ?? s.serviceId,
    price:     Number(s.price),
    quantity:  s.quantity,
    discount:  Number(s.discount ?? 0),
  }));

  const blocks: any[] = template?.blocks
    ? [...(template.blocks as any[])].sort((a, b) => a.order - b.order).filter((b: any) => b.visible)
    : [
        { type: 'NOTES', order: 1, visible: true, label: 'Clinical Notes' },
        { type: 'DENTAL_CHART', order: 2, visible: true, label: 'Dental Chart' },
        { type: 'SERVICES', order: 3, visible: true, label: 'Services' },
        { type: 'INVOICE', order: 4, visible: true, label: 'Invoice' },
        { type: 'NEXT_APPOINTMENT', order: 5, visible: true, label: 'Next Appointment' },
      ];

  const statusCfg = STATUS_CFG[status] ?? { label: status, cls: 'vp-chip gray' };

  return (
    <div className="vp-root">
      {/* ── Header ── */}
      <div className="vp-header">
        <button className="vp-btn-ghost" onClick={onBack}><IconBack /> Back</button>

        <div className="vp-header-info">
          <div className="vp-patient-name"><IconUser /> {patientName}</div>
          {patient?.birthDate && (
            <div className="vp-patient-meta">{calcAge(patient.birthDate)} yo · {fmtDate(patient.birthDate)}</div>
          )}
          {patient?.allergies && (
            <div className="vp-allergy-badge"><IconAlert /> {patient.allergies}</div>
          )}
        </div>

        <div className="vp-header-apt">
          <div className="vp-apt-meta">
            <span><IconCalendar /> {fmtDate(appointment.startTime)}</span>
            <span>{fmtTime(appointment.startTime)} – {fmtTime(appointment.endTime)}</span>
            {doctor && <span><IconUser /> {doctor.name}</span>}
            {branch && <span>{branch.name}</span>}
          </div>
          <span className={statusCfg.cls}>{statusCfg.label}</span>
        </div>

        <div className="vp-header-actions">
          {status !== 'COMPLETED' && status !== 'CANCELLED' && (
            <button className="vp-btn-complete" onClick={handleComplete} disabled={completing}>
              <IconCheck /> {completing ? 'Completing…' : 'Complete Visit'}
            </button>
          )}
        </div>
      </div>

      {/* ── Blocks ── */}
      <div className="vp-body">
        {blocks.map((block: any) => {
          switch (block.type) {
            case 'NOTES':
              return (
                <NotesBlock
                  key="notes"
                  record={medicalRecord}
                  onChange={(d) => { notesDataRef.current = d; }}
                  saving={notesSaving}
                  saved={notesSaved}
                  onSave={handleSaveNotes}
                />
              );
            case 'DENTAL_CHART':
              return (
                <DentalChartBlock
                  key="dental"
                  patientId={patient.id}
                  initialChart={dentalChart}
                />
              );
            case 'SERVICES':
              return (
                <ServicesBlock
                  key="services"
                  initial={initialServiceLines}
                  onChange={(lines) => { servicesDataRef.current = lines; }}
                  saving={svcSaving}
                  saved={svcSaved}
                  onSave={handleSaveServices}
                />
              );
            case 'INVOICE':
              return (
                <InvoiceBlock
                  key="invoice"
                  invoice={invoice}
                />
              );
            case 'NEXT_APPOINTMENT':
              return (
                <NextAptBlock
                  key="next-apt"
                  patientId={patient.id}
                  doctorId={appointment.doctorId}
                  branchId={appointment.branchId}
                  onCreated={() => {}}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default VisitPage;
