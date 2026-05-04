import React, { useState } from 'react';
import Pendientes from './Pendientes'; 
import Asistencias from "./Asistencias";

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
      </header>
      
      {/* VISTAS */}
      {vista === "pendientes" && (
        <Pendientes idNivelActual={1} />
      )}

      {vista === "asistencias" && (
        <Asistencias />
      )}

    </div>
  );
}

export default App;