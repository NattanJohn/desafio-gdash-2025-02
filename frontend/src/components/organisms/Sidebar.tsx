import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { SidebarContent } from "../molecules/SidebarContent";
import { useSidebar } from "@/contexts/SidebarContext";
import { useState } from "react";

type Props = { logout: () => void };

export function Sidebar({ logout }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { collapsed, toggleCollapse } = useSidebar();
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <>
      <aside
        className={`
          hidden md:flex flex-col fixed left-0 top-0 h-screen
          bg-white border-r border-gray-200 shadow-xl z-40
          transition-all duration-300
          ${collapsed ? "w-20" : "w-72"}
        `}
      >
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            onClick={toggleCollapse}
            className="p-2 h-auto text-gray-500 hover:bg-gray-100"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        <SidebarContent logout={logout} />
      </aside>

      <div className="md:hidden p-4 fixed top-0 left-0 z-50">
        {!isMenuOpen && (
          <Button variant="outline" onClick={toggleMenu} className="shadow-md">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300
          ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        onClick={toggleMenu}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div
          className={`fixed top-0 left-0 h-full bg-white shadow-2xl w-72
            transform transition-transform duration-300
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end p-4 pb-0">
            <Button
              variant="ghost"
              onClick={toggleMenu}
              className="p-2 h-auto text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="px-4">
            <SidebarContent
              logout={logout}
              isMobile={true}
              closeMenu={toggleMenu}
            />
          </div>
        </div>
      </div>
    </>
  );
}
