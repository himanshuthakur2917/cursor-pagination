import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { Product } from './product.entity.js';
import {
  GetProductsDto,
  PaginatedProductResponse,
  PageInfo,
} from './products.dto.js';

interface DecodedCursor {
  created_at: string;
  id: string;
}

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Fetch products with cursor-based pagination.
   *
   * How it works:
   * 1. Build a WHERE clause from cursor + category filter
   * 2. Fetch limit+1 rows to detect if there's a next/previous page
   * 3. Encode the first and last items as cursors for the response
   *
   * Why cursor pagination is consistent:
   * - The cursor is a (created_at, id) tuple — a unique, immutable position.
   * - New inserts have newer created_at → they land BEFORE the cursor.
   * - Pages after the cursor are unaffected. No duplicates, no gaps.
   */
  async findAll(dto: GetProductsDto): Promise<PaginatedProductResponse> {
    const { limit = 20, cursor, category, direction = 'forward' } = dto;

    const values: unknown[] = [];
    let paramIndex = 1;
    const conditions: string[] = [];

    // Category filter
    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(category);
    }

    // Cursor filter
    let decodedCursor: DecodedCursor | null = null;
    if (cursor) {
      decodedCursor = this.decodeCursor(cursor);

      if (direction === 'forward') {
        // Forward: get items AFTER cursor (older items for DESC sort)
        conditions.push(
          `(created_at, id) < ($${paramIndex++}, $${paramIndex++})`,
        );
      } else {
        // Backward: get items BEFORE cursor (newer items for DESC sort)
        conditions.push(
          `(created_at, id) > ($${paramIndex++}, $${paramIndex++})`,
        );
      }
      values.push(decodedCursor.created_at, decodedCursor.id);
    }

    const whereClause =
      conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Determine sort direction
    const isForward = direction === 'forward';
    const orderDirection = isForward ? 'DESC' : 'ASC';

    // Fetch limit+1 to detect if there's another page
    values.push(limit + 1);

    const query = `
      SELECT id, name, category, price, created_at, updated_at
      FROM products
      ${whereClause}
      ORDER BY created_at ${orderDirection}, id ${orderDirection}
      LIMIT $${paramIndex}
    `;

    const result = await this.db.query<Product>(query, values);
    let items = result.rows;

    const hasMore = items.length > limit;
    if (hasMore) {
      items = items.slice(0, limit);
    }

    // For backward pagination, reverse results to maintain DESC order
    if (!isForward) {
      items = items.reverse();
    }

    // Build page info
    const pageInfo: PageInfo = {
      hasNextPage: isForward ? hasMore : !!cursor,
      hasPreviousPage: isForward ? !!cursor : hasMore,
      startCursor: items.length > 0 ? this.encodeCursor(items[0]) : null,
      endCursor:
        items.length > 0 ? this.encodeCursor(items[items.length - 1]) : null,
    };

    // Get total count (for UI display)
    const totalCount = await this.getTotalCount(category);

    return { data: items, pageInfo, totalCount };
  }

  /**
   * Get distinct categories for the filter dropdown.
   */
  async getCategories(): Promise<string[]> {
    const result = await this.db.query<{ category: string }>(
      'SELECT DISTINCT category FROM products ORDER BY category ASC',
    );
    return result.rows.map((row) => row.category);
  }

  /**
   * Get total product count, optionally filtered by category.
   */
  private async getTotalCount(category?: string): Promise<number> {
    let query = 'SELECT COUNT(*)::int AS total FROM products';
    const values: unknown[] = [];

    if (category) {
      query += ' WHERE category = $1';
      values.push(category);
    }

    const result = await this.db.query<{ total: number }>(query, values);
    return result.rows[0].total;
  }

  /**
   * Encode a product into a base64url cursor string.
   * The cursor contains the created_at and id — the two columns that form
   * the composite sort key for keyset pagination.
   */
  private encodeCursor(product: Product): string {
    const createdAt = product.created_at;
    const payload = JSON.stringify({
      created_at:
        typeof createdAt === 'object' && createdAt !== null
          ? (createdAt as unknown as Date).toISOString()
          : String(createdAt),
      id: product.id,
    });
    return Buffer.from(payload).toString('base64url');
  }

  /**
   * Decode a base64url cursor string back into created_at and id.
   */
  private decodeCursor(cursor: string): DecodedCursor {
    try {
      const payload: string = Buffer.from(cursor, 'base64url').toString(
        'utf-8',
      );
      const parsed: { created_at: string; id: string } = JSON.parse(
        payload,
      ) as { created_at: string; id: string };

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.created_at ||
        !parsed.id
      ) {
        throw new Error('Invalid cursor: missing created_at or id');
      }

      return {
        created_at: parsed.created_at,
        id: parsed.id,
      };
    } catch {
      throw new Error('Invalid cursor format');
    }
  }
}
