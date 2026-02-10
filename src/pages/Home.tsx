import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MotorcycleCard from '@/components/motorcycle/MotorcycleCard'
import { Search, TrendingUp, Heart, GitCompare, Zap, Award, BarChart3 } from 'lucide-react'
import allMotorcycles from '@/data/motorcycles.json'

export default function Home() {
  // Get diverse featured motorcycles (mix of brands and price ranges)
  const featuredMotorcycles = allMotorcycles
    .filter(m => m.price > 0) // Only valid prices
    .sort((a, b) => b.price - a.price) // Sort by price descending
    .slice(0, 30) // Top 30 most expensive
    .sort(() => Math.random() - 0.5) // Shuffle
    .slice(0, 6) // Pick 6 random from top 30
    .map((m, index) => ({
      ...m,
      id: `${m.brand.toLowerCase()}-${m.name.toLowerCase().replace(/\s+/g, '-')}-${index}`
    }))

  // Calculate statistics
  const totalModels = allMotorcycles.length
  const avgPrice = Math.round(allMotorcycles.reduce((sum, m) => sum + m.price, 0) / totalModels)
  const brands = Array.from(new Set(allMotorcycles.map(m => m.brand)))

  // Price/Performance - Best value motorcycles (price per HP)
  const bestValue = allMotorcycles
    .filter(m => m.power && m.price > 0)
    .map(m => ({
      ...m,
      pricePerHp: Math.round(m.price / m.power!)
    }))
    .sort((a, b) => a.pricePerHp - b.pricePerHp)
    .slice(0, 3)
    .map((m, index) => ({
      ...m,
      id: `${m.brand.toLowerCase()}-${m.name.toLowerCase().replace(/\s+/g, '-')}-value-${index}`
    }))

  // Most expensive motorcycles
  const mostExpensive = allMotorcycles
    .filter(m => m.price > 0)
    .sort((a, b) => b.price - a.price)
    .slice(0, 3)
    .map((m, index) => ({
      ...m,
      id: `${m.brand.toLowerCase()}-${m.name.toLowerCase().replace(/\s+/g, '-')}-expensive-${index}`
    }))

  // Most powerful motorcycles
  const mostPowerful = allMotorcycles
    .filter(m => m.power && m.power > 0)
    .sort((a, b) => b.power! - a.power!)
    .slice(0, 3)
    .map((m, index) => ({
      ...m,
      id: `${m.brand.toLowerCase()}-${m.name.toLowerCase().replace(/\s+/g, '-')}-powerful-${index}`
    }))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-br from-primary/5 via-background to-muted/30 py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container px-4 relative">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <div className="inline-block">
                <span className="text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full">
                  {totalModels} Model • {brands.length} Marka
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Türkiye'nin Motosiklet
                <span className="text-primary"> Fiyat </span>
                Platformu
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Tüm markaların güncel fiyatlarını, teknik özelliklerini ve fiyat değişimlerini
                tek platformda takip edin
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/markalar">
                  <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto">
                    <Search className="h-5 w-5" />
                    Motosiklet Ara
                  </Button>
                </Link>
                <Link to="/karsilastir">
                  <Button size="lg" variant="outline" className="gap-2 hover:bg-primary/5 w-full sm:w-auto">
                    <GitCompare className="h-5 w-5" />
                    Karşılaştır
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 bg-muted/20">
          <div className="container px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Toplam Model</p>
                      <p className="text-2xl font-bold">{totalModels}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ortalama Fiyat</p>
                      <p className="text-2xl font-bold">{avgPrice.toLocaleString('tr-TR')} ₺</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Marka Sayısı</p>
                      <p className="text-2xl font-bold">{brands.length}</p>
                    </div>
                    <Award className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">En Yüksek Fiyat</p>
                      <p className="text-2xl font-bold">{mostExpensive[0].price.toLocaleString('tr-TR')} ₺</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b">
          <div className="container px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Fiyat Takibi</h3>
                <p className="text-sm text-muted-foreground">
                  Güncel fiyatları ve geçmiş fiyat değişimlerini grafiklerle takip edin
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <GitCompare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Karşılaştırma</h3>
                <p className="text-sm text-muted-foreground">
                  Farklı modelleri yan yana karşılaştırıp doğru kararı verin
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Favoriler & Alarmlar</h3>
                <p className="text-sm text-muted-foreground">
                  Favori motosikletlerinizi kaydedin, fiyat düşünce bildirim alın
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Motorcycles */}
        <section className="py-16 bg-gradient-to-b from-background to-muted/10">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Award className="h-8 w-8 text-primary" />
                  Öne Çıkan Modeller
                </h2>
                <p className="text-muted-foreground mt-1">
                  En popüler ve güncel motosikletler
                </p>
              </div>
              <Link to="/markalar">
                <Button variant="outline" className="hover:bg-primary/5">Tümünü Gör</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMotorcycles.map((motorcycle) => (
                <MotorcycleCard key={motorcycle.id} {...motorcycle} />
              ))}
            </div>
          </div>
        </section>

        {/* Price/Performance Section */}
        <section className="py-16 border-t">
          <div className="container px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Zap className="h-8 w-8 text-yellow-500" />
                En İyi Fiyat/Performans
              </h2>
              <p className="text-muted-foreground mt-1">
                Beygir başına en uygun fiyatlı modeller
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bestValue.map((motorcycle, index) => (
                <Card key={motorcycle.id} className="relative overflow-hidden group hover:shadow-xl transition-shadow">
                  {index === 0 && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        #1 EN İYİ
                      </span>
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">{motorcycle.brand}</p>
                      <h3 className="text-xl font-bold">{motorcycle.name}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Fiyat</span>
                        <span className="font-semibold">{motorcycle.price.toLocaleString('tr-TR')} ₺</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Güç</span>
                        <span className="font-semibold">{motorcycle.power} HP</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium text-primary">Beygir Başı</span>
                        <span className="font-bold text-primary">{motorcycle.pricePerHp.toLocaleString('tr-TR')} ₺/HP</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Most Expensive & Most Powerful */}
        <section className="py-16 bg-muted/20">
          <div className="container px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Most Expensive */}
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-7 w-7 text-orange-500" />
                    En Pahalı Modeller
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Premium segment motosikletler</p>
                </div>
                <div className="space-y-4">
                  {mostExpensive.map((motorcycle, index) => (
                    <Card key={motorcycle.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                              index === 0 ? 'bg-orange-500 text-white' :
                              index === 1 ? 'bg-orange-400 text-white' :
                              'bg-orange-300 text-white'
                            }`}>
                              #{index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">{motorcycle.brand}</p>
                            <h3 className="font-bold">{motorcycle.name}</h3>
                            {motorcycle.engineCapacity && (
                              <p className="text-xs text-muted-foreground">{motorcycle.engineCapacity} cc</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-orange-600">
                              {motorcycle.price.toLocaleString('tr-TR')} ₺
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Most Powerful */}
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="h-7 w-7 text-red-500" />
                    En Güçlü Modeller
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Maksimum performans</p>
                </div>
                <div className="space-y-4">
                  {mostPowerful.map((motorcycle, index) => (
                    <Card key={motorcycle.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                              index === 0 ? 'bg-red-500 text-white' :
                              index === 1 ? 'bg-red-400 text-white' :
                              'bg-red-300 text-white'
                            }`}>
                              #{index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">{motorcycle.brand}</p>
                            <h3 className="font-bold">{motorcycle.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {motorcycle.price.toLocaleString('tr-TR')} ₺
                              {motorcycle.engineCapacity && ` • ${motorcycle.engineCapacity} cc`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-red-600">
                              {motorcycle.power} HP
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="py-16 border-t">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">Takip Edilen Markalar</h2>
              <p className="text-muted-foreground">
                {allMotorcycles.length} motosiklet modeli takip ediliyor
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {brands.sort().map((brand) => {
                const brandCount = allMotorcycles.filter(m => m.brand === brand).length
                const brandAvgPrice = Math.round(
                  allMotorcycles.filter(m => m.brand === brand).reduce((sum, m) => sum + m.price, 0) / brandCount
                )
                return (
                  <Card
                    key={brand}
                    className="hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-2 hover:border-primary/50"
                  >
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold">{brand}</h3>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">{brandCount} model</p>
                          <p className="text-xs text-muted-foreground">
                            Ort. {brandAvgPrice.toLocaleString('tr-TR')} ₺
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
