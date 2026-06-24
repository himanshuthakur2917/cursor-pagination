"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Product } from "@/types/product";
import { GripVertical } from "lucide-react";

/**
 * Format a price number as USD currency string.
 */
function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

/**
 * Format a date string as a relative time.
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "just now";
}

export const columns: ColumnDef<Product>[] = [
  {
    id: "dragHandle",
    header: () => <div className="w-8"></div>,
    cell: () => (
      <div className="w-8 flex items-center justify-center cursor-grab text-muted-foreground/40 hover:text-white transition-colors">
        <GripVertical className="h-4 w-4" />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-8 flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-white/20 bg-transparent data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-8 flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-white/20 bg-transparent data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: () => <div className="min-w-[280px] pl-2">Product Name</div>,
    cell: ({ row }) => (
      <div className="min-w-[280px] pl-2 font-semibold text-white truncate pr-4">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: () => <div className="w-[160px]">Category</div>,
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return (
        <div className="w-[160px]">
          <Badge variant="outline" className="bg-[#111111] border-[#333333] text-muted-foreground font-normal rounded-full px-3 py-0.5 whitespace-nowrap">
            {category}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="w-[120px] text-right">Price</div>,
    cell: ({ row }) => (
      <div className="w-[120px] text-right text-white font-medium tabular-nums pr-2">
        {formatPrice(row.getValue("price"))}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: () => <div className="w-[140px] pl-8">Created</div>,
    cell: ({ row }) => (
      <div className="w-[140px] pl-8 text-muted-foreground font-medium whitespace-nowrap">
        {formatRelativeTime(row.getValue("created_at"))}
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: () => <div className="w-[120px] text-right">ID</div>,
    cell: ({ row }) => (
      <div className="w-[120px] text-right text-muted-foreground/50 font-mono text-sm truncate">
        {(row.getValue("id") as string).slice(0, 8)}…
      </div>
    ),
  },
];
