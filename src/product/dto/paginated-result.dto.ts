export class PaginatedResult<T> {
  products: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}
