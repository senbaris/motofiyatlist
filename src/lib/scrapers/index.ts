/**
 * Brand Scrapers Index
 * Central export for all brand-specific scrapers
 */

export { BMWScraper } from './brands/bmw-scraper'
export { YamahaScraper } from './brands/yamaha-scraper'
export { HondaScraper } from './brands/honda-scraper'
export { KawasakiScraper } from './brands/kawasaki-scraper'

import { BMWScraper } from './brands/bmw-scraper'
import { YamahaScraper } from './brands/yamaha-scraper'
import { HondaScraper } from './brands/honda-scraper'
import { KawasakiScraper } from './brands/kawasaki-scraper'

/**
 * Get all available scrapers
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
 * Run all scrapers and collect data
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
