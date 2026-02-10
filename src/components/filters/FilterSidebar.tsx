import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { X, SlidersHorizontal } from 'lucide-react'

export interface FilterState {
  brands: string[]
  categories: string[]
  priceRange: [number, number]
  engineRange: [number, number]
}

interface FilterSidebarProps {
  availableBrands: string[]
  availableCategories: string[]
  maxPrice: number
  maxEngine: number
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  motorcycleCount: number
}

export default function FilterSidebar({
  availableBrands,
  availableCategories,
  maxPrice,
  maxEngine,
  filters,
  onFilterChange,
  motorcycleCount,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const toggleBrand = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand]
    onFilterChange({ ...filters, brands: newBrands })
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    onFilterChange({ ...filters, categories: newCategories })
  }

  const resetFilters = () => {
    onFilterChange({
      brands: [],
      categories: [],
      priceRange: [0, maxPrice],
      engineRange: [0, maxEngine],
    })
  }

  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice ||
    filters.engineRange[0] > 0 ||
    filters.engineRange[1] < maxEngine

  return (
    <div className="space-y-4">
      {/* Mobile Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtreler
          </span>
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Aktif
            </span>
          )}
        </Button>
      </div>

      {/* Filters */}
      <div className={`space-y-4 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Results Count */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{motorcycleCount}</p>
                <p className="text-sm text-muted-foreground">Model bulundu</p>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Temizle
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Brand Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Marka</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableBrands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Category Filter */}
        {availableCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kategori</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Price Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fiyat Aralığı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Slider
                min={0}
                max={maxPrice}
                step={10000}
                value={filters.priceRange}
                onValueChange={(value: number[]) => onFilterChange({ ...filters, priceRange: value as [number, number] })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.priceRange[0].toLocaleString('tr-TR')} ₺</span>
                <span>{filters.priceRange[1].toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engine Capacity Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Motor Hacmi (cc)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Slider
                min={0}
                max={maxEngine}
                step={50}
                value={filters.engineRange}
                onValueChange={(value: number[]) => onFilterChange({ ...filters, engineRange: value as [number, number] })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.engineRange[0]} cc</span>
                <span>{filters.engineRange[1]} cc</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
