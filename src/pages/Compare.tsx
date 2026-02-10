import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { GitCompare, X, Plus, TrendingUp, Zap, Gauge, Weight } from 'lucide-react'
import allMotorcycles from '@/data/motorcycles.json'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Motorcycle {
  brand: string
  name: string
  price: number
  year?: number
  engineCapacity?: number
  power?: number
  torque?: number
  weight?: number
  category?: string
}

export default function Compare() {
  const [selectedMotorcycles, setSelectedMotorcycles] = useState<Motorcycle[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>('all')

  const brands = ['all', ...Array.from(new Set(allMotorcycles.map(m => m.brand))).sort()]

  const filteredMotorcycles = selectedBrand === 'all'
    ? allMotorcycles
    : allMotorcycles.filter(m => m.brand === selectedBrand)

  const addMotorcycle = (motorcycle: Motorcycle) => {
    if (selectedMotorcycles.length < 4 && !selectedMotorcycles.find(m => m.name === motorcycle.name && m.brand === motorcycle.brand)) {
      setSelectedMotorcycles([...selectedMotorcycles, motorcycle])
    }
  }

  const removeMotorcycle = (index: number) => {
    setSelectedMotorcycles(selectedMotorcycles.filter((_, i) => i !== index))
  }

  const comparisonSpecs: Array<{
    key: keyof Motorcycle
    label: string
    format: (v: any) => string
    icon: any
  }> = [
    { key: 'price', label: 'Fiyat', format: (v: any) => `${v.toLocaleString('tr-TR')} ₺`, icon: TrendingUp },
    { key: 'year', label: 'Model Yılı', format: (v: any) => v.toString(), icon: null },
    { key: 'category', label: 'Kategori', format: (v: any) => v, icon: null },
    { key: 'engineCapacity', label: 'Motor Hacmi', format: (v: any) => `${v} cc`, icon: Gauge },
    { key: 'power', label: 'Güç', format: (v: any) => `${v} HP`, icon: Zap },
    { key: 'torque', label: 'Tork', format: (v: any) => `${v} Nm`, icon: null },
    { key: 'weight', label: 'Ağırlık', format: (v: any) => `${v} kg`, icon: Weight },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <GitCompare className="h-10 w-10 text-primary" />
              Motosiklet Karşılaştırma
            </h1>
            <p className="text-muted-foreground">
              Maksimum 4 motosikleti seçip yan yana karşılaştırın
            </p>
          </div>

          {/* Model Selector */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Marka Seçin</label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm Markalar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Markalar</SelectItem>
                      {brands.filter(b => b !== 'all').map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Model Seçin</label>
                  <Select
                    disabled={selectedMotorcycles.length >= 4}
                    onValueChange={(value) => {
                      const motorcycle = filteredMotorcycles.find(m =>
                        `${m.brand}-${m.name}` === value
                      )
                      if (motorcycle) addMotorcycle(motorcycle)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        selectedMotorcycles.length >= 4
                          ? "Maksimum 4 model"
                          : "Bir model seçin"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMotorcycles.map((motorcycle, index) => (
                        <SelectItem
                          key={`${motorcycle.brand}-${motorcycle.name}-${index}`}
                          value={`${motorcycle.brand}-${motorcycle.name}`}
                        >
                          {motorcycle.brand} {motorcycle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {selectedMotorcycles.length}/4 model seçildi
              </div>
            </CardContent>
          </Card>

          {/* Selected Motorcycles - Mobile Cards */}
          {selectedMotorcycles.length > 0 && (
            <div className="md:hidden space-y-6 mb-8">
              {selectedMotorcycles.map((motorcycle, index) => (
                <Card key={index} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => removeMotorcycle(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">{motorcycle.brand}</p>
                      <h3 className="text-xl font-bold">{motorcycle.name}</h3>
                    </div>
                    <div className="space-y-2">
                      {comparisonSpecs.map(spec => {
                        const value = motorcycle[spec.key as keyof Motorcycle]
                        if (!value) return null
                        return (
                          <div key={spec.key} className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">{spec.label}</span>
                            <span className="font-medium">
                              {typeof value === 'number' || typeof value === 'string'
                                ? spec.format(value as any)
                                : value}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Comparison Table - Desktop */}
          {selectedMotorcycles.length > 0 ? (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-4 font-semibold bg-muted/50 sticky left-0 z-10">
                      Özellik
                    </th>
                    {selectedMotorcycles.map((motorcycle, index) => (
                      <th key={index} className="p-4 min-w-[200px] relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeMotorcycle(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="text-left pt-8">
                          <p className="text-sm text-muted-foreground font-normal">{motorcycle.brand}</p>
                          <p className="text-base font-bold">{motorcycle.name}</p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonSpecs.map((spec, specIndex) => {
                    const values = selectedMotorcycles.map(m => m[spec.key as keyof Motorcycle])
                    const hasAnyValue = values.some(v => v !== undefined && v !== null)

                    if (!hasAnyValue) return null

                    // Find best value for highlighting
                    let bestIndex = -1
                    if (spec.key === 'price') {
                      // Lower is better for price
                      const numericValues = values.filter(v => typeof v === 'number') as number[]
                      if (numericValues.length > 0) {
                        const minValue = Math.min(...numericValues)
                        bestIndex = values.findIndex(v => v === minValue)
                      }
                    } else if (['power', 'torque', 'engineCapacity'].includes(spec.key)) {
                      // Higher is better for performance
                      const numericValues = values.filter(v => typeof v === 'number') as number[]
                      if (numericValues.length > 0) {
                        const maxValue = Math.max(...numericValues)
                        bestIndex = values.findIndex(v => v === maxValue)
                      }
                    } else if (spec.key === 'weight') {
                      // Lower is better for weight
                      const numericValues = values.filter(v => typeof v === 'number') as number[]
                      if (numericValues.length > 0) {
                        const minValue = Math.min(...numericValues)
                        bestIndex = values.findIndex(v => v === minValue)
                      }
                    }

                    return (
                      <tr key={spec.key} className={specIndex % 2 === 0 ? 'bg-muted/20' : ''}>
                        <td className="p-4 font-medium bg-muted/50 sticky left-0">
                          <div className="flex items-center gap-2">
                            {spec.icon && <spec.icon className="h-4 w-4 text-muted-foreground" />}
                            {spec.label}
                          </div>
                        </td>
                        {selectedMotorcycles.map((motorcycle, index) => {
                          const value = motorcycle[spec.key as keyof Motorcycle]
                          const isBest = index === bestIndex && bestIndex !== -1

                          return (
                            <td
                              key={index}
                              className={`p-4 ${isBest ? 'bg-green-50 dark:bg-green-950/20 font-bold text-green-700 dark:text-green-400' : ''}`}
                            >
                              {value ? (
                                typeof value === 'number' || typeof value === 'string'
                                  ? spec.format(value as any)
                                  : value
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <GitCompare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Karşılaştırma için model seçin</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Yukarıdaki menüden maksimum 4 motosiklet seçerek karşılaştırmaya başlayın
                  </p>
                  <div className="flex gap-2 justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
