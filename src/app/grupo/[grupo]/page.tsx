"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Ejercicio, HistorialPeso } from "@/types";

const muscleGroupNames: Record<string, string> = {
  chest: "Pecho",
  back: "Espalda",
  shoulders: "Hombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  legs: "Pierna",
};

export default function GrupoPage() {
  const params = useParams();
  const grupo = params.grupo as string;
  const nombreGrupo = muscleGroupNames[grupo] || grupo;
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [ejercicioHistorial, setEjercicioHistorial] = useState<Ejercicio | null>(null);
  const [ejercicioAEliminar, setEjercicioAEliminar] = useState<string | null>(null);
  const [ejercicioEditar, setEjercicioEditar] = useState<Ejercicio | null>(null);
  const [nombre, setNombre] = useState("");
  const [peso, setPeso] = useState("");
  const [repeticiones, setRepeticiones] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("ejercicios");
    if (stored) {
      const parsed: Ejercicio[] = JSON.parse(stored);
      const migrados = parsed.map((e) => ({
        ...e,
        historialPesos: e.historialPesos || [{ fecha: new Date().toISOString().split("T")[0], peso: e.peso, repeticiones: e.repeticiones }],
      }));
      setEjercicios(migrados);
    }
  }, []);

  const guardarEjercicios = (nuevos: Ejercicio[]) => {
    setEjercicios(nuevos);
    localStorage.setItem("ejercicios", JSON.stringify(nuevos));
  };

  const hoy = () => new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pesoNum = parseFloat(peso);
    const repsNum = parseInt(repeticiones);
    const fechaHoy = hoy();
    const nuevo: Ejercicio = {
      idEjercicio: Date.now().toString(),
      nombreEjercicio: nombre,
      peso: pesoNum,
      repeticiones: repsNum,
      grupoMuscular: grupo,
      historialPesos: [{ fecha: fechaHoy, peso: pesoNum, repeticiones: repsNum }],
    };
    guardarEjercicios([...ejercicios, nuevo]);
    setNombre("");
    setPeso("");
    setRepeticiones("");
    setShowModal(false);
  };

  const abrirHistorial = (ejercicio: Ejercicio) => {
    setEjercicioHistorial(ejercicio);
    setShowHistoryModal(true);
  };

  const abrirEditar = (ejercicio: Ejercicio) => {
    setEjercicioEditar(ejercicio);
    setNombre(ejercicio.nombreEjercicio);
    setPeso(ejercicio.peso.toString());
    setRepeticiones(ejercicio.repeticiones.toString());
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ejercicioEditar) return;
    const pesoNum = parseFloat(peso);
    const repsNum = parseInt(repeticiones);
    const fechaHoy = hoy();
    const historialActual = ejercicioEditar.historialPesos || [];
    const ultimoRegistro = historialActual.length > 0 ? historialActual[historialActual.length - 1] : null;
    let nuevoHistorial: HistorialPeso[];
    if (ultimoRegistro && ultimoRegistro.fecha === fechaHoy) {
      nuevoHistorial = [...historialActual.slice(0, -1), { fecha: fechaHoy, peso: pesoNum, repeticiones: repsNum }];
    } else {
      nuevoHistorial = [...historialActual, { fecha: fechaHoy, peso: pesoNum, repeticiones: repsNum }];
    }
    const actualizado: Ejercicio = {
      idEjercicio: ejercicioEditar.idEjercicio,
      nombreEjercicio: nombre,
      peso: pesoNum,
      repeticiones: repsNum,
      grupoMuscular: ejercicioEditar.grupoMuscular,
      historialPesos: nuevoHistorial,
    };
    guardarEjercicios(ejercicios.map((e) => (e.idEjercicio === actualizado.idEjercicio ? actualizado : e)));
    setShowEditModal(false);
    setEjercicioEditar(null);
    setNombre("");
    setPeso("");
    setRepeticiones("");
  };

  const confirmarEliminar = (id: string) => {
    setEjercicioAEliminar(id);
    setShowDeleteModal(true);
  };

  const eliminarEjercicio = () => {
    if (ejercicioAEliminar) {
      guardarEjercicios(ejercicios.filter((e) => e.idEjercicio !== ejercicioAEliminar));
      setShowDeleteModal(false);
      setEjercicioAEliminar(null);
    }
  };

  const ejerciciosGrupo = ejercicios.filter((e) => e.grupoMuscular === grupo);
  const ejerciciosFiltrados = busqueda.trim()
    ? ejerciciosGrupo.filter((e) =>
        e.nombreEjercicio.toLowerCase().includes(busqueda.toLowerCase())
      )
    : ejerciciosGrupo;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black p-4 sm:p-6">
      <header className="pt-12 pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
          </svg>
          Volver
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white">
          {nombreGrupo}
        </h1>
        <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
          Ejercicios de {nombreGrupo.toLowerCase()}
        </p>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full">
        {ejerciciosGrupo.length > 0 && (
          <div className="relative mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
            >
              <path
                fillRule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {ejerciciosGrupo.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-zinc-400 dark:text-zinc-500">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 13h-2v-2h2zm0-4h-2V7h2z" />
              </svg>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              No hay ejercicios añadidos aún
            </p>
          </div>
        ) : ejerciciosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-zinc-400 dark:text-zinc-500">
                <path
                  fillRule="evenodd"
                  d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              No se encontraron ejercicios con ese nombre
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ejerciciosFiltrados.map((ejercicio) => (
              <div
                key={ejercicio.idEjercicio}
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => abrirHistorial(ejercicio)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                      {ejercicio.nombreEjercicio}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {ejercicio.peso} kg · {ejercicio.repeticiones} reps
                    </p>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => abrirEditar(ejercicio)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      aria-label="Editar ejercicio"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                        <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); confirmarEliminar(ejercicio.idEjercicio); }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="Eliminar ejercicio"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794 1.357-1.428 2.891-1.628zM12 9a1 1 0 100-2 1 1 0 000 2zm-3.5 5.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center"
        aria-label="Añadir ejercicio"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
      </button>

      {showHistoryModal && ejercicioHistorial && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHistoryModal(false)} />
          <div className="modal-content relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                {ejercicioHistorial.nombreEjercicio}
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Historial de pesos
            </p>
            <div className="max-h-80 overflow-y-auto space-y-3">
              {[...ejercicioHistorial.historialPesos].reverse().map((registro, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700"
                >
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {new Date(registro.fecha + "T00:00:00").toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {registro.peso} kg · {registro.repeticiones} reps
                  </span>
                </div>
              ))}
            </div>
            <div className="modal-buttons mt-6">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <div className="modal-content relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Editar ejercicio
            </h2>
            <form onSubmit={handleEditSubmit}>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Nombre del ejercicio
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Press de banca"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ej: 60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Repeticiones
                </label>
                <input
                  type="number"
                  min="1"
                  value={repeticiones}
                  onChange={(e) => setRepeticiones(e.target.value)}
                  placeholder="Ej: 10"
                  required
                />
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="modal-content relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Confirmar eliminación
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-6">
              ¿Estás seguro de que quieres eliminar este ejercicio? Esta acción no se puede deshacer.
            </p>
            <div className="modal-buttons">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={eliminarEjercicio}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="modal-content relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Nuevo ejercicio
            </h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Nombre del ejercicio
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Press de banca"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ej: 60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Repeticiones
                </label>
                <input
                  type="number"
                  min="1"
                  value={repeticiones}
                  onChange={(e) => setRepeticiones(e.target.value)}
                  placeholder="Ej: 10"
                  required
                />
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}