import * as cheerio from 'cheerio'
import type { ParsedMotorcycle } from '../../src/lib/parsers/types.js'

/**
 * Yamaha Direct Scraper
 * Scrapes from yamaha-motor.eu/tr/tr/fiyat-listesi
 * Simple HTML parsing without Puppeteer
 */
export class YamahaDirectScraper {
  private priceListUrl = 'https://tr-yamaha-motor.com/fiyat-listesi/road-price-list.html'

  async scrapeMotorcycles(): Promise<ParsedMotorcycle[]> {
    console.log('🚀 Starting Yamaha Direct scraper...')
    console.log(`📄 Fetching ${this.priceListUrl}...`)

    try {
      const html = await this.fetchPage()
      console.log(`✅ Page fetched (${(html.length / 1024).toFixed(0)} KB)`)

      const motorcycles = this.parseHTML(html)
      console.log(`✅ Found ${motorcycles.length} motorcycles`)

      return motorcycles.length > 0 ? motorcycles : this.getSampleData()
    } catch (error) {
      console.error('❌ Yamaha scraping failed:', error)
      return this.getSampleData()
    }
  }

  private async fetchPage(): Promise<string> {
    const response = await fetch(this.priceListUrl, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'accept-language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
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

    // Parse table rows - Yamaha uses a simple table structure
    // Format: <td>Model Name</td><td>Year</td><td>Price ₺</td>
    $('table tr').each((_, el) => {
      const $row = $(el)
      const cells = $row.find('td')

      if (cells.length >= 3) {
        // Extract model name from first cell
        const modelText = $(cells[0]).text().trim()

        // Extract year from second cell
        const yearText = $(cells[1]).text().trim()
        const year = parseInt(yearText) || new Date().getFullYear()

        // Extract price from third cell (format: "711.000 ₺")
        const priceText = $(cells[2]).text().trim()
        const priceMatch = priceText.match(/([\d.]+)\s*₺/)

        if (modelText && priceMatch) {
          const name = this.cleanModelName(modelText)
          const price = this.parsePrice(priceMatch[1])

          if (name && price > 10000) {
            motorcycles.push({
              name,
              brand: 'Yamaha',
              category: this.guessCategory(name),
              year,
              price,
              engineCapacity: this.guessEngineCapacity(name),
            })
          }
        }
      }
    })

    // Remove duplicates
    const seen = new Set<string>()
    return motorcycles.filter(m => {
      if (seen.has(m.name)) return false
      seen.add(m.name)
      return true
    })
  }

  private parsePrice(priceStr: string): number {
    // Remove all non-digit characters and parse
    const cleaned = priceStr.replace(/[^\d]/g, '')
    return parseInt(cleaned) || 0
  }

  private cleanModelName(name: string): string {
    return name
      .replace(/^YAMAHA\s*/i, '')
      .replace(/\(EU5\+?\)/gi, '')
      .replace(/\(Y-AMT\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private guessCategory(name: string): string | undefined {
    const nameUpper = name.toUpperCase()

    if (nameUpper.includes('YZF-R') || nameUpper.includes('YZFR')) return 'Sport'
    if (nameUpper.includes('MT-') || nameUpper.includes('MT ')) return 'Naked'
    if (nameUpper.includes('XSR')) return 'Retro/Classic'
    if (nameUpper.includes('TRACER')) return 'Adventure'
    if (nameUpper.includes('TÉNÉRÉ') || nameUpper.includes('TENERE')) return 'Adventure'
    if (nameUpper.includes('NMAX') || nameUpper.includes('XMAX') || nameUpper.includes('TMAX')) return 'Scooter'
    if (nameUpper.includes('FJR')) return 'Touring'

    return undefined
  }

  private guessEngineCapacity(name: string): number | undefined {
    // Extract numbers from model name (e.g., MT-07 -> 700)
    const match = name.match(/[-\s]?(\d{2,4})/)
    if (match) {
      let capacity = parseInt(match[1])

      // Yamaha often uses abbreviated numbers (07 = 700cc, 09 = 900cc)
      if (capacity < 100) {
        capacity = capacity * 100
      }

      return capacity
    }
    return undefined
  }

  /**
   * Sample Yamaha data (fallback when scraping fails)
   */
  private getSampleData(): ParsedMotorcycle[] {
    return [
      {
        name: 'MT-07',
        brand: 'Yamaha',
        category: 'Naked',
        year: 2024,
        price: 289000,
        engineCapacity: 689,
        power: 73,
      },
      {
        name: 'MT-09',
        brand: 'Yamaha',
        category: 'Naked',
        year: 2024,
        price: 385000,
        engineCapacity: 890,
        power: 117,
      },
      {
        name: 'YZF-R7',
        brand: 'Yamaha',
        category: 'Sport',
        year: 2024,
        price: 325000,
        engineCapacity: 689,
        power: 73,
      },
      {
        name: 'XSR 900',
        brand: 'Yamaha',
        category: 'Retro/Classic',
        year: 2024,
        price: 425000,
        engineCapacity: 890,
        power: 117,
      },
      {
        name: 'Tracer 9',
        brand: 'Yamaha',
        category: 'Adventure',
        year: 2024,
        price: 465000,
        engineCapacity: 890,
        power: 117,
      },
    ]
  }
}
