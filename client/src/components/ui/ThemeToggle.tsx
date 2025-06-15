import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../../contexts/ThemeContext";
import { cn } from "../../lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary",
        theme === "dark" ? "bg-muted hover:bg-muted/80" : "bg-primary/10 hover:bg-primary/20",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <SunIcon className="h-5 w-5 text-amber-500" />
      ) : (
        <MoonIcon className="h-5 w-5 text-indigo-400" />
      )}
    </button>
  );
} 