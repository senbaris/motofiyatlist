import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'

interface MotorcycleCardProps {
  id: string
  name: string
  brand: string
  category?: string
  year: number
  price: number
  previousPrice?: number
  imageUrl?: string
  engineCapacity?: number
  power?: number
}

export default function MotorcycleCard({
  id,
  name,
  brand,
  category,
  year,
  price,
  previousPrice,
  imageUrl,
  engineCapacity,
  power,
}: MotorcycleCardProps) {
  const priceChange = previousPrice ? ((price - previousPrice) / previousPrice) * 100 : 0
  const priceIncreased = priceChange > 0
  const priceDecreased = priceChange < 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/motosiklet/${id}`}>
        {/* Image */}
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${brand} ${name}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🏍️</span>
            </div>
          )}

          {/* Price Change Badge */}
          {(priceIncreased || priceDecreased) && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
              priceIncreased ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {priceIncreased ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(priceChange).toFixed(1)}%
            </div>
          )}

          {/* Favorite Button */}
          <button
            className="absolute top-2 left-2 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background transition-colors"
            onClick={(e) => {
              e.preventDefault()
              // TODO: Add to favorites
            }}
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Brand & Category */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold">{brand}</span>
              {category && <span>{category}</span>}
            </div>

            {/* Model Name */}
            <h3 className="font-bold text-lg leading-tight line-clamp-1">
              {name}
            </h3>

            {/* Specs */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {year && <span>{year}</span>}
              {engineCapacity && <span>{engineCapacity} cc</span>}
              {power && <span>{power} HP</span>}
            </div>

            {/* Price */}
            <div className="pt-2">
              <div className="text-2xl font-bold text-primary">
                {price.toLocaleString('tr-TR')} ₺
              </div>
              {previousPrice && previousPrice !== price && (
                <div className="text-xs text-muted-foreground line-through">
                  {previousPrice.toLocaleString('tr-TR')} ₺
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          Detaylar
        </Button>
        <Button size="sm" className="flex-1">
          Karşılaştır
        </Button>
      </CardFooter>
    </Card>
  )
}
