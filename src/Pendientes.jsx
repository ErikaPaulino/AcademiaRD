import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './estilos.css';

function Pendientes() {
  const [listaPendientes, setListaPendientes] = useState([]);
  const [nuevoPendiente, setNuevoPendiente] = useState({
    titulo: '',
    descripcion: '',
    estado: 'Activo', 
    fecha_vencimiento: ''
  });

  // Cargar pendientes al iniciar
  useEffect(() => {
    obtenerPendientes();
  }, []);

  // Función para obtener pendientes desde Supabase

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

  // formulario para agregar nuevos pendientes y tabla para mostrar los pendientes actuales con opcion de cambiar su estado

  return (
    <div className="contenedor-principal-pendientes">
      
      {/* formulario */}
      <section className="seccion-registro-tarea">
        <h3 className="titulo-seccion">Gestion de Tareas y Pendientes</h3>
        
        <form onSubmit={agregarPendiente} className="formulario-pendientes">
          <input 
            className="entrada-texto"
            type="text" 
            placeholder="Título de la tarea" 
            value={nuevoPendiente.titulo}
            onChange={(e) => setNuevoPendiente({...nuevoPendiente, titulo: e.target.value})}
          />
          
          <textarea 
            className="area-descripcion"
            placeholder="Detalles o notas de la tarea..." 
            value={nuevoPendiente.descripcion}
            onChange={(e) => setNuevoPendiente({...nuevoPendiente, descripcion: e.target.value})}
          />
          
          <input 
            className="entrada-fecha"
            type="date" 
            value={nuevoPendiente.fecha_vencimiento}
            onChange={(e) => setNuevoPendiente({...nuevoPendiente, fecha_vencimiento: e.target.value})}
          />
          
          <button type="submit" className="boton-guardar-pendiente">
            Guardar en la Academia
          </button>
        </form>
      </section>

      {/* tabla de tareas */}
      <section className="seccion-lista-tareas">
        <h3 className="titulo-seccion">Pendientes y Tareas</h3>
        
        <table className="tabla-gestion-pendientes">
          <thead>
            <tr>
              <th>Información de la Tarea</th>
              <th>Vencimiento</th>
              <th>Estado</th>
            </tr>
          </thead>
          
          <tbody>
            {listaPendientes.map((p) => (
              <tr key={p.id_pendiente} className="fila-tarea">
                <td className="celda-info-principal">
                  <span className="titulo-tarea-lista">{p.titulo}</span>
                  <p className="descripcion-tarea-lista">{p.descripcion}</p>
                </td>
                
                <td className="celda-fecha">{p.fecha_vencimiento}</td>
                
                <td className="celda-acciones">
                  <select 
                    className={`selector-estado-tarea ${p.estado === 'finalizado' ? 'tarea-completada' : ''}`}
                    value={p.estado} 
                    onChange={(e) => actualizarEstado(p.id_pendiente, e.target.value)}
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
