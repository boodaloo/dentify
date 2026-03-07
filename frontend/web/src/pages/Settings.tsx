import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Settings.css';

const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconGlobe = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const IconLock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');

  const [clinicData, setClinicData] = useState({
    name: 'Orisios Dental Care',
    address: '123 Medical Plaza, Suites 4',
    phone: '+1 (555) 000-1234',
    email: 'contact@orisios.com',
    website: 'https://orisios.com'
  });

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
        </aside>

        <main className="settings-content card flex-1">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h3>{t('settings.profile_title')}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('settings.clinic_name')}</label>
                  <input type="text" value={clinicData.name} onChange={(e) => setClinicData({...clinicData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>{t('settings.address')}</label>
                  <input type="text" value={clinicData.address} onChange={(e) => setClinicData({...clinicData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>{t('settings.phone')}</label>
                  <input type="text" value={clinicData.phone} onChange={(e) => setClinicData({...clinicData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>{t('settings.email')}</label>
                  <input type="email" value={clinicData.email} onChange={(e) => setClinicData({...clinicData, email: e.target.value})} />
                </div>
              </div>
              <button className="primary mt-l">{t('settings.save_changes')}</button>
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
        </main>
      </div>
    </div>
  );
};

export default Settings;
