"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MuscleGroupIcon } from "@/app/muscle-group-icon";
import { Ejercicio } from "@/types";

const muscleGroups = [
  { name: "Pecho", key: "chest", gradient: "from-red-500 to-rose-600" },
  { name: "Espalda", key: "back", gradient: "from-blue-500 to-indigo-600" },
  { name: "Hombros", key: "shoulders", gradient: "from-orange-500 to-amber-600" },
  { name: "Bíceps", key: "biceps", gradient: "from-purple-500 to-violet-600" },
  { name: "Tríceps", key: "triceps", gradient: "from-pink-500 to-fuchsia-600" },
  { name: "Pierna", key: "legs", gradient: "from-emerald-500 to-green-600" },
];

export default function LiftLogPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ejercicios");
    if (stored) {
      setEjercicios(JSON.parse(stored));
    }
    setMounted(true);
  }, []);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ejerciciosImportados = JSON.parse(content);
        
        if (Array.isArray(ejerciciosImportados)) {
          const stored = localStorage.getItem("ejercicios");
          const ejerciciosExistentes = stored ? JSON.parse(stored) : [];
          const idsExistentes = new Set(ejerciciosExistentes.map((e: Ejercicio) => e.idEjercicio));
         const ejerciciosNuevos = ejerciciosImportados.filter((e: Ejercicio) => !idsExistentes.has(e.idEjercicio));
          const ejerciciosCombinados = [...ejerciciosExistentes, ...ejerciciosNuevos];
          
          localStorage.setItem("ejercicios", JSON.stringify(ejerciciosCombinados));
          alert(`Se importaron ${ejerciciosNuevos.length} ejercicios correctamente`);
          window.location.reload();
        } else {
          alert("El archivo JSON no tiene el formato correcto");
        }
      } catch (error) {
        alert("Error al leer el archivo JSON");
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
          LiftLog
        </h1>
        <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
          Selecciona un grupo muscular
        </p>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {muscleGroups.map((group) => {
            const count = ejercicios.filter((e) => e.grupoMuscular === group.key).length;
            return (
              <Link
                key={group.key}
                href={`/liftlog/grupo/${group.key}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 active:scale-95 relative"
              >
                {mounted && count > 0 && (
                  <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold flex items-center justify-center">
                    {count}
                  </span>
                )}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${group.gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                  <MuscleGroupIcon type={group.key} />
                </div>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {group.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div style={{ marginTop: '24px' }} className="action-buttons mb-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              const stored = localStorage.getItem("ejercicios");
              const ejercicios = stored ? JSON.parse(stored) : [];
              const blob = new Blob([JSON.stringify(ejercicios, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "ejercicios.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 13h-2v-2h2zm0-4h-2V7h2z"/>
            </svg>
            Exportar ejercicios
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z"/>
            </svg>
            Importar ejercicios
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </main>
    </div>
  );
}