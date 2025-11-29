// path: components/organisms/LaunchModal.tsx
import React from "react";
import { Dialog, DialogContent } from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { MapPin, Film, ImageIcon } from "lucide-react";
import type { SpaceXLaunch } from "@/components/molecules/LaunchCard";
import { StatusBadge } from "../atoms/status-badge";

interface LaunchModalProps {
  open: boolean;
  onClose: () => void;
  launch?: SpaceXLaunch | null;
}

export const LaunchModal: React.FC<LaunchModalProps> = ({
  open,
  onClose,
  launch,
}) => {
  if (!launch) return null;

  const primaryImage =
    launch.links?.images?.[0] || launch.links?.patch?.small || null;

  const images = launch.links?.images?.length
    ? launch.links.images
    : primaryImage
    ? [primaryImage]
    : [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="
          max-w-6xl   /* modal mais largo */
          w-full
          max-h-[90vh] /* modal mais alto */
          rounded-xl
          p-0
          overflow-hidden
        "
      >
        <div className="w-full bg-black/5 dark:bg-gray-900">
          {images.length ? (
            <img
              src={images[0]}
              alt={launch.mission_name}
              className="w-full h-44 md:h-56 object-contain bg-black/10 dark:bg-gray-800"
            />
          ) : (
            <div className="w-full h-52 md:h-64 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{launch.mission_name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {new Date(launch.date_utc).toLocaleString("pt-BR")}
              </p>
            </div>

            <StatusBadge success={launch.success} />
          </div>

          <div className="mt-4 text-gray-700 dark:text-gray-300">
            {launch.details ?? "Sem descrição disponível."}
          </div>

          {/* ROCKET + LAUNCHPAD */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* ROCKET */}
            <div>
              <h4 className="text-xs text-gray-500 uppercase">Foguete</h4>
              <p className="font-medium mt-1">{launch.rocket?.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                Altura: {launch.rocket?.height_m ?? "N/A"} m · Estágios:{" "}
                {launch.rocket?.stages ?? "N/A"}
              </p>
            </div>

            <div>
              <h4 className="text-xs text-gray-500 uppercase">Launchpad</h4>
              {launch.launchpad ? (
                <>
                  <p className="font-medium mt-1">{launch.launchpad.name}</p>
                  <p className="text-xs text-gray-500">
                    {launch.launchpad.locality} · {launch.launchpad.region}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {launch.launchpad.latitude?.toFixed(4)},{" "}
                      {launch.launchpad.longitude?.toFixed(4)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Informação não disponível
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-xs text-gray-500 uppercase">
              Payloads ({launch.payloads?.length ?? 0})
            </h4>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {launch.payloads?.length ? (
                launch.payloads.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {p.type} · {p.mass_kg ?? "N/A"} kg
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Nenhum payload listado.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            {launch.links?.youtube_id && (
              <div className="p-4">
                <a
                  href={`https://www.youtube.com/watch?v=${launch.links.youtube_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white font-semibold"
                >
                  <Film className="w-4 h-4" />
                  Assistir no YouTube
                </a>
              </div>
            )}
            <Button variant="ghost" onClick={onClose} className="ml-auto">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
