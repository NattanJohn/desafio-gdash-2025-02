import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { SidebarContent } from "../molecules/SidebarContent";

type Props = { logout: () => void };

export function Sidebar({ logout }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <>
      <div className="hidden md:flex flex-col w-96 bg-white border-r border-gray-200 min-h-screen shadow-xl p-4">
        <SidebarContent logout={logout} />
      </div>

      <div className="md:hidden p-4 fixed top-0 left-0 z-40">
        {!isMenuOpen && (
          <Button variant="outline" onClick={toggleMenu} className="shadow-md">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300
          ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={toggleMenu}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >

        <div
          className={`
            fixed top-0 left-0 h-full bg-white shadow-2xl w-72
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
