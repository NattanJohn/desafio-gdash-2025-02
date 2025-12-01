import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'dark') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full w-10 h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}