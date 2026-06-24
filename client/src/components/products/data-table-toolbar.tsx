"use client";

interface DataTableToolbarProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  isLoading: boolean;
}

export function DataTableToolbar({
  categories,
  selectedCategory,
  onCategoryChange,
  isLoading,
}: DataTableToolbarProps) {
  // Let's take the first 4-5 categories for the pill menu to perfectly match the image layout
  // (In a real app with many categories, you might want a "More" dropdown, but this matches the reference design)
  const displayCategories = categories.slice(0, 4);

  return (
    <div className="flex items-center justify-between w-full mb-4">
      {/* Category Filter styled exactly like the Outline/Past Performance tabs */}
      <div className="flex items-center bg-[#111111] border border-[#222222] rounded-full p-1 overflow-x-auto">
        <button
          onClick={() => onCategoryChange(null)}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? "bg-transparent border border-white/20 text-white"
              : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          All Products
        </button>
        
        {displayCategories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-transparent border border-white/20 text-white"
                  : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
