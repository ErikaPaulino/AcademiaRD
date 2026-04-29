import { supabase } from './supabaseClient';
//probando conexion de bases de datos, tomenlo como ejemplo para probar la conexion, 
// modifiquenlo a su gusto antes de usar, ya que este ya fue probado y
//funciona perfectamente, cualquier cosa me avisan, 
// lo importante es que se conecte a la base de datos y puedan hacer operaciones CRUD
//me avisan si falla o quieren comprobar los cambios en BD att: Erika

function App() {
  const agregarNivelPrueba = async () => {
    const { data, error } = await supabase
      .from('niveles')
      .insert([
        { 
          nombre: 'Nivel Avanzado', 
          descripcion: 'Prueba de conexión desde React con Vite' 
        }
      ]);

    if (error) {
      console.error('Error al insertar:', error);
      alert('Hubo un error, revisa la consola');
    } else {
      console.log('¡Éxito! Nivel agregado:', data);
      alert('¡Conexión exitosa! Nivel "Avanzado" guardado en la base de datos.');
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Prueba de Conexión Academia RD</h1>
      <button 
        onClick={agregarNivelPrueba}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Probar Insertar Nivel
      </button>
    </div>
  );
}

export default App;