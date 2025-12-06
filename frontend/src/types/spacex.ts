import type { SpaceXLaunch } from "@/components/molecules/LaunchCard";

export interface SpaceXApiResponse {
  docs: SpaceXLaunch[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}