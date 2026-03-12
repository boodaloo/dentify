import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Patients from './pages/Patients'
import PatientProfile from './pages/PatientProfile'
import Settings from './pages/Settings'
import Login from './pages/Login'
import OnlineBooking from './pages/OnlineBooking'
import Templates from './pages/Templates'
import Documents from './pages/Documents'
import Labs from './pages/Labs'
import Insurance from './pages/Insurance'
import PriceList from './pages/PriceList'
import Invoices from './pages/Invoices'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import CallJournal from './pages/CallJournal'
import Loyalty from './pages/Loyalty'
import Analytics from './pages/Analytics'
import Integrations from './pages/Integrations'
import VisitPage from './pages/VisitPage'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [visitAppointmentId, setVisitAppointmentId] = useState<string | null>(null)
  const [preVisitTab, setPreVisitTab] = useState<string>('schedule')

  useEffect(() => {
    const storedUser = localStorage.getItem('orisios_user')
    const token = localStorage.getItem('orisios_token')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setIsInitializing(false)
  }, [])

  const handleLogin = (userData: any) => {
    setUser(userData)
    localStorage.setItem('orisios_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('orisios_token')
    localStorage.removeItem('orisios_user')
  }

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient)
    setActiveTab('patient-profile')
  }

  const handleBackFromProfile = () => {
    setSelectedPatient(null)
    setActiveTab('patients')
  }

  const handleOpenVisit = (appointmentId: string) => {
    setVisitAppointmentId(appointmentId)
    setPreVisitTab(activeTab)
    setActiveTab('visit')
  }

  const handleBackFromVisit = () => {
    setVisitAppointmentId(null)
    setActiveTab(preVisitTab)
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-teal-900">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'visit':
        return visitAppointmentId
          ? <VisitPage appointmentId={visitAppointmentId} onBack={handleBackFromVisit} />
          : null
      case 'schedule':
        return <Calendar onOpenPatient={(id) => { setSelectedPatient({ id }); setActiveTab('patient-profile'); }} onOpenVisit={handleOpenVisit} />
      case 'patients':
        return <Patients onSelectPatient={handleSelectPatient} />
      case 'patient-profile':
        return <PatientProfile patient={selectedPatient} onBack={handleBackFromProfile} onOpenVisit={handleOpenVisit} />
      case 'online_booking':
        return <OnlineBooking />
      case 'templates':
        return <Templates />
      case 'documents':
        return <Documents />
      case 'labs':
        return <Labs />
      case 'insurance':
        return <Insurance />
      case 'price_list':
        return <PriceList />
      case 'invoices':
        return <Invoices />
      case 'inventory':
        return <Inventory />
      case 'reports':
        return <Reports />
      case 'call_journal':
        return <CallJournal />
      case 'loyalty':
        return <Loyalty />
      case 'analytics':
        return <Analytics />
      case 'integrations':
        return <Integrations />
      case 'settings':
        return <Settings />
      default:
        return (
          <div className="flex items-center justify-center" style={{ height: '100%', padding: '48px' }}>
            <h2>Page "{activeTab}" is under development</h2>
          </div>
        )
    }
  }

  return (
    <Layout activeId={activeTab} onSelect={setActiveTab} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  )
}

export default App
