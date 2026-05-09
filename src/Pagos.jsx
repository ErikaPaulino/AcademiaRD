import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import "./estilos.css";

const MONTO_MITAD = 5000;
const MONTO_COMPLETO = 10000;

function formatMoney(valor) {
  return `RD$ ${Number(valor || 0).toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function getMes(fecha) {
  return String(fecha || "").slice(0, 7);
}

function Pagos() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [idEstudiante, setIdEstudiante] = useState("");
  const [monto, setMonto] = useState(MONTO_MITAD);
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const { data: estudiantesData, error: errorEstudiantes } = await supabase
      .from("estudiantes")
      .select("*, cursos(nombre)")
      .order("nombre", { ascending: true });

    const { data: pagosData, error: errorPagos } = await supabase
      .from("pagos")
      .select("*, estudiantes(nombre, apellido, cursos(nombre))")
      .order("fecha_pago", { ascending: false })
      .order("created_at", { ascending: false });

    if (errorEstudiantes || errorPagos) {
      setMensaje("No se pudieron cargar los datos. Revisa la conexión con Supabase.");
      return;
    }

    setEstudiantes(estudiantesData || []);
    setPagos(pagosData || []);
  };

  const mesSeleccionado = useMemo(() => getMes(fechaPago), [fechaPago]);

  const pagosEstudiante = useMemo(() => {
    if (!idEstudiante) return [];
    return pagos.filter((p) => String(p.id_estudiante) === String(idEstudiante));
  }, [pagos, idEstudiante]);

  const pagosDelMes = useMemo(() => {
    return pagosEstudiante.filter((p) => getMes(p.fecha_pago) === mesSeleccionado);
  }, [pagosEstudiante, mesSeleccionado]);

  const pagosRecibidosDelMes = useMemo(() => {
    return pagosDelMes.filter((p) => p.estado !== "pendiente");
  }, [pagosDelMes]);

  const resumenSeleccionado = useMemo(() => {
    const totalPagadoMes = pagosRecibidosDelMes.reduce(
      (acc, p) => acc + Number(p.monto || 0),
      0
    );

    // El pendiente se calcula por diferencia para evitar que registros duplicados
    // de estado "pendiente" dañen el resumen del estudiante.
    const pendienteMes = Math.max(MONTO_COMPLETO - totalPagadoMes, 0);

    const totalHistorico = pagosEstudiante
      .filter((p) => p.estado !== "pendiente")
      .reduce((acc, p) => acc + Number(p.monto || 0), 0);

    let estadoMes = "pendiente";
    if (totalPagadoMes >= MONTO_COMPLETO) estadoMes = "pagado";
    else if (totalPagadoMes > 0) estadoMes = "parcial";

    return { totalPagadoMes, pendienteMes, totalHistorico, estadoMes };
  }, [pagosRecibidosDelMes, pagosEstudiante]);

  const normalizarPendientesDelMes = async (idAlumno, mes, totalRecibidoActualizado) => {
    const pendientesDelMes = pagos
      .filter((p) => String(p.id_estudiante) === String(idAlumno))
      .filter((p) => getMes(p.fecha_pago) === mes)
      .filter((p) => p.estado === "pendiente");

    if (totalRecibidoActualizado >= MONTO_COMPLETO && pendientesDelMes.length > 0) {
      const idsPendientes = pendientesDelMes.map((p) => p.id_pago);
      await supabase.from("pagos").delete().in("id_pago", idsPendientes);
      return;
    }

    if (totalRecibidoActualizado < MONTO_COMPLETO && pendientesDelMes.length > 1) {
      const idsRepetidos = pendientesDelMes.slice(1).map((p) => p.id_pago);
      await supabase.from("pagos").delete().in("id_pago", idsRepetidos);
    }
  };

  const registrarPago = async (e) => {
    e.preventDefault();
    setMensaje("");

    const montoNumerico = Number(monto);

    if (!idEstudiante) {
      setMensaje("Seleccione un estudiante.");
      return;
    }

    if (![MONTO_MITAD, MONTO_COMPLETO].includes(montoNumerico)) {
      setMensaje("El monto permitido es RD$ 5,000 o RD$ 10,000.");
      return;
    }

    setCargando(true);

    const pagosMesActuales = pagos
      .filter((p) => String(p.id_estudiante) === String(idEstudiante))
      .filter((p) => getMes(p.fecha_pago) === mesSeleccionado);

    const pagosRecibidos = pagosMesActuales.filter((p) => p.estado !== "pendiente");
    const pendientes = pagosMesActuales.filter((p) => p.estado === "pendiente");

    const totalRecibido = pagosRecibidos.reduce(
      (acc, p) => acc + Number(p.monto || 0),
      0
    );

    if (totalRecibido >= MONTO_COMPLETO) {
      setCargando(false);
      setMensaje("Este estudiante ya tiene el mes pagado completo. No se registró otro pago para evitar duplicados.");
      return;
    }

    const montoAplicado = Math.min(montoNumerico, MONTO_COMPLETO - totalRecibido);
    const totalDespuesDelPago = totalRecibido + montoAplicado;

    let errorOperacion = null;

    // Si existe un pendiente de 5,000, al recibir el segundo pago no se crea otro registro parcial.
    // Se convierte ese pendiente en pago recibido y así el mes queda completo.
    if (pendientes.length > 0 && montoAplicado === MONTO_MITAD) {
      const pendienteACompletar = pendientes[0];
      const { error } = await supabase
        .from("pagos")
        .update({
          estado: totalDespuesDelPago >= MONTO_COMPLETO ? "pagado" : "parcial",
          fecha_pago: fechaPago,
          monto: montoAplicado
        })
        .eq("id_pago", pendienteACompletar.id_pago);

      errorOperacion = error;
    } else {
      const registros = [];

      registros.push({
        id_estudiante: idEstudiante,
        monto: montoAplicado,
        fecha_pago: fechaPago,
        estado: totalDespuesDelPago >= MONTO_COMPLETO ? "pagado" : "parcial"
      });

      // Solo se crea un pendiente cuando el pago recibido todavía no completa los 10,000.
      // Ya no se insertan pendientes repetidos.
      if (totalDespuesDelPago < MONTO_COMPLETO && pendientes.length === 0) {
        registros.push({
          id_estudiante: idEstudiante,
          monto: MONTO_COMPLETO - totalDespuesDelPago,
          fecha_pago: fechaPago,
          estado: "pendiente"
        });
      }

      const { error } = await supabase.from("pagos").insert(registros);
      errorOperacion = error;
    }

    if (!errorOperacion && totalDespuesDelPago >= MONTO_COMPLETO && pagosRecibidos.length > 0) {
      const idsPagosMes = pagosRecibidos.map((p) => p.id_pago);
      const { error } = await supabase
        .from("pagos")
        .update({ estado: "pagado" })
        .in("id_pago", idsPagosMes);

      if (error) errorOperacion = error;
    }

    if (!errorOperacion) {
      await normalizarPendientesDelMes(idEstudiante, mesSeleccionado, totalDespuesDelPago);
    }

    setCargando(false);

    if (errorOperacion) {
      setMensaje("No se pudo registrar el pago: " + errorOperacion.message);
      return;
    }

    setMensaje(
      totalDespuesDelPago >= MONTO_COMPLETO
        ? "Pago completado correctamente. El mes quedó como pagado."
        : `Pago parcial registrado. Quedó ${formatMoney(MONTO_COMPLETO - totalDespuesDelPago)} pendiente por cobrar.`
    );

    cargarDatos();
  };

  const completarPendiente = async (pagoPendiente) => {
    setMensaje("");
    setCargando(true);

    const pagosMesActuales = pagos
      .filter((p) => String(p.id_estudiante) === String(pagoPendiente.id_estudiante))
      .filter((p) => getMes(p.fecha_pago) === getMes(pagoPendiente.fecha_pago));

    const totalRecibido = pagosMesActuales
      .filter((p) => p.estado !== "pendiente")
      .reduce((acc, p) => acc + Number(p.monto || 0), 0);

    const montoAplicado = Math.min(Number(pagoPendiente.monto || MONTO_MITAD), MONTO_COMPLETO - totalRecibido);
    const totalDespuesDelPago = totalRecibido + montoAplicado;

    const { error } = await supabase
      .from("pagos")
      .update({
        estado: totalDespuesDelPago >= MONTO_COMPLETO ? "pagado" : "parcial",
        fecha_pago: new Date().toISOString().slice(0, 10),
        monto: montoAplicado
      })
      .eq("id_pago", pagoPendiente.id_pago);

    if (!error && totalDespuesDelPago >= MONTO_COMPLETO) {
      const idsPagosMes = pagosMesActuales
        .filter((p) => p.estado !== "pendiente")
        .map((p) => p.id_pago);

      if (idsPagosMes.length > 0) {
        await supabase.from("pagos").update({ estado: "pagado" }).in("id_pago", idsPagosMes);
      }
    }

    setCargando(false);

    if (error) {
      setMensaje("No se pudo completar el pendiente: " + error.message);
      return;
    }

    setMensaje("Pendiente completado correctamente. El mes quedó actualizado.");
    cargarDatos();
  };

  const estadoColor = (estado) => {
    if (estado === "pagado") return "#16a34a";
    if (estado === "parcial") return "#f59e0b";
    return "#dc2626";
  };

  const TablaPagos = ({ titulo, registros, mostrarAccion = true }) => (
    <section className="seccion-lista-tareas" style={{ marginTop: "20px" }}>
      <h3 className="titulo-seccion">{titulo}</h3>

      <div style={{ overflowX: "auto" }}>
        <table className="tabla-gestion-pendientes">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {registros.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "15px" }}>
                  No hay pagos registrados.
                </td>
              </tr>
            ) : (
              registros.map((p) => (
                <tr key={p.id_pago}>
                  <td>{p.fecha_pago}</td>
                  <td>{p.estudiantes?.nombre} {p.estudiantes?.apellido}</td>
                  <td>{p.estudiantes?.cursos?.nombre || "Sin curso"}</td>
                  <td>{formatMoney(p.monto)}</td>
                  <td>
                    <span
                      style={{
                        background: estadoColor(p.estado),
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "999px",
                        textTransform: "capitalize",
                        fontWeight: "bold"
                      }}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td>
                    {mostrarAccion && p.estado === "pendiente" ? (
                      <button
                        type="button"
                        onClick={() => completarPendiente(p)}
                        disabled={cargando}
                      >
                        Completar pago
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="contenedor-principal-pendientes">
      <h2 className="titulo-seccion">Gestión de Pagos</h2>

      <section className="seccion-registro-tarea">
        <h3 className="titulo-seccion">Registrar pago del colegio</h3>

        <form onSubmit={registrarPago} className="formulario-pendientes">
          <select
            className="entrada-texto"
            value={idEstudiante}
            onChange={(e) => setIdEstudiante(e.target.value)}
          >
            <option value="">Seleccione un estudiante</option>
            {estudiantes.map((est) => (
              <option key={est.id_estudiante} value={est.id_estudiante}>
                {est.nombre} {est.apellido} - {est.cursos?.nombre || "Sin curso"}
              </option>
            ))}
          </select>

          <select
            className="entrada-texto"
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
          >
            <option value={MONTO_MITAD}>RD$ 5,000 - Pago parcial</option>
            <option value={MONTO_COMPLETO}>RD$ 10,000 - Pago completo</option>
          </select>

          <input
            className="entrada-fecha"
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
          />

          <button type="submit" className="boton-guardar-pendiente" disabled={cargando}>
            {cargando ? "Guardando..." : "Registrar pago"}
          </button>
        </form>

        {mensaje && (
          <p style={{ marginTop: "12px", fontWeight: "bold", color: "#2563eb" }}>
            {mensaje}
          </p>
        )}
      </section>

      {idEstudiante && (
        <section className="seccion-dashboard" style={{ marginTop: "20px" }}>
          <h3 className="titulo-dashboard-seccion">Área de pago del estudiante</h3>

          <div className="grid-dashboard-pro">
            <div className="card-dashboard" style={{ backgroundColor: "#16a34a" }}>
              <h4>Pagado este mes</h4>
              <p>{formatMoney(resumenSeleccionado.totalPagadoMes)}</p>
              <small>Solo ingresos recibidos</small>
            </div>

            <div className="card-dashboard" style={{ backgroundColor: "#f59e0b" }}>
              <h4>Pendiente este mes</h4>
              <p>{formatMoney(resumenSeleccionado.pendienteMes)}</p>
              <small>Calculado contra RD$ 10,000</small>
            </div>

            <div className="card-dashboard" style={{ backgroundColor: estadoColor(resumenSeleccionado.estadoMes) }}>
              <h4>Estado mensual</h4>
              <p style={{ textTransform: "capitalize" }}>{resumenSeleccionado.estadoMes}</p>
              <small>pagado, parcial o pendiente</small>
            </div>

            <div className="card-dashboard">
              <h4>Total histórico</h4>
              <p>{formatMoney(resumenSeleccionado.totalHistorico)}</p>
              <small>Todos los ingresos del estudiante</small>
            </div>
          </div>
        </section>
      )}

      {idEstudiante && (
        <TablaPagos
          titulo={`Pagos recibidos del mes (${mesSeleccionado})`}
          registros={pagosRecibidosDelMes}
          mostrarAccion={false}
        />
      )}

      {idEstudiante && (
        <TablaPagos
          titulo="Historial general del estudiante"
          registros={pagosEstudiante.filter((p) => p.estado !== "pendiente")}
          mostrarAccion={false}
        />
      )}

      {!idEstudiante && <TablaPagos titulo="Todos los pagos registrados" registros={pagos} />}
    </div>
  );
}

export default Pagos;
