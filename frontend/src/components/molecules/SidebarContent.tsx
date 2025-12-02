import { LayoutDashboard, LogOut, Rocket, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "@/contexts/SidebarContext";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  logout: () => void;
  isMobile?: boolean;
  closeMenu?: () => void;
};

export function SidebarContent({ logout, isMobile = false, closeMenu }: Props) {
  const { pathname } = useLocation();
  const { collapsed } = useSidebar();
  const effectiveCollapsed = isMobile ? false : collapsed;

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    const alignment = effectiveCollapsed
      ? "justify-center"
      : "items-center gap-3";

    const base = [
      "flex",
      alignment,
      "p-3 rounded-lg font-medium transition-colors",
    ].join(" ");

    if (isActive)
      return `${base} bg-indigo-50 dark:bg-indigo-900 dark:text-white text-indigo-700 font-bold`;
    return `${base} text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800`;
  };

  const textClass = `
    transition-all duration-300 overflow-hidden whitespace-nowrap
    ${effectiveCollapsed ? "opacity-0 w-0" : "opacity-100 w-[120px]"}
  `;

  return (
    <div className={`flex flex-col h-full ${isMobile ? "p-4" : "p-0"}`}>
      <div
        className={`flex flex-col items-center justify-center transition-all duration-300 mb-6 ${
          effectiveCollapsed ? "h-20" : "h-28"
        }`}
      >
        <h2
          className={`text-3xl font-extrabold text-neutral-900 dark:text-white transition-opacity duration-300 ${
            effectiveCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          GDash
        </h2>

        <div
          className={`
            mt-3 transition-all
            ${effectiveCollapsed ? "scale-90" : "scale-100"}
          `}
        >
          <ThemeToggle />
        </div>
      </div>

      <nav className="grow space-y-2">
        <Link
          className={getLinkClasses("/")}
          to="/"
          onClick={isMobile ? closeMenu : undefined}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className={textClass}>Dashboard</span>
        </Link>

        <Link
          className={getLinkClasses("/users")}
          to="/users"
          onClick={isMobile ? closeMenu : undefined}
        >
          <Users className="h-5 w-5" />
          <span className={textClass}>Usuários</span>
        </Link>

        <Link
          className={getLinkClasses("/external-api")}
          to="/external-api"
          onClick={isMobile ? closeMenu : undefined}
        >
          <Rocket className="h-5 w-5" />
          <span className={textClass}>SpaceX API</span>
        </Link>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            logout();
            if (isMobile && closeMenu) closeMenu();
          }}
          className={`
    flex w-full text-red-500 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-900 hover:text-red-700 hover:bg-red-50
    ${effectiveCollapsed ? "justify-center" : "items-center gap-3"}
    p-3 rounded-lg font-medium transition-colors
  `}
        >
          <LogOut className="h-5 w-5" />
          <span className={textClass}>Sair</span>
        </Link>
      </div>
    </div>
  );
}

export default SidebarContent;
