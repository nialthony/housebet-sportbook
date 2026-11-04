import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './state/store'
import { Shell } from './components/Shell'
import SportsHome from './pages/SportsHome'
import Live from './pages/Live'
import Football from './pages/Football'
import MatchPage from './pages/MatchPage'
import BetsPage from './pages/BetsPage'

export default function App() {
  return (
    <HashRouter>
      <StoreProvider>
        <Shell>
          <Routes>
            <Route path="/" element={<SportsHome />} />
            <Route path="/live" element={<Live />} />
            <Route path="/football" element={<Football />} />
            <Route path="/match/:id" element={<MatchPage />} />
            <Route path="/bets" element={<BetsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </StoreProvider>
    </HashRouter>
  )
}
