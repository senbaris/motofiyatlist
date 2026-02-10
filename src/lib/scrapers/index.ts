/**
 * Brand Scrapers Index
 * Central export for all brand-specific scrapers
 */

// Frontend scrapers (sample data for UI testing)
export { BMWScraper } from './brands/bmw-scraper'
export { BMWAPIScraper } from './brands/bmw-api-scraper'
export { YamahaScraper } from './brands/yamaha-scraper'
export { HondaScraper } from './brands/honda-scraper'
export { KawasakiScraper } from './brands/kawasaki-scraper'

// Puppeteer scrapers moved to scripts/scrapers/ (backend only)

export { ScraperManager } from './scraper-manager'

import { BMWScraper } from './brands/bmw-scraper'
import { YamahaScraper } from './brands/yamaha-scraper'
import { HondaScraper } from './brands/honda-scraper'
import { KawasakiScraper } from './brands/kawasaki-scraper'

/**
 * Get all available scrapers (legacy)
 */
export function getAllScrapers() {
  return {
    bmw: new BMWScraper(),
    yamaha: new YamahaScraper(),
    honda: new HondaScraper(),
    kawasaki: new KawasakiScraper(),
  }
}

/**
 * Run all scrapers and collect data (legacy - use ScraperManager instead)
 */
export async function scrapeAllBrands() {
  const scrapers = getAllScrapers()
  const results = await Promise.allSettled([
    scrapers.bmw.scrapeMotorcycles(),
    scrapers.yamaha.scrapeMotorcycles(),
    scrapers.honda.scrapeMotorcycles(),
    scrapers.kawasaki.scrapeMotorcycles(),
  ])

  const motorcycles = results
    .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
    .flatMap(result => result.value)

  return motorcycles
}
