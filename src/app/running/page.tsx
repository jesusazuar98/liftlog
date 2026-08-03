"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Carrera } from "@/types";

function calcularRitmo(distanciaKm: number, duracionMin: number): string {
  if (distanciaKm <= 0) return "0:00";
  const ritmo = duracionMin / distanciaKm;
  const minutos = Math.floor(ritmo);
  const segundos = Math.round((ritmo - minutos) * 60);
  return `${minutos}:${segundos.toString().padStart(2, "0")}`;
}

function formatearDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export default function RunningPage() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carreraAEliminar, setCarreraAEliminar] = useState<string | null>(null);
  const [fecha, setFecha] = useState("");
  const [distancia, setDistancia] = useState("");
  const [duracion, setDuracion] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("carreras");
    if (stored) {
      setCarreras(JSON.parse(stored));
    }
  }, []);

  const guardarCarreras = (nuevas: Carrera[]) => {
    setCarreras(nuevas);
    localStorage.setItem("carreras", JSON.stringify(nuevas));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const distanciaNum = parseFloat(distancia);
    const duracionNum = parseFloat(duracion);
    const nueva: Carrera = {
      idCarrera: Date.now().toString(),
      fecha: fecha || new Date().toISOString().split("T")[0],
      distanciaKm: distanciaNum,
      duracionMin: duracionNum,
      ritmoPorKm: calcularRitmo(distanciaNum, duracionNum),
    };
    guardarCarreras([...carreras, nueva]);
    setFecha("");
    setDistancia("");
    setDuracion("");
    setShowModal(false);
  };

  const confirmarEliminar = (id: string) => {
    setCarreraAEliminar(id);
    setShowDeleteModal(true);
  };

  const eliminarCarrera = () => {
    if (carreraAEliminar) {
      guardarCarreras(carreras.filter((c) => c.idCarrera !== carreraAEliminar));
      setShowDeleteModal(false);
      setCarreraAEliminar(null);
    }
  };

  const totalKm = useMemo(() => carreras.reduce((sum, c) => sum + c.distanciaKm, 0), [carreras]);
  const totalMin = useMemo(() => carreras.reduce((sum, c) => sum + c.duracionMin, 0), [carreras]);
  const ritmoMedio = useMemo(() => {
    if (totalKm <= 0) return "0:00";
    return calcularRitmo(totalKm, totalMin);
  }, [totalKm, totalMin]);

  const carrerasOrdenadas = [...carreras].sort((a, b) => b.fecha.localeCompare(a.fecha));

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
          Volver a MyApps
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white">
          🏃 Running
        </h1>
        <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
          Registra tus carreras y sigue tu progreso
        </p>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full">
        {carreras.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total km</p>
                <p className="text-2xl font-bold text-black dark:text-white mt-1">
                  {totalKm.toFixed(1)} km
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Tiempo total</p>
                <p className="text-2xl font-bold text-black dark:text-white mt-1">
                  {formatearDuracion(totalMin)}
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Carreras</p>
                <p className="text-2xl font-bold text-black dark:text-white mt-1">
                  {carreras.length}
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Ritmo medio</p>
                <p className="text-2xl font-bold text-black dark:text-white mt-1">
                  {ritmoMedio} /km
                </p>
              </div>
            </div>

            {carreras.length > 1 && (
              <div className="mb-8">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[...carreras].sort((a, b) => a.fecha.localeCompare(b.fecha)).map((c) => ({
                        fecha: new Date(c.fecha + "T00:00:00").toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        }),
                        km: c.distanciaKm,
                      }))}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-700" />
                      <XAxis
                        dataKey="fecha"
                        tick={{ fontSize: 11, fill: "#71717a" }}
                        stroke="#a1a1aa"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#71717a" }}
                        stroke="#a1a1aa"
                        tickLine={false}
                        axisLine={false}
                        domain={["auto", "auto"]}
                        tickFormatter={(value) => `${value}km`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid #e4e4e7",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "var(--foreground)",
                        }}
                        formatter={(value) => [`${value} km`, "Distancia"]}
                        labelStyle={{ color: "#71717a", fontWeight: 500 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="km"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {carreras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <span className="text-4xl">🏃</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              No hay carreras registradas aún
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {carrerasOrdenadas.map((carrera) => (
              <div
                key={carrera.idCarrera}
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                      {new Date(carrera.fecha + "T00:00:00").toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="flex gap-4 mt-2">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-emerald-500">{carrera.distanciaKm} km</span>
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {formatearDuracion(carrera.duracionMin)}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-blue-500">{carrera.ritmoPorKm}</span> /km
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => confirmarEliminar(carrera.idCarrera)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Eliminar carrera"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794 1.357-1.428 2.891-1.628zM12 9a1 1 0 100-2 1 1 0 000 2zm-3.5 5.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center"
        aria-label="Añadir carrera"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
      </button>

      {showDeleteModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="modal-content relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Confirmar eliminación
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-6">
              ¿Estás seguro de que quieres eliminar esta carrera? Esta acción no se puede deshacer.
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
                onClick={eliminarCarrera}
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
              Nueva carrera
            </h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Distancia (km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={distancia}
                  onChange={(e) => setDistancia(e.target.value)}
                  placeholder="Ej: 5.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  placeholder="Ej: 30"
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
                  className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors"
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