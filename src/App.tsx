import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BrandList from './pages/BrandList'
import ScraperTest from './pages/ScraperTest'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/markalar" element={<BrandList />} />
        <Route path="/scraper-test" element={<ScraperTest />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
