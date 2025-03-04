import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import './styles.css'
import LandingPage from './landingPage'
import Login from './Login'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/students" element={<LandingPage />} />
        <Route path="/teachers" element={<LandingPage />} />
        <Route path="/classes" element={<LandingPage />} />
        <Route path="/grades" element={<LandingPage />} />
        <Route path="/attendance" element={<LandingPage />} />
        <Route path="/departments" element={<LandingPage />} />
        <Route path="/courses" element={<LandingPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
