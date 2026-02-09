import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MotorcycleCard from '@/components/motorcycle/MotorcycleCard'
import { Button } from '@/components/ui/button'
import { scrapeAllBrands } from '@/lib/scrapers'
import type { ParsedMotorcycle } from '@/lib/parsers/types'
import { Loader2, Download, RefreshCw } from 'lucide-react'

export default function ScraperTest() {
  const [motorcycles, setMotorcycles] = useState<ParsedMotorcycle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScrape = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await scrapeAllBrands()
      setMotorcycles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scraping failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExportJSON = () => {
    const json = JSON.stringify(motorcycles, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `motorcycles-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    total: motorcycles.length,
    byBrand: motorcycles.reduce((acc, m) => {
      acc[m.brand] = (acc[m.brand] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    avgPrice: motorcycles.length > 0
      ? Math.round(motorcycles.reduce((sum, m) => sum + m.price, 0) / motorcycles.length)
      : 0,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Scraper Test</h1>
            <p className="text-muted-foreground">
              Tüm markalardan fiyat verilerini çek ve test et
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <Button
              size="lg"
              onClick={handleScrape}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Veriler Çekiliyor...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Fiyatları Çek
                </>
              )}
            </Button>

            {motorcycles.length > 0 && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleExportJSON}
                className="gap-2"
              >
                <Download className="h-5 w-5" />
                JSON İndir
              </Button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-8">
              <strong>Hata:</strong> {error}
            </div>
          )}

          {/* Stats */}
          {motorcycles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Toplam Model</div>
                <div className="text-3xl font-bold">{stats.total}</div>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Ortalama Fiyat</div>
                <div className="text-3xl font-bold">{stats.avgPrice.toLocaleString('tr-TR')} ₺</div>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg col-span-2">
                <div className="text-sm text-muted-foreground mb-2">Marka Dağılımı</div>
                <div className="flex gap-4 flex-wrap">
                  {Object.entries(stats.byBrand).map(([brand, count]) => (
                    <div key={brand} className="flex items-center gap-2">
                      <span className="font-semibold">{brand}:</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {motorcycles.length > 0 ? (
            <div className="space-y-12">
              {Object.entries(stats.byBrand).map(([brand]) => {
                const brandMotorcycles = motorcycles.filter(m => m.brand === brand)

                return (
                  <section key={brand}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">{brand}</h2>
                      <span className="text-sm text-muted-foreground">
                        {brandMotorcycles.length} model
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {brandMotorcycles.map((motorcycle, index) => (
                        <MotorcycleCard
                          key={`${motorcycle.brand}-${motorcycle.name}-${index}`}
                          id={`${motorcycle.brand.toLowerCase()}-${motorcycle.name.toLowerCase().replace(/\s+/g, '-')}`}
                          {...motorcycle}
                        />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏍️</div>
              <p className="text-muted-foreground">
                "Fiyatları Çek" butonuna tıklayarak başlayın
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
