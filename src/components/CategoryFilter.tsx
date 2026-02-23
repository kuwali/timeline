import type { Category } from '../types/Category'

interface CategoryFilterProps {
    categories: Category[]
    usedCategoryIds: Set<string>
    activeFilter: string | null // null = "All"
    onFilter: (categoryId: string | null) => void
}

export function CategoryFilter({ categories, usedCategoryIds, activeFilter, onFilter }: CategoryFilterProps) {
    // Only show categories that have events
    const visibleCategories = categories.filter(c => usedCategoryIds.has(c.id))

    if (visibleCategories.length === 0) return null

    return (
        <div className="category-filter" role="group" aria-label="Filter by category">
            <button
                className={`category-filter__pill ${activeFilter === null ? 'category-filter__pill--active' : ''}`}
                onClick={() => onFilter(null)}
            >
                All
            </button>
            {visibleCategories.map(cat => (
                <button
                    key={cat.id}
                    className={`category-filter__pill ${activeFilter === cat.id ? 'category-filter__pill--active' : ''}`}
                    style={activeFilter === cat.id
                        ? { background: cat.color, borderColor: cat.color, color: '#fff' }
                        : { borderColor: cat.color + '60', color: cat.color }
                    }
                    onClick={() => onFilter(cat.id)}
                >
                    {cat.icon} {cat.name}
                </button>
            ))}
        </div>
    )
}
