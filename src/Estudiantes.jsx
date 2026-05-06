import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [modal, setModal] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  const [form, setForm] = useState({
    id_estudiante: "",
    nombre: "",
    apellido: "",
    telefono: "",
    id_curso: ""
  });

  const [errores, setErrores] = useState({});
  const [tipoModal, setTipoModal] = useState("insertar");

  useEffect(() => {
    obtenerEstudiantes();
    obtenerCursos();
  }, []);

  const obtenerEstudiantes = async () => {
    const { data } = await supabase
      .from("estudiantes")
      .select("*, cursos(nombre)");
    setEstudiantes(data || []);
  };

  const obtenerCursos = async () => {
    const { data } = await supabase.from("cursos").select("*");
    setCursos(data || []);
  };

  const validar = () => {
    const err = {};
    if (!form.nombre) err.nombre = "El nombre es obligatorio";
    if (!form.apellido) err.apellido = "El apellido es obligatorio";
    if (!form.telefono) err.telefono = "El teléfono es obligatorio";
    if (!form.id_curso) err.id_curso = "Seleccione un curso";
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;

    const datos = {
      nombre: form.nombre,
      apellido: form.apellido,
      telefono: form.telefono,
      id_curso: form.id_curso
    };

    if (tipoModal === "insertar") {
      await supabase.from("estudiantes").insert([datos]);
    } else {
      await supabase
        .from("estudiantes")
        .update(datos)
        .eq("id_estudiante", form.id_estudiante);
    }

    setModal(false);
    obtenerEstudiantes();
  };

  const eliminar = async () => {
    await supabase
      .from("estudiantes")
      .delete()
      .eq("id_estudiante", form.id_estudiante);

    setModalEliminar(false);
    obtenerEstudiantes();
  };

  const abrirModal = (est = null, tipo = "insertar") => {
    setForm(
      est || {
        nombre: "",
        apellido: "",
        telefono: "",
        id_curso: ""
      }
    );
    setTipoModal(tipo);
    setErrores({});
    setModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Gestión de Estudiantes</h2>

      <button onClick={() => abrirModal()}>
        + Agregar Estudiante
      </button>

      <br /><br />

      {/* TABLA */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#2563eb", color: "white" }}>
            <tr>
              <th style={{ padding: "12px" }}>#</th>
              <th style={{ padding: "12px" }}>Nombre</th>
              <th style={{ padding: "12px" }}>Apellido</th>
              <th style={{ padding: "12px" }}>Teléfono</th>
              <th style={{ padding: "12px" }}>Curso</th>
              <th style={{ padding: "12px" }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {estudiantes.map((est, i) => (
              <tr
                key={est.id_estudiante}
                style={{
                  textAlign: "center",
                  backgroundColor: i % 2 === 0 ? "#f9fafb" : "white"
                }}
              >
                <td style={{ padding: "12px" }}>{i + 1}</td>
                <td style={{ padding: "12px" }}>{est.nombre}</td>
                <td style={{ padding: "12px" }}>{est.apellido}</td>
                <td style={{ padding: "12px" }}>{est.telefono}</td>
                <td style={{ padding: "12px" }}>{est.cursos?.nombre}</td>

                <td style={{ padding: "12px" }}>
                  <button onClick={() => abrirModal(est, "editar")}>
                    ✏️
                  </button>

                  <button
                    onClick={() => {
                      setForm(est);
                      setModalEliminar(true);
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
            <h3>{tipoModal === "insertar" ? "Agregar" : "Editar"} Estudiante</h3>

            {["nombre", "apellido", "telefono"].map((campo) => (
              <div key={campo}>
                <input
                  name={campo}
                  placeholder={campo}
                  value={form[campo] || ""}
                  onChange={handleChange}
                />
                {errores[campo] && <span role="alert">{errores[campo]}</span>}
              </div>
            ))}

            <select name="id_curso" onChange={handleChange} value={form.id_curso || ""}>
              <option value="">Seleccione curso</option>
              {cursos.map(c => (
                <option key={c.id_curso} value={c.id_curso}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {errores.id_curso && <span role="alert">{errores.id_curso}</span>}

            <br /><br />

            <button onClick={guardar}>Guardar</button>
            <button onClick={() => setModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modalEliminar && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
            <p>¿Eliminar estudiante {form.nombre}?</p>
            <button onClick={eliminar}>Si</button>
            <button onClick={() => setModalEliminar(false)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Estudiantes;