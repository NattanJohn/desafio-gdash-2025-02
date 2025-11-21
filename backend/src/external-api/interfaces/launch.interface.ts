export interface SpaceXLaunch {
  id: string;
  mission_name: string;
  date_utc: string;
  rocket: string; // ID
  details: string | null;
  success: boolean | null;
  links: {
    patch: {
      small: string | null;
    };
    webcast: string | null;
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
