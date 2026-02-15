'use client';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory('All')}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          selectedCategory === 'All'
            ? 'bg-gradient-to-r from-[#3B82F6] to-[#9333EA] text-white shadow-lg shadow-[#3B82F6]/30'
            : 'bg-[#0A1026] text-gray-300 hover:bg-[#0F172A] border border-[#4DA3FF]/20'
        }`}
      >
        All Products
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedCategory === category
              ? 'bg-gradient-to-r from-[#3B82F6] to-[#9333EA] text-white shadow-lg shadow-[#3B82F6]/30'
              : 'bg-[#0A1026] text-gray-300 hover:bg-[#0F172A] border border-[#4DA3FF]/20'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}