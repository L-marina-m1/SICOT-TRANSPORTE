import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Vehiculos from './pages/Vehiculos'
import Estadisticas from './pages/Estadisticas'
import Reportes from './pages/Reportes'
import Notificaciones from './pages/Notificaciones'
import Configuracion from './pages/Configuracion'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Route>
    </Routes>
  )
}