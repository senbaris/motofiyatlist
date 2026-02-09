import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BrandList from './pages/BrandList'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/markalar" element={<BrandList />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
