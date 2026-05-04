import React from 'react';
import Pendientes from './Pendientes'; 

function App() {
  return (
    <div className="App">
      <header style={{ 
        textAlign: 'center', 
        padding: '20px', 
        backgroundColor: '#2563eb', 
        color: 'white',
        marginBottom: '20px'
      }}>
        <h1>Pendientes</h1>
      </header>
      
      {/*componente para que la profesora agregue tareas */}
      <Pendientes idNivelActual={1} /> 
    </div>
  );
}

export default App;