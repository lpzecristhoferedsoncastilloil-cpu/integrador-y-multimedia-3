import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import RutaProtegida from './components/RutaProtegida'

import LandingPublicitaria from './pages/LandingPublicitaria'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import Calendario from './pages/Calendario'
import Estadisticas from './pages/Estadisticas'
import Juegos from './pages/Juegos'
import Tests from './pages/Tests'
import Reports from './pages/Reports'
import Configuracion from './pages/Configuracion'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif' } }} />
        <Routes>
          <Route path="/" element={<LandingPublicitaria />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
          <Route path="/pacientes" element={<RutaProtegida><Pacientes /></RutaProtegida>} />
          <Route path="/calendario" element={<RutaProtegida><Calendario /></RutaProtegida>} />
          <Route path="/estadisticas" element={<RutaProtegida><Estadisticas /></RutaProtegida>} />
          <Route path="/juegos" element={<RutaProtegida><Juegos /></RutaProtegida>} />
          <Route path="/tests" element={<RutaProtegida><Tests /></RutaProtegida>} />
          <Route path="/reportes" element={<RutaProtegida><Reports /></RutaProtegida>} />
          <Route path="/configuracion" element={<RutaProtegida><Configuracion /></RutaProtegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
