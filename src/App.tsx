import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BrandList from './pages/BrandList'
import Compare from './pages/Compare'
import ScraperTest from './pages/ScraperTest'
import AdminLayout from './components/admin/AdminLayout'
import ScraperDashboard from './pages/admin/ScraperDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/markalar" element={<BrandList />} />
        <Route path="/karsilastir" element={<Compare />} />
        <Route path="/scraper-test" element={<ScraperTest />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ScraperDashboard />} />
          <Route path="scrapers" element={<ScraperDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
