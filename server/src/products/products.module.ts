import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { DatabaseService } from '../database/database.service.js';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, DatabaseService],
})
export class ProductsModule {}
