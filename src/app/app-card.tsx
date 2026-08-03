import Link from "next/link";

type AppCardProps = {
  name: string;
  description: string;
  href: string;
  gradient: string;
  icon: React.ReactNode;
};

export function AppCard({ name, description, href, gradient, icon }: AppCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 active:scale-95"
    >
      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
        {icon}
      </div>
      <div className="text-center">
        <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {name}
        </span>
        <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {description}
        </span>
      </div>
    </Link>
  );
}