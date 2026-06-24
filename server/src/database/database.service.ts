import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { DATABASE_POOL } from './database.module.js';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  /**
   * On module init, ensure the products table and indexes exist.
   * This is idempotent — safe to run on every startup.
   */
  async onModuleInit(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(255)    NOT NULL,
        category    VARCHAR(100)    NOT NULL,
        price       NUMERIC(10, 2)  NOT NULL,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
    `);

    // Primary pagination index: unfiltered "newest first" browsing
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_products_created_at_id
        ON products (created_at DESC, id DESC);
    `);

    // Category-filtered pagination index
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category_created_at_id
        ON products (category, created_at DESC, id DESC);
    `);

    console.log('✅ Database tables and indexes verified');
  }

  /**
   * Execute a parameterized SQL query.
   */
  async query<T extends Record<string, any> = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  /**
   * Close the pool when the application shuts down.
   */
  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
    console.log('🔌 Database pool closed');
  }
}
