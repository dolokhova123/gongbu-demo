import { useState } from 'react'
import './App.css'
import OperatorDashboard from './components/OperatorDashboard'
import TouristApp from './components/TouristApp'
import Settings from './components/Settings'
import Help from './components/Help'

function App() {
  const [view, setView] = useState<'operator' | 'tourist' | 'settings' | 'help'>('operator')

  return (
    <>
      <div style={{ padding: '10px', background: '#f0f0f0', display: 'flex', gap: '10px' }}>
        <button onClick={() => setView('operator')}>指挥中心</button>
        <button onClick={() => setView('tourist')}>游客端</button>
        <button onClick={() => setView('settings')}>设置</button>
        <button onClick={() => setView('help')}>帮助中心</button>
      </div>
      {view === 'operator' && <OperatorDashboard />}
      {view === 'tourist' && <TouristApp />}
      {view === 'settings' && <Settings onNavigateToHelp={() => setView('help')} />}
      {view === 'help' && <Help />}
    </>
  )
}

export default App