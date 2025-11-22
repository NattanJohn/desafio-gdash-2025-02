import { LayoutDashboard, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/atoms/button";

type Props = {
  logout: () => void;
  isMobile?: boolean;
  closeMenu?: () => void;
};

export function SidebarContent({ logout, isMobile = false, closeMenu }: Props) {
  return (
    <div className={`flex flex-col h-full ${isMobile ? "p-4" : "p-0"}`}>
      <h2 className="text-3xl font-extrabold text-indigo-600 mb-10 flex items-center gap-2">
        GDASH
      </h2>

      <nav className="grow space-y-2">
        <a
          href="/"
          onClick={isMobile ? closeMenu : undefined}
          className="flex items-center gap-3 p-3 rounded-lg bg-indigo-100 text-indigo-700 font-bold transition-colors shadow-md"
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </a>

        <a
          href="/users"
          onClick={isMobile ? closeMenu : undefined}
          className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
          Usuários (Falta)
        </a>

        <a
          href="/external-api"
          onClick={isMobile ? closeMenu : undefined}
          className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
          Explorar API (Opcional)
        </a>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <Button
          onClick={() => {
            logout();
            if (isMobile && closeMenu) closeMenu();
          }}
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
}
