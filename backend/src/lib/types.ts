// Shared request/response types for the API

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Auth context attached to Hono requests by the auth middleware
export type AuthUser = {
  dbUserId: string;
  email: string;
};

// Vibe search AI response structure
export type VibeFilters = {
  area?: string | undefined;
  cuisine?: string | undefined;
  vibeTags?: string[] | undefined;
  busyLevel?: "dead" | "moderate" | "packed" | undefined;
  viewStatus?: "clear" | "blocked" | "na" | undefined;
};
