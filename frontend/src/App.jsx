import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import RutaProtegida from './auth/RutaProtegida'
import { ROLES_ADMINISTRACION } from './auth/roles'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Vehiculos from './pages/vehiculos/Vehiculos'
import Estadisticas from './pages/Estadisticas'
import Reportes from './pages/Reportes'
import Notificaciones from './pages/Notificaciones'
import Configuracion from './pages/configuracion/Configuracion'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route
          path="/configuracion"
          element={<RutaProtegida roles={ROLES_ADMINISTRACION}><Configuracion /></RutaProtegida>}
        />
      </Route>

      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}
