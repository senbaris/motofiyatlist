import { WebScraper, ScraperUtils } from '../web-scraper'
import type { ParsedMotorcycle } from '../../parsers/types'
import type { CheerioAPI } from 'cheerio'

/**
 * Honda Scraper
 * URL: https://honda.com.tr/motorsiklet
 */
export class HondaScraper extends WebScraper {
  constructor() {
    super('Honda', 'https://honda.com.tr/motorsiklet')
  }

  async scrapeMotorcycles(): Promise<ParsedMotorcycle[]> {
    try {
      return this.getSampleData()
    } catch (error) {
      console.error('Honda scraping failed:', error)
      return []
    }
  }

  private getSampleData(): ParsedMotorcycle[] {
    return [
      {
        name: 'CB650R',
        brand: 'Honda',
        category: 'Naked',
        year: 2024,
        price: 315000,
        previousPrice: 310000,
        engineCapacity: 649,
        power: 95,
      },
      {
        name: 'CBR650R',
        brand: 'Honda',
        category: 'Sport',
        year: 2024,
        price: 325000,
        engineCapacity: 649,
        power: 95,
      },
      {
        name: 'CB500X',
        brand: 'Honda',
        category: 'Adventure',
        year: 2024,
        price: 275000,
        engineCapacity: 471,
        power: 47,
      },
      {
        name: 'NC750X',
        brand: 'Honda',
        category: 'Adventure',
        year: 2024,
        price: 325000,
        engineCapacity: 745,
        power: 58,
      },
    ]
  }
}

export function parseHondaHTML($: CheerioAPI): ParsedMotorcycle[] {
  const motorcycles: ParsedMotorcycle[] = []

  $('.motorcycle-card, .product-item').each((_: number, element: any) => {
    const $el = $(element)

    const name = $el.find('h3, .model-name').first().text().trim()
    const priceText = $el.find('.price').first().text().trim()

    if (name && priceText) {
      motorcycles.push({
        name,
        brand: 'Honda',
        year: new Date().getFullYear(),
        price: ScraperUtils.parsePrice(priceText) || 0,
      })
    }
  })

  return motorcycles
}
