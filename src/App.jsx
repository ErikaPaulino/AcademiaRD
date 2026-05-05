import React, { useState } from 'react';
import Pendientes from './Pendientes'; 
import Asistencias from "./Asistencias";
import Dashboard from "./Dashboard";

function App() {

  const [vista, setVista] = useState("pendientes");

  return (
    <div className="App">
      <header style={{ 
        textAlign: 'center', 
        padding: '20px', 
        backgroundColor: '#2563eb', 
        color: 'white',
        marginBottom: '20px'
      }}>
        <h1>Sistema Escolar</h1>

        {/* BOTONES */}
        <button 
          style={{ margin: "5px" }} 
          onClick={() => setVista("pendientes")}
        >
           Pendientes
        </button>

        <button 
          style={{ margin: "5px" }} 
          onClick={() => setVista("asistencias")}
        >
           Asistencia
        </button>

        <button 
  style={{ margin: "5px" }} 
  onClick={() => setVista("dashboard")}
>
  Dashboard
</button>
      </header>
      
      {/* VISTAS */}
      {vista === "pendientes" && (
        <Pendientes idNivelActual={1} />
      )}

      {vista === "asistencias" && (
        <Asistencias />
      )}

      {vista === "dashboard" && (
  <Dashboard />
)}

    </div>
  );
}

export default App;