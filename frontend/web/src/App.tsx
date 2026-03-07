import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Patients from './pages/Patients'
import Settings from './pages/Settings'
import Login from './pages/Login'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Check for existing session
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
        return <Dashboard />;
      case 'schedule':
        return <Calendar />;
      case 'patients':
        return <Patients />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex items-center justify-center" style={{height: '100%', padding: '48px'}}>
            <h2>Page "{activeTab}" is under development</h2>
          </div>
        );
    }
  }

  return (
    <Layout activeId={activeTab} onSelect={setActiveTab} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  )
}

export default App
