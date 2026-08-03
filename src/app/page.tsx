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
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 13h-2v-2h2zm0-4h-2V7h2z" />
              </svg>
            }
          />
        </div>
      </main>
    </div>
  );
}