import React, { useState } from 'react'
import Estudiantes from "./Estudiantes";
import Pendientes from './Pendientes'
import Asistencias from "./Asistencias"
import Dashboard from "./Dashboard"
import Login from './components/Login'
import { useAuth } from './context/AuthContext'

function AppContent() {
  const [vista, setVista] = useState("pendientes")
  const { user, logout } = useAuth()

  return (
    <div className="App">
      <header style={{ textAlign: 'center', padding: '20px', backgroundColor: '#2563eb', color: 'white', marginBottom: '20px' }}>
        <h1>Colegio Molaco</h1>
        <p style={{ fontSize: '0.9rem', margin: '0 0 15px' }}>Sesión: {user?.email}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{ margin: "5px", padding: '8px 16px', borderRadius: '6px', border: 'none', background: vista === "estudiantes" ? '#1e40af' : '#3b82f6', color: 'white', cursor: 'pointer' }} onClick={() => setVista("estudiantes")}>Estudiantes</button>
          <button style={{ margin: "5px", padding: '8px 16px', borderRadius: '6px', border: 'none', background: vista === "pendientes" ? '#1e40af' : '#3b82f6', color: 'white', cursor: 'pointer' }} onClick={() => setVista("pendientes")}>Pendientes</button>
          <button style={{ margin: "5px", padding: '8px 16px', borderRadius: '6px', border: 'none', background: vista === "asistencias" ? '#1e40af' : '#3b82f6', color: 'white', cursor: 'pointer' }} onClick={() => setVista("asistencias")}>Asistencia</button>
          <button style={{ margin: "5px", padding: '8px 16px', borderRadius: '6px', border: 'none', background: vista === "dashboard" ? '#1e40af' : '#3b82f6', color: 'white', cursor: 'pointer' }} onClick={() => setVista("dashboard")}>Dashboard</button>
          <button style={{ margin: "5px", padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer' }} onClick={logout}>Cerrar Sesión</button>
        </div>
      </header>
      {vista === "estudiantes" && <Estudiantes />}
      {vista === "pendientes" && <Pendientes idNivelActual={1} />}
      {vista === "asistencias" && <Asistencias />}
      {vista === "dashboard" && <Dashboard />}
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>
  return user ? <AppContent /> : <Login />
}
