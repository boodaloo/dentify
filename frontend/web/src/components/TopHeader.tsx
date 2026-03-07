import { useTranslation } from 'react-i18next';
import './TopHeader.css';

const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const IconSparkles = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const IconMessage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconChevronDown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const IconGlobe = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

const TopHeader: React.FC = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const currentLang = i18n.language || 'en';
    const newLang = currentLang.startsWith('en') ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('orisios_lang', newLang);
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="weather-widget">
          <div className="weather-icon-bg">
            <span className="weather-icon">☀️</span>
          </div>
          <span className="weather-text">{t('dashboard.all_clear')}</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <IconSearch />
          <input type="text" placeholder={t('common.search_placeholder')} />
        </div>
      </div>

      <div className="header-right">
        <button className="lang-switcher" onClick={toggleLanguage}>
          <IconGlobe />
          <span>{i18n.language?.startsWith('ru') ? 'РУССКИЙ' : 'ENGLISH'}</span>
        </button>

        <button className="oris-ai-btn">
          <IconSparkles />
          <span>{t('common.oris_ai')}</span>
        </button>

        <button className="icon-btn">
          <IconBell />
          <div className="notification-badge">3</div>
        </button>

        <button className="icon-btn">
          <IconMessage />
          <div className="notification-badge">1</div>
        </button>

        <div className="user-profile">
          <div className="avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar" />
          </div>
          <IconChevronDown />
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
