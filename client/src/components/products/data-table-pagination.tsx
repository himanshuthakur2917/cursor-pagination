"use client";

import { Button } from "@/components/ui/button";
import { PageInfo } from "@/types/product";

interface DataTablePaginationProps {
  pageInfo: PageInfo;
  totalCount: number;
  pageSize: number;
  currentPageSize: number;
  isLoading: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export function DataTablePagination({
  pageInfo,
  totalCount,
  pageSize,
  currentPageSize,
  isLoading,
  onNextPage,
  onPreviousPage,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between w-full py-4">
      {/* Item count info */}
      <div className="text-sm text-muted-foreground/60">
        Showing <span className="font-medium text-white/90">{currentPageSize.toLocaleString()}</span> out of <span className="font-medium text-white/90">{totalCount.toLocaleString()}</span> products
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <Button
          id="prev-page-btn"
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={!pageInfo.hasPreviousPage || isLoading}
          className="h-9 px-4 gap-1.5 text-sm font-medium transition-all"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Previous
        </Button>
        <Button
          id="next-page-btn"
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!pageInfo.hasNextPage || isLoading}
          className="h-9 px-4 gap-1.5 text-sm font-medium transition-all"
        >
          Next
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
