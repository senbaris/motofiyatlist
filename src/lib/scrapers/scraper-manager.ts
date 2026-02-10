import { BMWAPIScraper } from './brands/bmw-api-scraper'
import { YamahaScraper } from './brands/yamaha-scraper'
import { HondaScraper } from './brands/honda-scraper'
import { KawasakiScraper } from './brands/kawasaki-scraper'
import type { ParsedMotorcycle } from '../parsers/types'

/**
 * Scraper Manager - Orchestrates all brand scrapers
 * Frontend version: Uses sample data (Puppeteer scrapers run in backend)
 */
export class ScraperManager {
  private scrapers = {
    bmw: new BMWAPIScraper(),
    yamaha: new YamahaScraper(),
    honda: new HondaScraper(),
    kawasaki: new KawasakiScraper(),
  }

  /**
   * Scrape all brands in parallel
   */
  async scrapeAll(): Promise<{
    motorcycles: ParsedMotorcycle[]
    stats: ScraperStats
  }> {
    const startTime = Date.now()

    const results = await Promise.allSettled([
      this.scrapers.bmw.scrapeMotorcycles(),
      this.scrapers.yamaha.scrapeMotorcycles(),
      this.scrapers.honda.scrapeMotorcycles(),
      this.scrapers.kawasaki.scrapeMotorcycles(),
    ])

    const motorcycles: ParsedMotorcycle[] = []
    const errors: string[] = []

    results.forEach((result, index) => {
      const brand = ['BMW', 'Yamaha', 'Honda', 'Kawasaki'][index]

      if (result.status === 'fulfilled') {
        motorcycles.push(...result.value)
      } else {
        errors.push(`${brand}: ${result.reason}`)
      }
    })

    const stats: ScraperStats = {
      totalMotorcycles: motorcycles.length,
      byBrand: this.calculateBrandStats(motorcycles),
      duration: Date.now() - startTime,
      errors,
      timestamp: new Date(),
    }

    return { motorcycles, stats }
  }

  /**
   * Scrape specific brand
   */
  async scrapeBrand(brand: 'bmw' | 'yamaha' | 'honda' | 'kawasaki'): Promise<ParsedMotorcycle[]> {
    return await this.scrapers[brand].scrapeMotorcycles()
  }

  /**
   * Calculate statistics by brand
   */
  private calculateBrandStats(motorcycles: ParsedMotorcycle[]): Record<string, BrandStats> {
    const stats: Record<string, BrandStats> = {}

    motorcycles.forEach(m => {
      if (!stats[m.brand]) {
        stats[m.brand] = {
          count: 0,
          avgPrice: 0,
          minPrice: Infinity,
          maxPrice: 0,
          prices: [],
        }
      }

      const brandStats = stats[m.brand]
      brandStats.count++
      brandStats.prices.push(m.price)
      brandStats.minPrice = Math.min(brandStats.minPrice, m.price)
      brandStats.maxPrice = Math.max(brandStats.maxPrice, m.price)
    })

    // Calculate averages
    Object.values(stats).forEach(stat => {
      stat.avgPrice = Math.round(
        stat.prices.reduce((sum, p) => sum + p, 0) / stat.prices.length
      )
    })

    return stats
  }
}

export interface ScraperStats {
  totalMotorcycles: number
  byBrand: Record<string, BrandStats>
  duration: number
  errors: string[]
  timestamp: Date
}

export interface BrandStats {
  count: number
  avgPrice: number
  minPrice: number
  maxPrice: number
  prices: number[]
}
