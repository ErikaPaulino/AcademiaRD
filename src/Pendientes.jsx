import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function Pendientes() {
  const [listaPendientes, setListaPendientes] = useState([]);
  const [nuevoPendiente, setNuevoPendiente] = useState({
    titulo: '',
    descripcion: '',
    estado: 'Activo', 
    fecha_vencimiento: ''
  });

  //Cargar pendientes al iniciar
  useEffect(() => {
    obtenerPendientes();
  }, []);

  const obtenerPendientes = async () => {
    const { data, error } = await supabase
      .from('pendientes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error al cargar:", error.message);
    else setListaPendientes(data);
  };

  // Crear nuevo pendiente
  const agregarPendiente = async (e) => {
    e.preventDefault();
    if (!nuevoPendiente.titulo || !nuevoPendiente.fecha_vencimiento) {
      alert("Título y fecha son obligatorios");
      return;
    }

    const { error } = await supabase.from('pendientes').insert([nuevoPendiente]);

    if (error) alert("Error: " + error.message);
    else {
      setNuevoPendiente({ titulo: '', descripcion: '', estado: 'Activo', fecha_vencimiento: '' });
      obtenerPendientes();
    }
  };

  // Editar estado de un pendiente existente
  const actualizarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('pendientes')
      .update({ estado: nuevoEstado })
      .eq('id_pendiente', id);

    if (error) alert("No se pudo actualizar: " + error.message);
    else obtenerPendientes(); // Refrescar vista
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
      
      {/* FORMULARIO */}
      <section style={{ marginBottom: '40px', borderBottom: '1px solid #ccc', paddingBottom: '40px' }}>
        <h3>Guardar Pendientes</h3>
        <form onSubmit={agregarPendiente} style={{ display: 'grid', gap: '10px' }}>
          <input 
            type="text" placeholder="Título" value={nuevoPendiente.titulo}
            onChange={(e) => setNuevoPendiente({...nuevoPendiente, titulo: e.target.value})}
          />
          <textarea 
            placeholder="Descripción" value={nuevoPendiente.descripcion}
            onChange={(e) => setNuevoPendiente({...nuevoPendiente, descripcion: e.target.value})}
          />
          <input 
            type="date" value={nuevoPendiente.fecha_vencimiento}
            onChange={(e) => setNuevoPendiente({...nuevoPendiente, fecha_vencimiento: e.target.value})}
          />
          <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>
            Guardar Tarea
          </button>
        </form>
      </section>
      {/* Lista de pendientes */}
      <section>
        <h3>Lista de Pendientes</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #2563eb' }}>
              <th>Título</th>
              <th>Vencimiento</th>
              <th>| Estado</th>
            </tr>
          </thead>
          <tbody>
            {listaPendientes.map((p) => (
              <tr key={p.id_pendiente} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 0' }}>
                  <strong>{p.titulo}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>{p.descripcion}</div>
                </td>
                <td>{p.fecha_vencimiento}</td>
                <td>
                  <select 
                    value={p.estado} 
                    onChange={(e) => actualizarEstado(p.id_pendiente, e.target.value)}
                    style={{ 
                      padding: '5px', 
                      borderRadius: '4px',
                      backgroundColor: p.estado === 'finalizado' ? '#dcfce7' : '#fff'
                    }}
                  >
                    <option value="Activo">Activo</option>
                    <option value="elaborando">Elaborando</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Pendientes;