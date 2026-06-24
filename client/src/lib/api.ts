import { PaginatedResponse } from "@/types/product";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://cursor-pagination-8iw7.vercel.app";

interface FetchProductsParams {
  limit?: number;
  cursor?: string;
  category?: string;
  direction?: "forward" | "backward";
}

/**
 * Fetch paginated products from the NestJS API.
 * All data flows through the server — no direct Supabase access from the client.
 */
export async function fetchProducts(
  params: FetchProductsParams = {}
): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams();

  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.cursor) searchParams.set("cursor", params.cursor);
  if (params.category) searchParams.set("category", params.category);
  if (params.direction) searchParams.set("direction", params.direction);

  const url = `${API_BASE}/products?${searchParams.toString()}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch distinct product categories for the filter dropdown.
 */
export async function fetchCategories(): Promise<string[]> {
  const url = `${API_BASE}/products/categories`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
