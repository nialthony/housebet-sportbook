import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { StoreProvider } from './state/store'
import { Shell } from './components/Shell'
import SportsHome from './pages/SportsHome'
import Live from './pages/Live'
import Football from './pages/Football'
import MatchPage from './pages/MatchPage'
import BetsPage from './pages/BetsPage'

function AnimatedRoutes() {
  // keying on pathname remounts the tree, which replays .page-enter on
  // every navigation instead of only on first paint
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="page-enter">
      <Routes>
            <Route path="/" element={<SportsHome />} />
            <Route path="/live" element={<Live />} />
            <Route path="/football" element={<Football />} />
            <Route path="/match/:id" element={<MatchPage />} />
            <Route path="/bets" element={<BetsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <StoreProvider>
        <Shell>
          <AnimatedRoutes />
        </Shell>
      </StoreProvider>
    </HashRouter>
  )
}
