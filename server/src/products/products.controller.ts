import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { GetProductsDto } from './products.dto.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /products
   *
   * Paginated product list with cursor-based pagination.
   *
   * Query params:
   *   - limit:     Number of items per page (1–100, default 20)
   *   - cursor:    Base64url-encoded cursor from a previous response
   *   - category:  Filter by product category
   *   - direction: 'forward' (next page) or 'backward' (previous page)
   *
   * Response:
   *   {
   *     data: Product[],
   *     pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
   *     totalCount: number
   *   }
   */
  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    dto: GetProductsDto,
  ) {
    return this.productsService.findAll(dto);
  }

  /**
   * GET /products/categories
   *
   * Returns a list of distinct product categories for the filter dropdown.
   */
  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }
}
