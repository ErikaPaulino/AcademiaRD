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

  const [busqueda, setBusqueda] = useState("");

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

  const limpiarForm = () => {
    setForm({
      id_estudiante: "",
      nombre: "",
      apellido: "",
      telefono: "",
      id_curso: ""
    });
  };

  const obtenerEstudiantes = async () => {
    const { data, error } = await supabase
      .from("estudiantes")
      .select("*, cursos(nombre)");

    if (error) {
      alert("Error cargando estudiantes");
      console.log(error);
      return;
    }

    setEstudiantes(data || []);
  };

  const obtenerCursos = async () => {
    const { data, error } = await supabase
      .from("cursos")
      .select("*");

    if (error) {
      console.log(error);
      return;
    }

    setCursos(data || []);
  };

  const guardarCurso = async () => {
    if (!nombreCurso.trim()) {
      return alert("Ingrese un curso");
    }

    const { error } = await supabase
      .from("cursos")
      .insert([
        {
          nombre: nombreCurso,
          id_nivel: 1
        }
      ]);

    if (error) {
      alert("Error guardando curso");
      console.log(error);
      return;
    }

    alert("Curso agregado");

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

    if (!/^[0-9]+$/.test(form.telefono)) {
      err.telefono = "El teléfono solo debe contener números";
    }

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

    let error;

    if (tipoModal === "insertar") {
      ({ error } = await supabase
        .from("estudiantes")
        .insert([datos]));
    } else {
      ({ error } = await supabase
        .from("estudiantes")
        .update(datos)
        .eq("id_estudiante", form.id_estudiante));
    }

    if (error) {
      alert("Error guardando estudiante");
      console.log(error);
      return;
    }

    alert(
      tipoModal === "insertar"
        ? "Estudiante agregado"
        : "Estudiante actualizado"
    );

    setModal(false);

    limpiarForm();

    obtenerEstudiantes();
  };

  const eliminar = async () => {
    const { error } = await supabase
      .from("estudiantes")
      .delete()
      .eq("id_estudiante", form.id_estudiante);

    if (error) {
      alert("Error eliminando estudiante");
      console.log(error);
      return;
    }

    alert("Estudiante eliminado");

    setModalEliminar(false);

    obtenerEstudiantes();
  };

  const abrirModal = (est = null, tipo = "insertar") => {
    if (est) {
      setForm({
        id_estudiante: est.id_estudiante,
        nombre: est.nombre,
        apellido: est.apellido,
        telefono: est.telefono,
        id_curso: est.id_curso
      });
    } else {
      limpiarForm();
    }

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

  const estudiantesFiltrados = estudiantes.filter((e) =>
    `${e.nombre} ${e.apellido}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

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
      <h2 style={{ textAlign: "center", color: "#2563eb" }}>
        Gestión de Estudiantes
      </h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap"
        }}
      >
        <button onClick={() => abrirModal()}>
          <FaPlus /> Agregar Estudiante
        </button>

        <button onClick={() => setModalCurso(true)}>
          <FaPlus /> Agregar Curso
        </button>

        <input
          type="text"
          placeholder="Buscar estudiante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#2563eb", color: "white" }}>
            <tr>
              {[
                "#",
                "Nombre",
                "Apellido",
                "Teléfono",
                "Curso",
                "Acciones"
              ].map((t) => (
                <th key={t} style={{ padding: "12px" }}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {estudiantesFiltrados.map((est, i) => (
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
                  <button
                    onClick={() => abrirModal(est, "editar")}
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => {
                      setForm({
                        id_estudiante: est.id_estudiante,
                        nombre: est.nombre
                      });

                      setModalEliminar(true);
                    }}
                  >
                    <FaTrash />
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
                : "Editar"}{" "}
              Estudiante
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
                  <span role="alert">
                    {errores[campo]}
                  </span>
                )}

                <br/>
                <br/>
              </div>
            ))}

            <select
              name="id_curso"
              value={form.id_curso || ""}
              onChange={handleChange}
            >
              <option value="">
                Seleccione curso
              </option>

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
              <span role="alert">
                {errores.id_curso}
              </span>
            )}

            <br />
            <br />

            <button onClick={guardar}>
              Guardar
            </button>

            <button
              onClick={() => {
                setModal(false);
                limpiarForm();
              }}
            >
              Cancelar
            </button>
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

            <br />
            <br />

            <button onClick={guardarCurso}>
              Guardar
            </button>

            <button
              onClick={() => setModalCurso(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modalEliminar && (
        <div style={estiloModal}>
          <div style={cajaModal}>
            <p>
              ¿Eliminar estudiante {form.nombre}?
            </p>

            <button onClick={eliminar}>
              Sí
            </button>

            <button
              onClick={() =>
                setModalEliminar(false)
              }
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Estudiantes;