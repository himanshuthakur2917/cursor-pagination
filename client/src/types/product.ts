export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface PaginatedResponse {
  data: Product[];
  pageInfo: PageInfo;
  totalCount: number;
}
