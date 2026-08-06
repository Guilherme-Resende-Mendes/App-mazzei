export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

export function resolvePagination(
  page?: number,
  perPage?: number,
): PaginationParams {
  const safePage = page && page > 0 ? Math.floor(page) : DEFAULT_PAGE;
  const safePerPage =
    perPage && perPage > 0
      ? Math.min(Math.floor(perPage), MAX_PER_PAGE)
      : DEFAULT_PER_PAGE;

  return { page: safePage, perPage: safePerPage };
}

export function toSkip({ page, perPage }: PaginationParams): number {
  return (page - 1) * perPage;
}

export function buildPaginated<T>(
  items: T[],
  total: number,
  { page, perPage }: PaginationParams,
): Paginated<T> {
  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}
