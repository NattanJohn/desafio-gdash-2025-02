// path: pages/ExplorePage.tsx
import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "../components/organisms/Sidebar";
import { Loader2 } from "lucide-react";
import { LaunchCard, type SpaceXLaunch } from "@/components/molecules/LaunchCard";
import { LaunchModal } from "@/components/organisms/LaunchModal";
import { SpaceXService } from "@/services/api";
import { Pagination } from "@/components/molecules/Pagination";
import { Button } from "@/components/atoms/button";
import { useAuth } from "@/contexts/useAuth";
import { useSidebar } from "@/contexts/SidebarContext";

interface SpaceXApiResponse {
  docs: SpaceXLaunch[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ExplorePage() {
  const { token, logout } = useAuth();
  const { collapsed } = useSidebar();
  const [launches, setLaunches] = useState<SpaceXLaunch[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasNext: false, hasPrev: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLaunch, setSelectedLaunch] = useState<SpaceXLaunch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLaunches = useCallback(async (pageNumber: number) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const data: SpaceXApiResponse = await SpaceXService.getLaunches(token, pageNumber, 12);
      setLaunches(data.docs);
      setPagination({ page: data.page, totalPages: data.totalPages, hasNext: data.hasNextPage, hasPrev: data.hasPrevPage });
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o serviço de dados espaciais.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLaunches(1);
  }, [fetchLaunches]);

  const handleOpenModal = (launch: SpaceXLaunch) => {
    setSelectedLaunch(launch);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    fetchLaunches(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar logout={logout} />
      <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-72"}`}>
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 md:ml-0 ml-16">Missões SpaceX</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 md:ml-0 ml-16">Explore o histórico de lançamentos — clique em um card para ver mais informações.</p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-2">
            <Button onClick={() => fetchLaunches(1)} variant="ghost">Atualizar</Button>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-600 mb-6">
            <p>{error}</p>
            <Button onClick={() => fetchLaunches(pagination.page)} variant="outline" className="mt-4 border-red-200 hover:bg-red-100">Tentar Novamente</Button>
          </div>
        )}

        {isLoading && launches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-indigo-600">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p>Carregando dados espaciais...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {launches.map((launch) => (
                <LaunchCard key={launch.id} launch={launch} onOpenDetails={handleOpenModal} />
              ))}
            </div>

            {launches.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-8 pb-8">
                <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        )}

        <LaunchModal open={isModalOpen} onClose={() => setIsModalOpen(false)} launch={selectedLaunch ?? undefined} />
      </main>
    </div>
  );
}
