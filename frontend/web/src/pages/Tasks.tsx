import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import DateInput from '../components/DateInput';
import './Tasks.css';

interface AssignedUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface PatientRef {
  id: string;
  firstName: string;
  lastName: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  dueDate?: string;
  assignedTo?: AssignedUser | null;
  patient?: PatientRef | null;
  completedAt?: string | null;
  createdAt: string;
}

interface StaffMember {
  id: string;
  name: string;
}

interface PatientSearch {
  id: string;
  firstName: string;
  lastName: string;
}

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

const STATUS_TABS = ['MY', 'ALL', 'OPEN', 'IN_PROGRESS', 'DONE'];

const getTodayStr = () => new Date().toISOString().slice(0, 10);

const defaultForm = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'OPEN',
  dueDate: getTodayStr(),
  assignedToId: '',
  patientId: '',
  patientSearch: '',
};

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [patientResults, setPatientResults] = useState<PatientSearch[]>([]);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);

  const currentUserId = (() => {
    try { return JSON.parse(localStorage.getItem('orisios_user') ?? '{}').id ?? ''; } catch { return ''; }
  })();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '200' };
      if (activeStatus === 'MY') {
        params.assignedToId = currentUserId;
      } else {
        if (activeStatus !== 'ALL') params.status = activeStatus;
        if (assigneeFilter) params.assignedToId = assigneeFilter;
      }
      if (priorityFilter) params.priority = priorityFilter;

      const res: any = await api.get('/tasks', params);
      setTasks(res?.data?.items ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeStatus, priorityFilter, assigneeFilter, currentUserId]);

  const loadStaff = async () => {
    try {
      const res: any = await api.get('/staff', { limit: '100' });
      // /staff returns UserClinic objects with nested user — flatten to { id: userId, name }
      const items: any[] = res?.data?.items ?? [];
      setStaff(items.map((m: any) => ({ id: m.userId ?? m.id, name: m.user?.name ?? m.name ?? '?' })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadStaff();
  }, []);

  const searchPatients = async (q: string) => {
    if (!q || q.length < 2) { setPatientResults([]); return; }
    try {
      const res: any = await api.get('/patients', { search: q, limit: '10' });
      setPatientResults(res?.data?.items ?? []);
    } catch (e) {
      setPatientResults([]);
    }
  };

  const openNew = () => {
    console.log('[Tasks] openNew called');
    setEditingTask(null);
    setForm({ ...defaultForm });
    setPatientResults([]);
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assignedToId: task.assignedTo?.id ?? '',
      patientId: task.patient?.id ?? '',
      patientSearch: task.patient ? `${task.patient.lastName} ${task.patient.firstName}` : '',
    });
    setPatientResults([]);
    setSaveError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setPatientSearchOpen(false);
  };

  const handleSave = async () => {
    console.log('[Tasks] handleSave called, title:', form.title);
    if (!form.title.trim()) {
      setSaveError('Title is required');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const payload: any = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || undefined,
        assignedToId: form.assignedToId || undefined,
        patientId: form.patientId || undefined,
      };
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      closeModal();
      loadTasks();
    } catch (e: any) {
      console.error(e);
      setSaveError(e?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTask) return;
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${editingTask.id}`);
      closeModal();
      loadTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const quickStatusChange = async (task: Task, newStatus: string) => {
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      loadTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (d?: string) => {
    if (!d) return '';
    const dt = new Date(d);
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const getKanbanColumns = () => {
    const columns: { key: string; label: string; dotClass: string }[] = [
      { key: 'OPEN', label: 'Open', dotClass: 'open' },
      { key: 'IN_PROGRESS', label: 'In Progress', dotClass: 'in-progress' },
      { key: 'DONE', label: 'Done', dotClass: 'done' },
    ];
    return columns;
  };

  const tasksForColumn = (colStatus: string) =>
    tasks.filter((t) => t.status === colStatus);

  const showKanban = activeStatus === 'ALL' || activeStatus === 'MY';

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>Tasks</h1>
        <button className="btn-primary" onClick={openNew}>+ New Task</button>
      </div>

      <div className="tasks-filters">
        <div className="tasks-status-tabs">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              className={`tasks-status-tab ${activeStatus === s ? 'active' : ''}`}
              onClick={() => setActiveStatus(s)}
            >
              {s === 'MY' ? '⭐ My Tasks' : s === 'ALL' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <select
          className="tasks-filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          className="tasks-filter-select"
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
        >
          <option value="">All Assignees</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="tasks-body">
        {loading ? (
          <div className="tasks-empty">Loading...</div>
        ) : showKanban ? (
          <div className="kanban-board">
            {getKanbanColumns().map((col) => {
              const colTasks = tasksForColumn(col.key);
              return (
                <div key={col.key} className="kanban-column">
                  <div className="kanban-column-header">
                    <div className="kanban-column-title">
                      <span className={`column-dot ${col.dotClass}`}></span>
                      {col.label}
                    </div>
                    <span className="kanban-count">{colTasks.length}</span>
                  </div>
                  <div className="kanban-cards">
                    {colTasks.length === 0 ? (
                      <div className="tasks-empty" style={{ height: 80 }}>No tasks</div>
                    ) : colTasks.map((task) => (
                      <div key={task.id} className="task-card" onClick={() => openEdit(task)}>
                        <div className="task-card-top">
                          <span className={`priority-dot ${task.priority}`}></span>
                          <span className="task-card-title">{task.title}</span>
                        </div>
                        <div className="task-card-meta">
                          {task.patient && (
                            <span className="task-card-patient">
                              {task.patient.lastName} {task.patient.firstName}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className={`task-card-due ${isOverdue(task.dueDate) && task.status !== 'DONE' ? 'overdue' : ''}`}>
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.assignedTo && (
                            <span className="task-card-assignee">{task.assignedTo.name}</span>
                          )}
                        </div>
                        {col.key === 'OPEN' && (
                          <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              onClick={(e) => { e.stopPropagation(); quickStatusChange(task, 'IN_PROGRESS'); }}
                            >
                              Start
                            </button>
                          </div>
                        )}
                        {col.key === 'IN_PROGRESS' && (
                          <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                            <button
                              className="btn-primary"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                              onClick={(e) => { e.stopPropagation(); quickStatusChange(task, 'DONE'); }}
                            >
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.length === 0 ? (
              <div className="tasks-empty">No tasks found</div>
            ) : tasks.map((task) => (
              <div key={task.id} className="task-list-item" onClick={() => openEdit(task)}>
                <span className={`priority-dot ${task.priority}`}></span>
                <span className="task-list-title">{task.title}</span>
                {task.patient && (
                  <span className="task-card-patient">
                    {task.patient.lastName} {task.patient.firstName}
                  </span>
                )}
                {task.dueDate && (
                  <span className={`task-card-due ${isOverdue(task.dueDate) && task.status !== 'DONE' ? 'overdue' : ''}`}>
                    {formatDate(task.dueDate)}
                  </span>
                )}
                {task.assignedTo && (
                  <span className="task-card-assignee">{task.assignedTo.name}</span>
                )}
                <span className={`task-status-chip ${task.status}`}>{STATUS_LABELS[task.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="task-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="task-modal">
            <div className="task-modal-header">
              <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="task-modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="task-modal-body">
              <div className="task-form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title"
                  autoFocus
                />
              </div>

              <div className="task-form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Add details..."
                  rows={3}
                />
              </div>

              <div className="task-form-row">
                <div className="task-form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="task-form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="task-form-row">
                <div className="task-form-group">
                  <label>Due Date</label>
                  <DateInput
                    value={form.dueDate}
                    onChange={(iso) => setForm({ ...form, dueDate: iso })}
                  />
                </div>
                <div className="task-form-group">
                  <label>Assignee</label>
                  <select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}>
                    <option value="">— Unassigned —</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="task-form-group" style={{ position: 'relative' }}>
                <label>Link to Patient (optional)</label>
                <input
                  type="text"
                  value={form.patientSearch}
                  onChange={(e) => {
                    setForm({ ...form, patientSearch: e.target.value, patientId: '' });
                    searchPatients(e.target.value);
                    setPatientSearchOpen(true);
                  }}
                  placeholder="Search by name..."
                />
                {patientSearchOpen && patientResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    zIndex: 100,
                    maxHeight: 160,
                    overflowY: 'auto',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}>
                    {patientResults.map((p) => (
                      <div
                        key={p.id}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}
                        onMouseDown={() => {
                          setForm({ ...form, patientId: p.id, patientSearch: `${p.lastName} ${p.firstName}` });
                          setPatientSearchOpen(false);
                          setPatientResults([]);
                        }}
                      >
                        {p.lastName} {p.firstName}
                      </div>
                    ))}
                  </div>
                )}
                {form.patientId && (
                  <span style={{ fontSize: 11, color: 'var(--primary-teal)' }}>Patient linked</span>
                )}
              </div>
            </div>

            {saveError && (
              <div style={{ padding: '0 24px 8px', color: '#ef4444', fontSize: 13 }}>
                Error: {saveError}
              </div>
            )}
            <div className="task-modal-footer">
              <div className="task-modal-footer-left">
                {editingTask && (
                  <button className="btn-danger" onClick={handleDelete}>Delete</button>
                )}
              </div>
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editingTask ? 'Save Changes' : 'Create Task')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
