import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';
import './Patients.css';

const IconUserPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>;
const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const IconChevronLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

interface PatientsProps {
  onSelectPatient?: (patient: any) => void;
}

const Patients: React.FC<PatientsProps> = ({ onSelectPatient }) => {
  const { t, i18n } = useTranslation();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/patients', {
        search: searchTerm,
        page: String(page),
        limit: '10'
      });
      // API returns either array or { items, total }
      const items = Array.isArray(data) ? data : (data.items || []);
      const total = Array.isArray(data) ? data.length : (data.total || 0);
      setPatients(items);
      setTotalPages(Math.ceil(total / 10));
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm, page]);

  const handleAddPatient = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const handleEditPatient = (patient: any) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  return (
    <div className="patients-page">
      <header className="page-header flex justify-between items-center">
        <div>
          <h1>{t('nav.patients')}</h1>
          <p className="subtext">{t('patients.subtitle', { count: patients.length })}</p>
        </div>
        <button className="add-btn primary flex items-center gap-s" onClick={handleAddPatient}>
          <IconUserPlus />
          {t('dashboard.add_patient')}
        </button>
      </header>

      <section className="controls-grid flex gap-m">
        <div className="search-box card flex-1 flex items-center gap-s">
          <IconSearch />
          <input 
            type="text" 
            placeholder={t('common.search_placeholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters card">
          <span className="placeholder-text">Filters (All, New, Recent)</span>
        </div>
      </section>

      <div className="patients-list-container card">
        <table className="patients-table">
          <thead>
            <tr>
              <th>{t('patients.name')}</th>
              <th>{t('patients.contact')}</th>
              <th>{t('patients.last_visit')}</th>
              <th>{t('patients.next_visit')}</th>
              <th>{t('patients.status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-xl">
                  <div className="loading-spinner m-auto"></div>
                </td>
              </tr>
            ) : patients.length > 0 ? (
              patients.map(patient => (
                <tr key={patient.id} className="patient-row" onClick={() => onSelectPatient?.(patient)} onDoubleClick={() => handleEditPatient(patient)}>
                  <td>
                    <div className="patient-identity flex items-center gap-m">
                      <div className={`avatar p${patient.id.slice(-1)}`}></div>
                      <div className="name-box">
                        <div className="full-name">{patient.firstName} {patient.lastName}</div>
                        <div className="dob">{new Date(patient.dateOfBirth).toLocaleDateString(locale)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-box">
                      <div className="phone">{patient.phone}</div>
                      <div className="email">{patient.email}</div>
                    </div>
                  </td>
                  <td>
                    {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString(locale) : '—'}
                  </td>
                  <td>
                    {patient.nextVisit ? new Date(patient.nextVisit).toLocaleDateString(locale) : '—'}
                  </td>
                  <td>
                    <span className={`status-badge active`}>Active</span>
                  </td>
                  <td className="actions-cell">
                    <button className="icon-btn" onClick={() => handleEditPatient(patient)}>•••</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="empty-state py-xl text-center">
                  {t('dashboard.empty_state')}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination flex justify-center items-center gap-m py-m">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              className="icon-btn"
            >
              <IconChevronLeft />
            </button>
            <span className="page-indicator">{t('patients.page', { current: page, total: totalPages })}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(page + 1)}
              className="icon-btn"
            >
              <IconChevronRight />
            </button>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPatient ? 'Edit Patient' : t('dashboard.add_patient')}
      >
        <PatientForm 
          initialData={editingPatient}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchPatients();
          }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default Patients;
