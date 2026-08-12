// Matches the backend's response envelope (see app.ts error/success handlers).
export interface ApiSuccessEnvelope<T> {
  status: number;
  data?: T;
  message?: string;
}

export interface ApiErrorEnvelope {
  status: number;
  errorCode: string;
  message: string;
  data: null;
}

// Matches recipeService's list results (GET /recipes, GET /recipes/own).
export interface PaginatedResult<T> {
  data: T[];
  page: number;
  perPage: number;
  totalItems: number;
}
