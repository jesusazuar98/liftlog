import { AppCard } from "@/app/app-card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black p-4 sm:p-6">
      <header className="pt-12 pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white">
          MyApps
        </h1>
        <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
          Tus aplicaciones personales en un solo lugar
        </p>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AppCard
            name="LiftLog"
            description="Seguimiento de ejercicios"
            href="/liftlog"
            gradient="from-red-500 to-rose-600"
            icon={<span className="text-3xl">🏋️</span>}
          />
          <AppCard
            name="Running"
            description="Registro de carreras"
            href="/running"
            gradient="from-emerald-500 to-green-600"
            icon={<span className="text-3xl">🏃</span>}
          />
        </div>
      </main>
    </div>
  );
}