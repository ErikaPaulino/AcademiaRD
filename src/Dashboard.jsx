/*
  ================================
  IMPORTACIONES
  ================================

  React:
  - useState → permite manejar estados (datos dinámicos)
  - useEffect → permite ejecutar código automáticamente cuando el componente se carga

  supabase:
  - Cliente de conexión a la base de datos
  - Fue configurado previamente en supabaseClient.js

  estilos.css:
  - Archivo donde están definidos los estilos visuales del sistema
*/
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./estilos.css";

/*
  ================================
  COMPONENTE DASHBOARD
  ================================

  Este componente representa el panel principal de visualización del sistema.

  Su función es:
  - Consultar datos desde la base de datos
  - Procesarlos
  - Mostrar un resumen visual (tarjetas + tabla)

  IMPORTANTE:
  Este componente es SOLO DE LECTURA (no modifica datos)
*/
function Dashboard() {

  /*
    ================================
    ESTADOS
    ================================

    pendientes:
    - Almacena todos los registros obtenidos desde la tabla "pendientes"

    resumen:
    - Almacena métricas calculadas a partir de esos datos
    - Se usa para mostrar información en las tarjetas del dashboard
  */
  const [pendientes, setPendientes] = useState([]);

  const [resumen, setResumen] = useState({
    total: 0,
    activos: 0,
    elaborando: 0,
    finalizados: 0,
    cancelados: 0,
    vencidos: 0
  });

  /*
    ================================
    useEffect (CICLO DE VIDA)
    ================================

    Este hook se ejecuta automáticamente cuando el componente se monta (se carga en pantalla).

    [] → significa que solo se ejecuta UNA VEZ
  */
  useEffect(() => {
    obtenerPendientes();
  }, []);

  /*
    ================================
    FUNCIÓN: obtenerPendientes
    ================================

    - Consulta la base de datos (Supabase)
    - Obtiene todos los registros de la tabla "pendientes"
    - Ordena los datos por fecha de creación (los más recientes primero)
    - Calcula estadísticas
  */
  const obtenerPendientes = async () => {

    /*
      Consulta a Supabase:

      .from("pendientes") → tabla a consultar
      .select("*") → traer todas las columnas
      .order(...) → ordenar resultados
    */
    const { data, error } = await supabase
      .from("pendientes")
      .select("*")
      .order("created_at", { ascending: false });

    /*
      Manejo de errores:
      Si ocurre un error en la consulta, se muestra en consola
      y se detiene la ejecución
    */
    if (error) {
      console.error(error.message);
      return;
    }

    /*
      Guardamos los datos en el estado
      Esto permite que React los use para renderizar
    */
    setPendientes(data);

    /*
      ================================
      PROCESAMIENTO DE DATOS
      ================================

      A partir de los datos obtenidos, se calculan métricas
    */

    // Fecha actual del sistema (para comparar vencimientos)
    const hoy = new Date();

    /*
      Cada filtro recorre el array y cuenta elementos que cumplen una condición
      .length → devuelve la cantidad
    */
    const activos = data.filter(p => p.estado === "Activo").length;

    const elaborando = data.filter(p => p.estado === "elaborando").length;

    const finalizados = data.filter(p => p.estado === "finalizado").length;

    const cancelados = data.filter(p => p.estado === "cancelado").length;

    /*
      TAREAS VENCIDAS:

      Condición:
      - Fecha de vencimiento menor que hoy
      - Y que NO esté finalizada

      new Date(...) → convierte texto a fecha real para comparar
    */
    const vencidos = data.filter(p => {
      return (
        new Date(p.fecha_vencimiento) < hoy &&
        p.estado !== "finalizado"
      );
    }).length;

    /*
      Guardamos todas las métricas en el estado "resumen"
      Esto actualizará automáticamente la interfaz
    */
    setResumen({
      total: data.length,
      activos,
      elaborando,
      finalizados,
      cancelados,
      vencidos
    });
  };

  /*
    ================================
    FUNCIÓN: obtenerColorEstado
    ================================

    Devuelve un color según el estado del pendiente

    Se usa para mejorar la visualización en la tabla
  */
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case "Activo":
        return "#2563eb"; // azul
      case "elaborando":
        return "#f59e0b"; // amarillo
      case "finalizado":
        return "#16a34a"; // verde
      case "cancelado":
        return "#dc2626"; // rojo
      default:
        return "#6b7280"; // gris por defecto
    }
  };

  /*
    ================================
    RENDERIZADO (INTERFAZ)
    ================================

    Aquí se define lo que el usuario ve en pantalla
  */
  return (
    <div className="contenedor-principal-pendientes">

      {/* TÍTULO */}
      <h2 className="titulo-seccion">Dashboard General</h2>

      {/* ================================
          TARJETAS DE RESUMEN
         ================================ */}
      <div style={{
        display: "flex",
        gap: "15px",
        flexWrap: "wrap",
        marginBottom: "30px"
      }}>

        {/* Cada tarjeta muestra una métrica */}
        <div className="card-dashboard">
          <h4>Total</h4>
          <p>{resumen.total}</p>
        </div>

        <div className="card-dashboard">
          <h4>Activos</h4>
          <p>{resumen.activos}</p>
        </div>

        <div className="card-dashboard">
          <h4>En Proceso</h4>
          <p>{resumen.elaborando}</p>
        </div>

        <div className="card-dashboard">
          <h4>Finalizados</h4>
          <p>{resumen.finalizados}</p>
        </div>

        <div className="card-dashboard">
          <h4>Cancelados</h4>
          <p>{resumen.cancelados}</p>
        </div>

        {/* Tarjeta especial para tareas vencidas */}
        <div className="card-dashboard" style={{ backgroundColor: "#dc2626" }}>
          <h4>Vencidos</h4>
          <p>{resumen.vencidos}</p>
        </div>

      </div>

      {/* ================================
          TABLA DE DATOS
         ================================ */}

      <h3 className="titulo-seccion">Últimos Pendientes</h3>

      <table className="tabla-gestion-pendientes">

        {/* Encabezados */}
        <thead>
          <tr>
            <th>Título</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>

        {/* Cuerpo de la tabla */}
        <tbody>

          {/*
            .slice(0,5) → limita a 5 registros
            .map() → recorre los datos y genera filas dinámicamente
          */}
          {pendientes.slice(0, 5).map((p) => (
            <tr key={p.id_pendiente}>

              <td>{p.titulo}</td>
              <td>{p.fecha_vencimiento}</td>

              {/* Estado con color dinámico */}
              <td>
                <span style={{
                  backgroundColor: obtenerColorEstado(p.estado),
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  fontSize: "0.8rem"
                }}>
                  {p.estado}
                </span>
              </td>

            </tr>
          ))}

        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;