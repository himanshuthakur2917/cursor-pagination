import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { ProductsModule } from './products/products.module.js';

@Module({
  imports: [
    // Load .env and make ConfigService available globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    DatabaseModule,
    ProductsModule,
  ],
})
export class AppModule {}
