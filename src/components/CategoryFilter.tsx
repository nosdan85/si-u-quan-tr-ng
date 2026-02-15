'use client';

interface CategoryFilterProps {
  categories: string[];
  games: string[];
  selectedCategory: string | null;
  selectedGame: string | null;
  onCategoryChange: (category: string | null) => void;
  onGameChange: (game: string | null) => void;
}

export default function CategoryFilter({
  categories,
  games,
  selectedCategory,
  selectedGame,
  onCategoryChange,
  onGameChange,
}: CategoryFilterProps) {
  return (
    <div className="space-y-4">
      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-gold text-black'
                  : 'bg-black-lighter text-gray-300 hover:bg-black-light border border-black-lighter hover:border-gold/30'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gold text-black'
                    : 'bg-black-lighter text-gray-300 hover:bg-black-light border border-black-lighter hover:border-gold/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Games */}
      {games.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Games</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onGameChange(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedGame === null
                  ? 'bg-gold text-black'
                  : 'bg-black-lighter text-gray-300 hover:bg-black-light border border-black-lighter hover:border-gold/30'
              }`}
            >
              All Games
            </button>
            {games.map((game) => (
              <button
                key={game}
                onClick={() => onGameChange(game)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedGame === game
                    ? 'bg-gold text-black'
                    : 'bg-black-lighter text-gray-300 hover:bg-black-light border border-black-lighter hover:border-gold/30'
                }`}
              >
                {game}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}