import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { Product } from './product.entity.js';

/**
 * Query parameters for cursor-based pagination.
 *
 * The cursor is a base64url-encoded JSON string: { created_at: string, id: string }
 * It represents the last (or first) item the client has seen, and is used
 * to seek directly to that position in the index.
 */
export class GetProductsDto {
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 20 : parsed;
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  /**
   * Base64url-encoded cursor: { created_at: string, id: string }
   * Omit for the first page.
   */
  @IsOptional()
  @IsString()
  cursor?: string;

  /**
   * Filter by product category.
   */
  @IsOptional()
  @IsString()
  category?: string;

  /**
   * Pagination direction.
   * - 'forward': next page (default) — items older than cursor
   * - 'backward': previous page — items newer than cursor
   */
  @IsOptional()
  @IsString()
  direction?: 'forward' | 'backward' = 'forward';
}

/**
 * Cursor info for the current page.
 */
export interface PageInfo {
  /** True if there are more items after this page */
  hasNextPage: boolean;
  /** True if there are more items before this page */
  hasPreviousPage: boolean;
  /** Cursor pointing to the first item on this page (for backward navigation) */
  startCursor: string | null;
  /** Cursor pointing to the last item on this page (for forward navigation) */
  endCursor: string | null;
}

/**
 * Paginated API response shape.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pageInfo: PageInfo;
  /** Total number of items (filtered or unfiltered). Used for UI display. */
  totalCount: number;
}

export type PaginatedProductResponse = PaginatedResponse<Product>;
