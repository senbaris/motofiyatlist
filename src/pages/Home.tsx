import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MotorcycleCard from '@/components/motorcycle/MotorcycleCard'
import { Search, TrendingUp, Heart, GitCompare } from 'lucide-react'
import sampleMotorcycles from '@/data/sample-motorcycles.json'

export default function Home() {
  const featuredMotorcycles = sampleMotorcycles.slice(0, 6)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center space-y-6">
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
                <Button size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
                  Motosiklet Ara
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <GitCompare className="h-5 w-5" />
                  Karşılaştır
                </Button>
              </div>
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
        <section className="py-16">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Öne Çıkan Modeller</h2>
                <p className="text-muted-foreground mt-1">
                  En popüler ve güncel motosikletler
                </p>
              </div>
              <Button variant="outline">Tümünü Gör</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMotorcycles.map((motorcycle) => (
                <MotorcycleCard key={motorcycle.id} {...motorcycle} />
              ))}
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="py-16 bg-muted/30 border-t">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">Takip Edilen Markalar</h2>
              <p className="text-muted-foreground">
                Yamaha, Honda, Kawasaki, BMW ve daha fazlası
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {['Yamaha', 'Honda', 'Kawasaki', 'BMW'].map((brand) => (
                <div
                  key={brand}
                  className="aspect-square rounded-lg border bg-background flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <span className="text-xl font-bold text-muted-foreground">{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
