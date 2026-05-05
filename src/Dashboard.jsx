/*
==================================================
DASHBOARD PRO - SISTEMA ESCOLAR
==================================================

Este dashboard:

✔ Lee datos de múltiples tablas (Supabase)
✔ Calcula métricas reales del sistema
✔ Genera porcentajes y alertas
✔ NO modifica datos (solo lectura)

TABLAS USADAS:
- estudiantes
- asistencias
- pendientes
- pagos
- egresos

NOTA IMPORTANTE:
Los nombres de campos deben coincidir con tu BD:
- pagos.monto
- pagos.estado (pagado / pendiente)  ← si no existe, ajusta
- asistencias.estado (presente / ausente / excusa / feriado)
*/

import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./estilos.css";

function Dashboard() {

  /*
  ==================================================
  ESTADOS CRUDOS (DATOS DE LA BD)
  ==================================================
  */
  const [pendientes, setPendientes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [gastos, setGastos] = useState([]);

  /*
  ==================================================
  RESUMEN PROCESADO
  ==================================================
  */
  const [resumen, setResumen] = useState({});

  /*
  ==================================================
  ALERTAS DEL SISTEMA
  ==================================================
  */
  const [alertas, setAlertas] = useState([]);

  /*
  ==================================================
  CARGA INICIAL
  ==================================================
  */
  useEffect(() => {
    cargarDatos();
  }, []);

  /*
  ==================================================
  FUNCIÓN PRINCIPAL
  ==================================================
  */
  const cargarDatos = async () => {

    // 🔹 CONSULTAS
    const { data: p } = await supabase.from("pendientes").select("*");
    const { data: e } = await supabase.from("estudiantes").select("*");
    const { data: a } = await supabase.from("asistencias").select("*");
    const { data: pa } = await supabase.from("pagos").select("*");
    const { data: g } = await supabase.from("egresos").select("*");

    // 🔹 GUARDAR CRUDOS
    setPendientes(p || []);
    setEstudiantes(e || []);
    setAsistencias(a || []);
    setPagos(pa || []);
    setGastos(g || []);

    const hoy = new Date();

    /*
    ==================================================
    PENDIENTES
    ==================================================
    */
    const vencidos = (p || []).filter(x =>
      new Date(x.fecha_vencimiento) < hoy &&
      x.estado !== "finalizado"
    ).length;

    /*
    ==================================================
    ASISTENCIAS
    ==================================================
    */
    const presentes = a?.filter(x => x.estado === "presente").length || 0;
    const ausentes = a?.filter(x => x.estado === "ausente").length || 0;
    const excusa = a?.filter(x => x.estado === "excusa").length || 0;
    const feriados = a?.filter(x => x.estado === "feriado").length || 0;

    const totalAsistencias = presentes + ausentes + excusa;

    // 📊 PORCENTAJE DE ASISTENCIA
    const porcentajeAsistencia =
      totalAsistencias > 0
        ? ((presentes / totalAsistencias) * 100).toFixed(1)
        : 0;

    /*
    ==================================================
    FINANZAS
    ==================================================
    */

    // 💵 PAGOS (ingresos)
    const totalPagos = pa?.reduce(
      (acc, x) => acc + Number(x.monto || 0),
      0
    ) || 0;

    // 💸 GASTOS
    const totalGastos = g?.reduce(
      (acc, x) => acc + Number(x.monto || 0),
      0
    ) || 0;

    // 📊 BALANCE
    const balance = totalPagos - totalGastos;

    // 🔴 DEUDOR (pagos pendientes)
    const totalDeudor = pa?.filter(x => x.estado === "pendiente")
      .reduce((acc, x) => acc + Number(x.monto || 0), 0) || 0;

    /*
    ==================================================
    ALERTAS INTELIGENTES
    ==================================================
    */
    const nuevasAlertas = [];

    if (vencidos > 0) {
      nuevasAlertas.push(`⚠ Hay ${vencidos} tareas vencidas`);
    }

    if (ausentes > presentes) {
      nuevasAlertas.push("⚠ Hay más ausentes que presentes");
    }

    if (totalDeudor > 0) {
      nuevasAlertas.push(`⚠ Deuda pendiente: RD$ ${totalDeudor}`);
    }

    if (balance < 0) {
      nuevasAlertas.push("⚠ El balance es negativo");
    }

    if (porcentajeAsistencia < 70) {
      nuevasAlertas.push("⚠ Baja asistencia general");
    }

    setAlertas(nuevasAlertas);

    /*
    ==================================================
    GUARDAR RESUMEN
    ==================================================
    */
    setResumen({
      estudiantes: e?.length || 0,
      presentes,
      ausentes,
      excusa,
      feriados,
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
  ==================================================
  COLORES DE ESTADO
  ==================================================
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
  ==================================================
  INTERFAZ
  ==================================================
  */
  return (
    <div className="contenedor-principal-pendientes">

      <h2 className="titulo-seccion">Dashboard</h2>

      {/* ================= ALERTAS ================= */}
      {alertas.length > 0 && (
        <div style={{
          background: "#fff3cd",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px"
        }}>
          {alertas.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}

      {/* ================= TARJETAS ================= */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>

        <div className="card-dashboard">
          <h4>Estudiantes</h4>
          <p>{resumen.estudiantes}</p>
        </div>

        <div className="card-dashboard" style={{ backgroundColor: "#16a34a" }}>
          <h4>Presentes</h4>
          <p>{resumen.presentes}</p>
        </div>

        <div className="card-dashboard" style={{ backgroundColor: "#dc2626" }}>
          <h4>Ausentes</h4>
          <p>{resumen.ausentes}</p>
        </div>

        <div className="card-dashboard" style={{ backgroundColor: "#f59e0b" }}>
          <h4>Excusa</h4>
          <p>{resumen.excusa}</p>
        </div>

        <div className="card-dashboard" style={{ backgroundColor: "#6b7280" }}>
          <h4>Feriados</h4>
          <p>{resumen.feriados}</p>
        </div>

        <div className="card-dashboard">
          <h4>Asistencia %</h4>
          <p>{resumen.porcentajeAsistencia}%</p>
        </div>

        <div className="card-dashboard">
          <h4>Pendientes</h4>
          <p>{resumen.pendientes}</p>
        </div>

        <div className="card-dashboard" style={{ backgroundColor: "#dc2626" }}>
          <h4>Vencidos</h4>
          <p>{resumen.vencidos}</p>
        </div>

        {/* 💰 FINANZAS */}
        <div className="card-dashboard" style={{ backgroundColor: "#16a34a" }}>
          <h4>Pagos</h4>
          <p>RD$ {resumen.pagos}</p>
        </div>

        <div className="card-dashboard" style={{ backgroundColor: "#dc2626" }}>
          <h4>Gastos</h4>
          <p>RD$ {resumen.gastos}</p>
        </div>

        <div className="card-dashboard">
          <h4>Balance</h4>
          <p>RD$ {resumen.balance}</p>
        </div>

        <div className="card-dashboard" style={{ backgroundColor: "#f59e0b" }}>
          <h4>Deuda</h4>
          <p>RD$ {resumen.deudor}</p>
        </div>

      </div>

      {/* ================= TABLA ================= */}
      <h3 className="titulo-seccion">Últimos Pendientes</h3>

      <table className="tabla-gestion-pendientes">
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
                <span style={{
                  backgroundColor: colorEstado(p.estado),
                  color: "white",
                  padding: "5px",
                  borderRadius: "5px"
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