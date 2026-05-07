import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [modal, setModal] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalCurso, setModalCurso] = useState(false);

  const [nombreCurso, setNombreCurso] = useState("");
  const [tipoModal, setTipoModal] = useState("insertar");

  const [form, setForm] = useState({
    id_estudiante: "",
    nombre: "",
    apellido: "",
    telefono: "",
    id_curso: ""
  });

  const [errores, setErrores] = useState({});

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
    const { data } = await supabase
      .from("cursos")
      .select("*");

    setCursos(data || []);
  };

  const guardarCurso = async () => {
    if (!nombreCurso) return alert("Ingrese un curso");

    await supabase
      .from("cursos")
      .insert([{ nombre: nombreCurso }]);

    setNombreCurso("");
    setModalCurso(false);
    obtenerCursos();
  };

  const validar = () => {
    const err = {};

    ["nombre", "apellido", "telefono"].forEach((campo) => {
      if (!form[campo]) {
        err[campo] = `El ${campo} es obligatorio`;
      }
    });

    if (!form.id_curso) {
      err.id_curso = "Seleccione un curso";
    }

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
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const estiloModal = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  const cajaModal = {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    minWidth: "300px"
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", color: "#2563eb" }}>Gestión de Estudiantes</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => abrirModal()}>  <FaPlus/></button>
        <button onClick={() => setModalCurso(true)}> <FaPlus /> Agregar Curso </button>
      </div>

      <div style={{
        background: "white",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#2563eb", color: "white" }}>
            <tr>
              {["#", "Nombre", "Apellido", "Teléfono", "Curso", "Acciones"]
                .map((t) => (
                  <th key={t} style={{ padding: "12px" }}>
                    {t}
                  </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {estudiantes.map((est, i) => (
              <tr
                key={est.id_estudiante}
                style={{
                  textAlign: "center",
                  background: i % 2 === 0 ? "#f9fafb" : "white"
                }}
              >
                <td style={{ padding: "12px" }}>{i + 1}</td>
                <td>{est.nombre}</td>
                <td>{est.apellido}</td>
                <td>{est.telefono}</td>
                <td>{est.cursos?.nombre}</td>

                <td>
                  <button onClick={() => abrirModal(est, "editar")}> <FaEdit /> </button>

                  <button onClick={() => {
                    setForm(est);
                    setModalEliminar(true);
                  }}><FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ESTUDIANTE */}
      {modal && (
        <div style={estiloModal}>
          <div style={cajaModal}>
            <h3>
              {tipoModal === "insertar"
                ? "Agregar"
                : "Editar"} Estudiante
            </h3>

            {["nombre", "apellido", "telefono"].map((campo) => (
              <div key={campo}>
                <input
                  name={campo}
                  placeholder={campo}
                  value={form[campo] || ""}
                  onChange={handleChange}
                />

                {errores[campo] && (
                  <span role="alert">{errores[campo]}</span>
                )}
              </div>
            ))}

            <br/>

            <select
              name="id_curso"
              value={form.id_curso || ""}
              onChange={handleChange}
            >
              <option value="">Seleccione curso</option>

              {cursos.map((c) => (
                <option
                  key={c.id_curso}
                  value={c.id_curso}
                >
                  {c.nombre}
                </option>
              ))}
            </select>

            {errores.id_curso && (
              <span role="alert">{errores.id_curso}</span>
            )}
            <br/><br/>

            <button onClick={guardar}>Guardar</button>
            <button onClick={() => setModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* MODAL CURSO */}
      {modalCurso && (
        <div style={estiloModal}>
          <div style={cajaModal}>
            <h3>Agregar Curso</h3>

            <input
              placeholder="Nombre del curso"
              value={nombreCurso}
              onChange={(e) =>
                setNombreCurso(e.target.value)
              }
            />
            <br/><br/>

            <button onClick={guardarCurso}>Guardar</button>
            <button onClick={() => setModalCurso(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modalEliminar && (
        <div style={estiloModal}>
          <div style={cajaModal}>
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