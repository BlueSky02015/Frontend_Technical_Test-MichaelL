export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number = 500, code: string = "UNKNOWN_ERROR") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export interface ListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
