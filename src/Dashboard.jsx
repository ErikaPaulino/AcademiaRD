import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./estilos.css";

function Dashboard() {

  /*
 
  ESTADOS CRUDOS (DATOS DE LA BD)
 
  */
  const [pendientes, setPendientes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [gastos, setGastos] = useState([]);

  // CURSOS (VIENE DESDE SUPABASE)
  const [cursos, setCursos] = useState([]);

  /*

  RESUMEN
  
  */
  const [resumen, setResumen] = useState({});

  /*
  
  ALERTAS DEL SISTEMA
  
  */
  const [alertas, setAlertas] = useState([]);

  /*
 
  CARGA INICIAL
  
  */
  useEffect(() => {
    cargarDatos();
  }, []);

  /*
  
  FUNCIÓN PRINCIPAL 
  
  */
  const cargarDatos = async () => {

    // CONSULTAS A BASE DE DATOS
    const { data: p } = await supabase.from("pendientes").select("*");
    const { data: e } = await supabase.from("estudiantes").select("*");
    const { data: a } = await supabase.from("asistencias").select("*");
    const { data: pa } = await supabase.from("pagos").select("*");
    const { data: g } = await supabase.from("egresos").select("*");

    //  CURSOS
    const { data: c } = await supabase.from("cursos").select("*");

    // GUARDAR EN ESTADO
    setPendientes(p || []);
    setEstudiantes(e || []);
    setAsistencias(a || []);
    setPagos(pa || []);
    setGastos(g || []);
    setCursos(c || []); // 🆕 cursos reales

    const hoy = new Date();

    /*
    
    PENDIENTES (TAREAS)
    
    */

    // VENCIDO
    const vencidos = (p || []).filter(x =>
      new Date(x.fecha_vencimiento) < hoy &&
      x.estado !== "finalizado"
    ).length;

    /*
    
    ASISTENCIAS
    
    */

    const presentes = a?.filter(x => x.estado === "presente").length || 0;
    const ausentes = a?.filter(x => x.estado === "ausente").length || 0;
    const excusa = a?.filter(x => x.estado === "excusa").length || 0;
    const feriados = a?.filter(x => x.estado === "feriado").length || 0;

    const totalAsistencias = presentes + ausentes + excusa;

    // porcentaje real de asistencia
    const porcentajeAsistencia =
      totalAsistencias > 0
        ? ((presentes / totalAsistencias) * 100).toFixed(1)
        : 0;
        
        /*
ESTUDIANTES INACTIVOS

*/

const ausenciasPorEstudiante = {};

// Recorremos todas las asistencias
(a || []).forEach(registro => {

  // Solo contamos si es ausencia
  if (registro.estado === "ausente") {

    const id = registro.id_estudiante;

    // Si no existe en el objeto, lo inicializamos
    if (!ausenciasPorEstudiante[id]) {
      ausenciasPorEstudiante[id] = 0;
    }

    // Sumamos una ausencia
    ausenciasPorEstudiante[id]++;
  }
});

const estudiantesInactivos = Object.values(ausenciasPorEstudiante)
  .filter(totalAusencias => totalAusencias > 15)
  .length;


    /*

  
    FINANZAS
    
    */

    const totalPagos = pa?.reduce(
      (acc, x) => acc + Number(x.monto || 0),
      0
    ) || 0;

    const totalGastos = g?.reduce(
      (acc, x) => acc + Number(x.monto || 0),
      0
    ) || 0;

    const balance = totalPagos - totalGastos;

    const totalDeudor = pa?.filter(x => x.estado === "pendiente")
      .reduce((acc, x) => acc + Number(x.monto || 0), 0) || 0;

   /*
ALERTAS 
*/

const nuevasAlertas = [];

/*
TAREAS VENCIDAS 
*/
const tareasVencidas = (p || []).filter(x =>
  new Date(x.fecha_vencimiento) < hoy &&
  x.estado !== "finalizado"
);

if (tareasVencidas.length > 0) {
  nuevasAlertas.push({
    tipo: "danger",
    mensaje: `🚨 ${tareasVencidas.length} tarea(s) vencida(s). Acción requerida inmediata.`
  });
}

/*
ASISTENCIA BAJA
*/
if (porcentajeAsistencia < 70) {
  nuevasAlertas.push({
    tipo: "warning",
    mensaje: `⚠ Asistencia baja (${porcentajeAsistencia}%).`
  });
}

/*
MÁS AUSENTES QUE PRESENTES 
*/
if (ausentes > presentes) {
  nuevasAlertas.push({
    tipo: "danger",
    mensaje: "🚨 Hay más estudiantes ausentes que presentes."
  });
}

/*

DEUDA PENDIENTE
*/
if (totalDeudor > 0) {
  nuevasAlertas.push({
    tipo: "warning",
    mensaje: `⚠ Deuda pendiente: RD$ ${totalDeudor}`
  });
}

/*
BALANCE NEGATIVO 
*/
if (balance < 0) {
  nuevasAlertas.push({
    tipo: "danger",
    mensaje: "🚨 El sistema está en pérdidas (balance negativo)."
  });
}

/*
SIN ALERTAS
*/
if (nuevasAlertas.length === 0) {
  nuevasAlertas.push({
    tipo: "success",
    mensaje: "✅ Todo está funcionando correctamente."
  });
}

setAlertas(nuevasAlertas);

    /*
    
    RESUMEN FINAL
    
    */
    setResumen({
      estudiantes: e?.length || 0,
      presentes,
      ausentes,
      excusa,
      feriados,
      inactivos: estudiantesInactivos,
      porcentajeAsistencia,
      pendientes: p?.length || 0,
      vencidos,
      pagos: totalPagos,
      gastos: totalGastos,
      balance,
      deudor: totalDeudor
    });
  };

  /*
  
  COLORES DE ESTADO 
  
  */
  const colorEstado = (estado) => {
    switch (estado) {
      case "Activo": return "#2563eb";
      case "elaborando": return "#f59e0b";
      case "finalizado": return "#16a34a";
      case "cancelado": return "#dc2626";
      default: return "#6b7280";
    }
  };

  /*
  
  INTERFAZ
  
  */
  return (
    <div className="contenedor-principal-pendientes">

      <h2 className="titulo-seccion">Dashboard</h2>

      {/* ALERTAS  */}
      {alertas.length > 0 && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            background: "#fff3cd",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}
        >
          {alertas.map((a, i) => (
  <div
    key={i}
    className={`alerta-dashboard ${a.tipo}`}
  >
    {a.mensaje}
  </div>
))}
        </div>
      )}

      {/* 
   SECCIÓN ACADÉMICA*/}

<section
  className="seccion-dashboard"
  aria-label="Resumen académico"
>

  <h3 className="titulo-dashboard-seccion">
    📚 Resumen Académico
  </h3>

  <div className="grid-dashboard-pro">

    {/* TOTAL ESTUDIANTES */}
    <div className="card-dashboard">
      <h4>Estudiantes</h4>

      <p>{resumen.estudiantes}</p>

      <small>
        Total registrados en el sistema
      </small>
    </div>

    {/* PRESENTES */}
    <div
      className="card-dashboard"
      style={{ backgroundColor: "#16a34a" }}
    >
      <h4>Presentes</h4>

      <p>{resumen.presentes}</p>

      <small>
        Estudiantes presentes hoy
      </small>
    </div>

    {/* AUSENTES */}
    <div
      className="card-dashboard"
      style={{ backgroundColor: "#dc2626" }}
    >
      <h4>Ausentes</h4>

      <p>{resumen.ausentes}</p>

      <small>
        Estudiantes ausentes
      </small>
    </div>

    {/* EXCUSA */}
    <div
      className="card-dashboard"
      style={{ backgroundColor: "#f59e0b" }}
    >
      <h4>Excusas</h4>

      <p>{resumen.excusa}</p>

      <small>
        Ausencias justificadas
      </small>
    </div>

    {/* INACTIVOS */}
    <div
      className="card-dashboard"
      style={{ backgroundColor: "#6b7280" }}
    >
      <h4>Inactivos</h4>

      <p>{resumen.inactivos}</p>

      <small>
        Más de 15 ausencias registradas
      </small>
    </div>

  </div>
</section>

{/* 
   SECCIÓN FINANCIERA */}

<section
  className="seccion-dashboard"
  aria-label="Resumen financiero"
>

  <h3 className="titulo-dashboard-seccion">
    💰 Finanzas
  </h3>

  <div className="grid-dashboard-pro">

    {/* PAGOS */}
    <div
      className="card-dashboard"
      style={{ backgroundColor: "#16a34a" }}
    >
      <h4>Pagos</h4>

      <p>RD$ {resumen.pagos}</p>

      <small>
        Ingresos totales registrados
      </small>
    </div>

    {/* DEUDAS */}
    <div
      className="card-dashboard"
      style={{ backgroundColor: "#f59e0b" }}
    >
      <h4>Pagos pendientes</h4>

      <p>RD$ {resumen.deudor}</p>

      <small>
        Dinero pendiente por cobrar
      </small>
    </div>

    {/* BALANCE */}
    <div className="card-dashboard">

      <h4>Balance</h4>

      <p>RD$ {resumen.balance}</p>

      <small>
        Diferencia entre ingresos y gastos
      </small>
    </div>

  </div>
</section>

{/* 
   SECCIÓN OPERATIVA
 */}

<section
  className="seccion-dashboard"
  aria-label="Gestión escolar"
>

  <h3 className="titulo-dashboard-seccion">
    📋 Gestión Escolar
  </h3>

  <div className="grid-dashboard-pro">

    {/* PENDIENTES */}
    <div className="card-dashboard">

      <h4>Pendientes</h4>

      <p>{resumen.pendientes}</p>

      <small>
        Tareas registradas
      </small>
    </div>

    {/* VENCIDOS */}
    <div
      className="card-dashboard"
      style={{ backgroundColor: "#dc2626" }}
    >
      <h4>Vencidos</h4>

      <p>{resumen.vencidos}</p>

      <small>
        Tareas fuera de fecha
      </small>
    </div>

    {/* ASISTENCIA */}
    <div className="card-dashboard">

      <h4>Asistencia %</h4>

      <p>{resumen.porcentajeAsistencia}%</p>

      <small>
        Porcentaje general de asistencia
      </small>
    </div>

  </div>
</section>

      {/* 
    CURSOS  */}
<h3 className="titulo-seccion">Cursos disponibles</h3>

<div
  role="region"
  aria-label="Lista de cursos disponibles"
  style={{
    background: "#f8fafc",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb"
  }}
>

  {cursos.length > 0 ? (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >

      {cursos.map((curso) => (
        <li
          key={curso.id}
          style={{
            padding: "12px 15px",
            background: "white",
            borderRadius: "8px",
            borderLeft: "4px solid #2563eb",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}
          aria-label={`Curso ${curso.nombre}`}
        >

          {/* Nombre del curso */}
          <strong style={{ fontSize: "15px" }}>
            📘 {curso.nombre}
          </strong>

          {/* Descripción */}
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            {curso.descripcion}
          </span>

        </li>
      ))}

    </ul>
  ) : (
    <p style={{ color: "#6b7280" }}>
      No hay cursos disponibles en la base de datos
    </p>
  )}

</div>

      {/* 
          TABLA DE PENDIENTES
       */}
      <h3 className="titulo-seccion">Últimos Pendientes</h3>

      <table className="tabla-gestion-pendientes" role="table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {pendientes.slice(0, 5).map(p => (
            <tr key={p.id_pendiente}>
              <td>{p.titulo}</td>
              <td>{p.fecha_vencimiento}</td>
              <td>
                <span
                  style={{
                    backgroundColor: colorEstado(p.estado),
                    color: "white",
                    padding: "5px",
                    borderRadius: "5px"
                  }}
                >
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
