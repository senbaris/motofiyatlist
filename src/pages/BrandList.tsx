import { useState, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MotorcycleCard from '@/components/motorcycle/MotorcycleCard'
import FilterSidebar, { type FilterState } from '@/components/filters/FilterSidebar'
import allMotorcycles from '@/data/motorcycles.json'

export default function BrandList() {
  // Calculate max values for filters
  const maxPrice = Math.max(...allMotorcycles.map(m => m.price))
  const maxEngine = Math.max(...allMotorcycles.filter(m => m.engineCapacity).map(m => m.engineCapacity || 0))

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    categories: [],
    priceRange: [0, maxPrice],
    engineRange: [0, maxEngine],
  })

  // Get available options
  const brands = Array.from(new Set(allMotorcycles.map(m => m.brand))).sort()
  const categories = Array.from(
    new Set(allMotorcycles.filter(m => m.category).map(m => m.category as string))
  ).sort()

  // Apply filters
  const filteredMotorcycles = useMemo(() => {
    return allMotorcycles.filter(m => {
      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(m.brand)) {
        return false
      }

      // Category filter
      if (filters.categories.length > 0 && (!m.category || !filters.categories.includes(m.category))) {
        return false
      }

      // Price filter
      if (m.price < filters.priceRange[0] || m.price > filters.priceRange[1]) {
        return false
      }

      // Engine capacity filter
      if (m.engineCapacity) {
        if (m.engineCapacity < filters.engineRange[0] || m.engineCapacity > filters.engineRange[1]) {
          return false
        }
      }

      return true
    })
  }, [filters])

  // Group by brand
  const groupedBrands = useMemo(() => {
    const grouped = new Map<string, typeof allMotorcycles>()
    filteredMotorcycles.forEach(m => {
      if (!grouped.has(m.brand)) {
        grouped.set(m.brand, [])
      }
      grouped.get(m.brand)!.push(m)
    })
    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredMotorcycles])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Tüm Motosikletler</h1>
            <p className="text-muted-foreground">
              {brands.length} marka, {allMotorcycles.length} toplam model
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <FilterSidebar
                availableBrands={brands}
                availableCategories={categories}
                maxPrice={maxPrice}
                maxEngine={maxEngine}
                filters={filters}
                onFilterChange={setFilters}
                motorcycleCount={filteredMotorcycles.length}
              />
            </aside>

            {/* Motorcycles Grid */}
            <div className="flex-1">
              {groupedBrands.length > 0 ? (
                <div className="space-y-12">
                  {groupedBrands.map(([brand, brandMotorcycles]) => {
                    const motorcyclesWithId = brandMotorcycles.map((m, index) => ({
                      ...m,
                      id: `${m.brand.toLowerCase()}-${m.name.toLowerCase().replace(/\s+/g, '-')}-${index}`
                    }))

                    return (
                      <section key={brand}>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-bold">{brand}</h2>
                          <span className="text-sm text-muted-foreground">
                            {brandMotorcycles.length} model
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {motorcyclesWithId.map((motorcycle) => (
                            <MotorcycleCard key={motorcycle.id} {...motorcycle} />
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground mb-2">
                    Filtrelere uygun motosiklet bulunamadı
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Filtre kriterlerinizi değiştirerek tekrar deneyin
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
