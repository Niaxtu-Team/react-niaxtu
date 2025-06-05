import { useState } from 'react'
import './App.css'
import Acceuil from './pages/accueil'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Page2 from './pages/page2'
import AdminDashboard from './pages/Admindashboard'
  

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Acceuil />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/Page2" element={<Page2 />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
