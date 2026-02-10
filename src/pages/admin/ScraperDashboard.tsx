import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScraperManager } from '@/lib/scrapers'
import { Loader2, Play, Clock, CheckCircle2, XCircle, TrendingUp, Database } from 'lucide-react'

interface ScraperStatus {
  name: string
  brand: string
  lastRun?: Date
  status: 'idle' | 'running' | 'success' | 'error'
  modelsFound?: number
  duration?: number
  error?: string
}

export default function ScraperDashboard() {
  const [scrapers, setScrapers] = useState<ScraperStatus[]>([
    { name: 'BMW API Scraper', brand: 'bmw', status: 'idle' },
    { name: 'Yamaha Scraper', brand: 'yamaha', status: 'idle' },
    { name: 'Honda Scraper', brand: 'honda', status: 'idle' },
    { name: 'Kawasaki Scraper', brand: 'kawasaki', status: 'idle' },
  ])
  const [runningAll, setRunningAll] = useState(false)
  const [totalModels, setTotalModels] = useState(0)
  const [lastFullRun, setLastFullRun] = useState<Date | null>(null)

  const updateScraperStatus = (brand: string, updates: Partial<ScraperStatus>) => {
    setScrapers(prev =>
      prev.map(s => s.brand === brand ? { ...s, ...updates } : s)
    )
  }

  const runScraper = async (brand: 'bmw' | 'yamaha' | 'honda' | 'kawasaki') => {
    const startTime = Date.now()
    updateScraperStatus(brand, { status: 'running', lastRun: new Date() })

    try {
      const manager = new ScraperManager()
      const motorcycles = await manager.scrapeBrand(brand)
      const duration = Date.now() - startTime

      updateScraperStatus(brand, {
        status: 'success',
        modelsFound: motorcycles.length,
        duration,
        error: undefined,
      })

      // Here we would normally save to database
      console.log(`${brand.toUpperCase()} scraped:`, motorcycles)
    } catch (error) {
      updateScraperStatus(brand, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      })
    }
  }

  const runAllScrapers = async () => {
    setRunningAll(true)

    try {
      const manager = new ScraperManager()
      const result = await manager.scrapeAll()

      // Update all scraper statuses
      Object.entries(result.stats.byBrand).forEach(([brand, stats]) => {
        updateScraperStatus(brand.toLowerCase(), {
          status: 'success',
          modelsFound: stats.count,
          duration: result.stats.duration / 4, // Approximate per brand
          lastRun: result.stats.timestamp,
        })
      })

      // Handle errors
      result.stats.errors.forEach(error => {
        const brand = error.split(':')[0].toLowerCase()
        updateScraperStatus(brand, {
          status: 'error',
          error: error,
        })
      })

      setTotalModels(result.stats.totalMotorcycles)
      setLastFullRun(result.stats.timestamp)

      // Here we would normally save to database
      console.log('All scrapers completed:', result)
    } catch (error) {
      console.error('Scraping failed:', error)
    } finally {
      setRunningAll(false)
    }
  }

  const getStatusIcon = (status: ScraperStatus['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: ScraperStatus['status']) => {
    const variants: Record<ScraperStatus['status'], string> = {
      idle: 'secondary',
      running: 'default',
      success: 'default',
      error: 'destructive',
    }

    const labels: Record<ScraperStatus['status'], string> = {
      idle: 'Bekliyor',
      running: 'Çalışıyor',
      success: 'Başarılı',
      error: 'Hata',
    }

    return (
      <Badge variant={variants[status] as any}>
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scraper Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Motosiklet fiyat verilerini otomatik topla
          </p>
        </div>
        <Button
          size="lg"
          onClick={runAllScrapers}
          disabled={runningAll}
          className="gap-2"
        >
          {runningAll ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Çalışıyor...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Tümünü Çalıştır
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Toplam Model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              {totalModels}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Aktif Scraper</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              {scrapers.filter(s => s.status === 'running').length} / {scrapers.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Son Çalıştırma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {lastFullRun ? (
                <span>
                  {lastFullRun.toLocaleDateString('tr-TR')} {lastFullRun.toLocaleTimeString('tr-TR')}
                </span>
              ) : (
                <span className="text-muted-foreground">Henüz çalıştırılmadı</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scraper List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scrapers.map(scraper => (
          <Card key={scraper.brand}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(scraper.status)}
                  <div>
                    <CardTitle className="text-lg">{scraper.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {scraper.brand.toUpperCase()}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(scraper.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Son Çalışma</div>
                  <div className="font-medium">
                    {scraper.lastRun
                      ? scraper.lastRun.toLocaleTimeString('tr-TR')
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Model Sayısı</div>
                  <div className="font-medium">
                    {scraper.modelsFound ?? '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Süre</div>
                  <div className="font-medium">
                    {scraper.duration ? `${(scraper.duration / 1000).toFixed(2)}s` : '-'}
                  </div>
                </div>
              </div>

              {/* Error */}
              {scraper.error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded text-xs">
                  {scraper.error}
                </div>
              )}

              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => runScraper(scraper.brand as any)}
                disabled={scraper.status === 'running'}
                className="w-full gap-2"
              >
                {scraper.status === 'running' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Çalışıyor
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Çalıştır
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Nasıl Kullanılır?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Tümünü Çalıştır:</strong> Tüm markaların scraper'larını paralel olarak çalıştırır
          </p>
          <p>
            • <strong>Tek Scraper:</strong> Her marka kartındaki "Çalıştır" butonu ile tek bir markayı test edebilirsiniz
          </p>
          <p>
            • <strong>Durum:</strong> Her scraper'ın anlık durumu (bekliyor, çalışıyor, başarılı, hata) gösterilir
          </p>
          <p>
            • <strong>Otomatik Çalıştırma:</strong> Production'da Supabase Edge Functions ile günlük otomatik çalışacak
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
