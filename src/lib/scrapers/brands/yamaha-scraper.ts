import { WebScraper, ScraperUtils } from '../web-scraper'
import type { ParsedMotorcycle } from '../../parsers/types'
import type { CheerioAPI } from 'cheerio'

/**
 * Yamaha Scraper
 * URL: https://yamaha-motor.com.tr/products/motorcycles
 */
export class YamahaScraper extends WebScraper {
  constructor() {
    super('Yamaha', 'https://yamaha-motor.com.tr/products/motorcycles')
  }

  async scrapeMotorcycles(): Promise<ParsedMotorcycle[]> {
    try {
      // Sample Yamaha data
      return this.getSampleData()
    } catch (error) {
      console.error('Yamaha scraping failed:', error)
      return []
    }
  }

  private getSampleData(): ParsedMotorcycle[] {
    return [
      {
        name: 'MT-07',
        brand: 'Yamaha',
        category: 'Naked',
        year: 2024,
        price: 289000,
        previousPrice: 275000,
        engineCapacity: 689,
        power: 73,
      },
      {
        name: 'YZF-R7',
        brand: 'Yamaha',
        category: 'Sport',
        year: 2024,
        price: 335000,
        previousPrice: 325000,
        engineCapacity: 689,
        power: 73,
      },
      {
        name: 'MT-09',
        brand: 'Yamaha',
        category: 'Naked',
        year: 2024,
        price: 389000,
        engineCapacity: 890,
        power: 119,
      },
      {
        name: 'Tracer 9',
        brand: 'Yamaha',
        category: 'Touring',
        year: 2024,
        price: 425000,
        engineCapacity: 890,
        power: 119,
      },
      {
        name: 'XSR900',
        brand: 'Yamaha',
        category: 'Retro/Classic',
        year: 2024,
        price: 415000,
        engineCapacity: 890,
        power: 119,
      },
    ]
  }
}

export function parseYamahaHTML($: CheerioAPI): ParsedMotorcycle[] {
  const motorcycles: ParsedMotorcycle[] = []

  $('.product-card, .motorcycle-item').each((_: number, element: any) => {
    const $el = $(element)

    const name = $el.find('.product-name, h3').first().text().trim()
    const priceText = $el.find('.price').first().text().trim()
    const imageUrl = $el.find('img').first().attr('src')

    if (name && priceText) {
      motorcycles.push({
        name,
        brand: 'Yamaha',
        year: new Date().getFullYear(),
        price: ScraperUtils.parsePrice(priceText) || 0,
        imageUrl,
      })
    }
  })

  return motorcycles
}
