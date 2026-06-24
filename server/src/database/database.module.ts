import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const DATABASE_POOL = 'DATABASE_POOL';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');

        if (!connectionString) {
          throw new Error(
            'DATABASE_URL is not defined. Set it in server/.env with your Supabase connection string.',
          );
        }

        return new Pool({
          connectionString,
          max: 20, // connection pool size
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          ssl: {
            rejectUnauthorized: false, // Required for Supabase
          },
        });
      },
    },
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule {}
