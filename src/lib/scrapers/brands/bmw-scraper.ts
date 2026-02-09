import { WebScraper, ScraperUtils } from '../web-scraper'
import type { ParsedMotorcycle } from '../../parsers/types'
import type { CheerioAPI } from 'cheerio'

/**
 * BMW Motorrad Scraper
 * URL: https://www.bmw-motorrad.com.tr/tr/fiyat-listesi.html
 *
 * Note: BMW site uses dynamic JavaScript loading.
 * For production, use Puppeteer or check for API endpoints.
 * This is a fallback static parser.
 */
export class BMWScraper extends WebScraper {
  constructor() {
    super('BMW', 'https://www.bmw-motorrad.com.tr/tr/fiyat-listesi.html')
  }

  async scrapeMotorcycles(): Promise<ParsedMotorcycle[]> {
    try {
      // For now, return sample BMW data
      // In production, implement dynamic scraping with Puppeteer
      return this.getSampleData()
    } catch (error) {
      console.error('BMW scraping failed:', error)
      return []
    }
  }

  /**
   * Sample BMW data (fallback)
   * Replace with real scraping when Puppeteer is available
   */
  private getSampleData(): ParsedMotorcycle[] {
    return [
      {
        name: 'G 310 R',
        brand: 'BMW',
        category: 'Naked',
        year: 2024,
        price: 245000,
        engineCapacity: 313,
        power: 34,
      },
      {
        name: 'F 900 R',
        brand: 'BMW',
        category: 'Naked',
        year: 2024,
        price: 485000,
        engineCapacity: 895,
        power: 105,
      },
      {
        name: 'S 1000 RR',
        brand: 'BMW',
        category: 'Sport',
        year: 2024,
        price: 895000,
        engineCapacity: 999,
        power: 207,
      },
      {
        name: 'R 1250 GS',
        brand: 'BMW',
        category: 'Adventure',
        year: 2024,
        price: 925000,
        engineCapacity: 1254,
        power: 136,
      },
    ]
  }
}

/**
 * Parse BMW HTML with Cheerio (for static pages)
 */
export function parseBMWHTML($: CheerioAPI): ParsedMotorcycle[] {
  const motorcycles: ParsedMotorcycle[] = []

  // BMW specific selectors (update based on actual HTML structure)
  $('.product-item, .motorcycle-card, .model-item').each((_: number, element: any) => {
    const $el = $(element)

    const name = $el.find('.product-title, .model-name, h3, h2').first().text().trim()
    const priceText = $el.find('.price, .product-price').first().text().trim()
    const engineText = $el.find('.engine, .displacement, .cc').first().text().trim()
    const powerText = $el.find('.power, .hp, .ps').first().text().trim()
    const imageUrl = $el.find('img').first().attr('src')

    if (name && priceText) {
      motorcycles.push({
        name,
        brand: 'BMW',
        year: new Date().getFullYear(),
        price: ScraperUtils.parsePrice(priceText) || 0,
        engineCapacity: ScraperUtils.parseEngineCapacity(engineText),
        power: ScraperUtils.parsePower(powerText),
        imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `https://www.bmw-motorrad.com.tr${imageUrl}`) : undefined,
      })
    }
  })

  return motorcycles
}
