"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DataTable } from "@/components/products/data-table";
import { DataTableToolbar } from "@/components/products/data-table-toolbar";
import { columns } from "@/components/products/columns";
import { fetchProducts, fetchCategories } from "@/lib/api";
import { PaginatedResponse, PageInfo } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Default page info for initial state.
 */
const defaultPageInfo: PageInfo = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
};

const PAGE_SIZE = 20;

function ProductBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read state from URL
  const cursor = searchParams.get("cursor") || undefined;
  const direction =
    (searchParams.get("direction") as "forward" | "backward") || undefined;
  const category = searchParams.get("category") || undefined;

  // Component state
  const [response, setResponse] = useState<PaginatedResponse | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track cursor history stack for proper backward navigation
  const cursorStackRef = useRef<string[]>([]);

  // Fetch categories once
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  // Fetch products when URL params change
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetchProducts({
      limit: PAGE_SIZE,
      cursor,
      category,
      direction,
    })
      .then((data) => {
        setResponse(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [cursor, category, direction]);

  /**
   * Navigate to the next page using the endCursor from the current response.
   */
  const handleNextPage = useCallback(() => {
    if (!response?.pageInfo.endCursor) return;

    // Push current startCursor to the stack for backward navigation
    if (response.pageInfo.startCursor) {
      cursorStackRef.current.push(response.pageInfo.startCursor);
    }

    const params = new URLSearchParams();
    params.set("cursor", response.pageInfo.endCursor);
    params.set("direction", "forward");
    if (category) params.set("category", category);
    router.push(`/?${params.toString()}`);
  }, [response, category, router]);

  /**
   * Navigate to the previous page using the startCursor from the current response.
   */
  const handlePreviousPage = useCallback(() => {
    if (!response?.pageInfo.startCursor) return;

    const params = new URLSearchParams();
    params.set("cursor", response.pageInfo.startCursor);
    params.set("direction", "backward");
    if (category) params.set("category", category);
    router.push(`/?${params.toString()}`);
  }, [response, category, router]);

  /**
   * Change category filter and reset pagination to page 1.
   */
  const handleCategoryChange = useCallback(
    (newCategory: string | null) => {
      cursorStackRef.current = [];
      const params = new URLSearchParams();
      if (newCategory) params.set("category", newCategory);
      router.push(params.toString() ? `/?${params.toString()}` : "/");
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-[#000000] p-8">
      <main className="mx-auto max-w-6xl">
        <DataTableToolbar
          categories={categories}
          selectedCategory={category ?? null}
          onCategoryChange={handleCategoryChange}
          isLoading={isLoading}
        />

        <DataTable
          columns={columns}
          data={response?.data ?? []}
          pageInfo={response?.pageInfo ?? defaultPageInfo}
          totalCount={response?.totalCount ?? 0}
          pageSize={PAGE_SIZE}
          isLoading={isLoading}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </main>
    </div>
  );
}

/**
 * Wrap in Suspense for useSearchParams() which requires it in Next.js App Router.
 */
export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="space-y-4 w-full max-w-7xl px-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-10 w-48 rounded-lg" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      }
    >
      <ProductBrowser />
    </Suspense>
  );
}
