export interface SpaceXRocket {
  name: string;
  height_m: number | null;
  diameter_m: number | null;
  mass_kg: number | null;
  stages: number | null;
  cost_per_launch: number | null;
  first_flight: string | null;
  images: string[];
}

export interface SpaceXLaunchpad {
  name: string;
  region: string;
  locality: string;
  latitude: number;
  longitude: number;
}

export interface SpaceXPayload {
  id: string;
  name: string;
  type: string | null;
  mass_kg: number | null;
  orbit: string | null;
}

export interface SpaceXLaunch {
  id: string;
  mission_name: string;
  date_utc: string;
  details: string | null;
  success: boolean | null;
  rocket: SpaceXRocket;
  launchpad: SpaceXLaunchpad | null;
  payloads: SpaceXPayload[];
  links: {
    patch: { small: string | null };
    webcast: string | null;
    youtube_id: string | null;
    images: string[];
  };
}

export interface PaginatedLaunches {
  docs: SpaceXLaunch[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
