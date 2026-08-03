export type HistorialPeso = {
  fecha: string;
  peso: number;
  repeticiones: number;
};

export type Ejercicio = {
  idEjercicio: string;
  nombreEjercicio: string;
  peso: number;
  repeticiones: number;
  grupoMuscular: string;
  historialPesos: HistorialPeso[];
};

export type Carrera = {
  idCarrera: string;
  fecha: string;
  distanciaKm: number;
  duracionMin: number;
  ritmoPorKm: string;
};
