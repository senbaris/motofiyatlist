import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MotorcycleCard from '@/components/motorcycle/MotorcycleCard'
import sampleMotorcycles from '@/data/sample-motorcycles.json'

export default function BrandList() {
  const brands = Array.from(new Set(sampleMotorcycles.map(m => m.brand)))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Tüm Markalar</h1>
            <p className="text-muted-foreground">
              {brands.length} marka, {sampleMotorcycles.length} model
            </p>
          </div>

          {/* Brands Grid */}
          <div className="space-y-12">
            {brands.map((brand) => {
              const brandMotorcycles = sampleMotorcycles.filter(m => m.brand === brand)

              return (
                <section key={brand}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">{brand}</h2>
                    <span className="text-sm text-muted-foreground">
                      {brandMotorcycles.length} model
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {brandMotorcycles.map((motorcycle) => (
                      <MotorcycleCard key={motorcycle.id} {...motorcycle} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
