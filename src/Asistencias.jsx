import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Asistencias() {
  const [estudiantes, setEstudiantes] = useState([]);

  useEffect(() => {
    obtenerEstudiantes();
  }, []);

  async function obtenerEstudiantes() {
    const { data, error } = await supabase
      .from("estudiantes")
      .select("*");

    if (error) {
      console.log(error);
    } else {
      setEstudiantes(data);
    }
  }

  async function marcarAsistencia(id_estudiante, estado) {
    const { error } = await supabase
      .from("asistencias")
      .insert([
        {
          id_estudiante,
          fecha: new Date(),
          estado
        }
      ]);

    if (error) {
      console.log(error);
    } else {
      alert("Asistencia guardada");
    }
  }

  return (
    <div style={{
      padding: "20px",
      maxWidth: "900px",
      margin: "0 auto"
    }}>
      <h2 style={{
        marginBottom: "20px",
        textAlign: "center"
      }}>
        Registro de Asistencia
      </h2>

      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse"
        }}>
          <thead style={{
            backgroundColor: "#2563eb",
            color: "white"
          }}>
            <tr>
              <th style={{ padding: "12px" }}>Estudiante</th>
              <th style={{ padding: "12px" }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {estudiantes.map((est, index) => (
              <tr 
                key={est.id_estudiante}
                style={{
                  textAlign: "center",
                  backgroundColor: index % 2 === 0 ? "#f9fafb" : "white"
                }}
              >
                <td style={{ padding: "12px" }}>
                  {est.nombre} {est.apellido}
                </td>

                <td style={{ padding: "12px" }}>
                  <button 
                    onClick={() => marcarAsistencia(est.id_estudiante, "presente")}
                    style={{
                      marginRight: "10px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#16a34a",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    ✔ Presente
                  </button>

                  <button 
                    onClick={() => marcarAsistencia(est.id_estudiante, "ausente")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#dc2626",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    ✖ Ausente
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Asistencias;