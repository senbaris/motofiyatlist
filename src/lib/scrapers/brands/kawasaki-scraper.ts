import { WebScraper, ScraperUtils } from '../web-scraper'
import type { ParsedMotorcycle } from '../../parsers/types'
import type { CheerioAPI } from 'cheerio'

/**
 * Kawasaki Scraper
 * URL: https://kawasaki.com.tr
 */
export class KawasakiScraper extends WebScraper {
  constructor() {
    super('Kawasaki', 'https://kawasaki.com.tr')
  }

  async scrapeMotorcycles(): Promise<ParsedMotorcycle[]> {
    try {
      return this.getSampleData()
    } catch (error) {
      console.error('Kawasaki scraping failed:', error)
      return []
    }
  }

  private getSampleData(): ParsedMotorcycle[] {
    return [
      {
        name: 'Ninja 650',
        brand: 'Kawasaki',
        category: 'Sport',
        year: 2024,
        price: 298000,
        engineCapacity: 649,
        power: 68,
      },
      {
        name: 'Z900',
        brand: 'Kawasaki',
        category: 'Naked',
        year: 2024,
        price: 425000,
        previousPrice: 410000,
        engineCapacity: 948,
        power: 125,
      },
      {
        name: 'Ninja 1000SX',
        brand: 'Kawasaki',
        category: 'Sport',
        year: 2024,
        price: 525000,
        engineCapacity: 1043,
        power: 142,
      },
      {
        name: 'Versys 650',
        brand: 'Kawasaki',
        category: 'Adventure',
        year: 2024,
        price: 315000,
        engineCapacity: 649,
        power: 69,
      },
      {
        name: 'Z H2',
        brand: 'Kawasaki',
        category: 'Naked',
        year: 2024,
        price: 725000,
        engineCapacity: 998,
        power: 200,
      },
    ]
  }
}

export function parseKawasakiHTML($: CheerioAPI): ParsedMotorcycle[] {
  const motorcycles: ParsedMotorcycle[] = []

  $('.bike-item, .product-card').each((_: number, element: any) => {
    const $el = $(element)

    const name = $el.find('h2, h3, .bike-name').first().text().trim()
    const priceText = $el.find('.price').first().text().trim()

    if (name && priceText) {
      motorcycles.push({
        name,
        brand: 'Kawasaki',
        year: new Date().getFullYear(),
        price: ScraperUtils.parsePrice(priceText) || 0,
      })
    }
  })

  return motorcycles
}
