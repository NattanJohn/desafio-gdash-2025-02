export function parseApiError(err: unknown): { message: string; status?: number } {
  if (err instanceof Error) {
    try {
      const json = JSON.parse(err.message);
      return {
        message: json.message ?? err.message,
        status: json.statusCode ?? json.status
      };
    } catch {
      return { message: err.message };
    }
  }

  if (typeof err === "string") {
    try {
      const json = JSON.parse(err);
      return {
        message: json.message ?? err,
        status: json.statusCode ?? json.status
      };
    } catch {
      return { message: err };
    }
  }

  return { message: "Unknown error" };
}
