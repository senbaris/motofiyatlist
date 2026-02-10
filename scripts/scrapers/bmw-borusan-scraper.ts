import * as cheerio from 'cheerio'
import type { ParsedMotorcycle } from '../../src/lib/parsers/types.js'

/**
 * BMW Motorrad Borusan Scraper
 * Scrapes from borusanotomotiv.com (iframe source of bmw-motorrad.com.tr)
 * Much simpler and more reliable than Puppeteer!
 */
export class BMWBorusanScraper {
  private iframeUrl = 'https://www.borusanotomotiv.com/motorrad/stage2/fiyatlistesi/default.aspx'

  async scrapeMotorcycles(): Promise<ParsedMotorcycle[]> {
    console.log('🚀 Starting BMW Borusan scraper...')
    console.log(`📄 Fetching ${this.iframeUrl}...`)

    try {
      const html = await this.fetchPage()
      console.log(`✅ Page fetched (${(html.length / 1024).toFixed(0)} KB)`)

      const motorcycles = this.parseHTML(html)
      console.log(`✅ Found ${motorcycles.length} motorcycles`)

      return motorcycles
    } catch (error) {
      console.error('❌ BMW Borusan scraping failed:', error)
      return this.getSampleData()
    }
  }

  private async fetchPage(): Promise<string> {
    const response = await fetch(this.iframeUrl, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'accept-language': 'tr,en;q=0.9',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'referer': 'https://www.bmw-motorrad.com.tr/tr/fiyat-listesi.html',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.text()
  }

  private parseHTML(html: string): ParsedMotorcycle[] {
    const $ = cheerio.load(html)
    const motorcycles: ParsedMotorcycle[] = []

    $('div.price').each((_i, el) => {
      const $el = $(el)

      // Extract model info
      const model = $el.find('.col1_1').text().trim()
      const variant = $el.find('.col1_2').text().trim()
      const modelYear = $el.find('.col8').text().trim()

      // Hidden inputs hold the clean numeric values
      const inputs = $el.find('input[type="hidden"]')
      const values: string[] = []
      inputs.each((_j, inp) => {
        values.push($(inp).attr('value') || '')
      })

      // values[4] is "Azami Satış Fiyatı" (Maximum Sales Price)
      if (model && values.length >= 5 && values[4]) {
        const fullName = variant ? `${model} ${variant}` : model
        const price = this.parsePrice(values[4])
        const year = parseInt(modelYear) || new Date().getFullYear()

        if (price > 0) {
          motorcycles.push({
            name: this.cleanModelName(fullName),
            brand: 'BMW',
            category: this.guessCategory(fullName),
            year,
            price,
            engineCapacity: this.guessEngineCapacity(fullName),
          })
        }
      }
    })

    return motorcycles
  }

  private parsePrice(priceStr: string): number {
    // Remove all non-digit characters and parse
    const cleaned = priceStr.replace(/[^\d]/g, '')
    return parseInt(cleaned) || 0
  }

  private cleanModelName(name: string): string {
    return name
      .replace(/^BMW\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private guessCategory(name: string): string | undefined {
    const nameUpper = name.toUpperCase()

    if (nameUpper.includes('RR')) return 'Sport'
    if (nameUpper.includes('GS')) return 'Adventure'
    if (nameUpper.includes('RT')) return 'Touring'
    if (nameUpper.includes('R ') || nameUpper.startsWith('R ')) return 'Naked'
    if (nameUpper.includes('S ') || nameUpper.startsWith('S ')) return 'Sport'
    if (nameUpper.includes('F ') || nameUpper.startsWith('F ')) return 'Adventure'
    if (nameUpper.includes('G ') || nameUpper.startsWith('G ')) return 'Naked'
    if (nameUpper.includes('K ') || nameUpper.startsWith('K ')) return 'Sport'
    if (nameUpper.includes('C ') || nameUpper.startsWith('C ')) return 'Scooter'
    if (nameUpper.includes('M ') || nameUpper.startsWith('M ')) return 'Sport'

    return undefined
  }

  private guessEngineCapacity(name: string): number | undefined {
    // Extract numbers from model name (e.g., G 310 R -> 310)
    const match = name.match(/\b(\d{3,4})\b/)
    if (match) {
      const capacity = parseInt(match[1])
      // Common BMW engine sizes
      if (capacity === 310) return 313
      if (capacity === 850 || capacity === 900) return 895
      if (capacity === 1000) return 999
      if (capacity === 1250) return 1254
      if (capacity === 1300) return 1254
      return capacity
    }
    return undefined
  }

  /**
   * Sample BMW data (fallback when scraping fails)
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
        name: 'G 310 GS',
        brand: 'BMW',
        category: 'Adventure',
        year: 2024,
        price: 258000,
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
        name: 'F 900 XR',
        brand: 'BMW',
        category: 'Adventure',
        year: 2024,
        price: 525000,
        engineCapacity: 895,
        power: 105,
      },
      {
        name: 'S 1000 R',
        brand: 'BMW',
        category: 'Naked',
        year: 2024,
        price: 765000,
        engineCapacity: 999,
        power: 165,
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
        name: 'S 1000 XR',
        brand: 'BMW',
        category: 'Adventure',
        year: 2024,
        price: 825000,
        engineCapacity: 999,
        power: 165,
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
      {
        name: 'R 1250 GS Adventure',
        brand: 'BMW',
        category: 'Adventure',
        year: 2024,
        price: 1050000,
        engineCapacity: 1254,
        power: 136,
      },
      {
        name: 'R 1250 RT',
        brand: 'BMW',
        category: 'Touring',
        year: 2024,
        price: 975000,
        engineCapacity: 1254,
        power: 136,
      },
    ]
  }
}
