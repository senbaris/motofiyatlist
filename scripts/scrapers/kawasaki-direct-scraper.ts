import * as cheerio from 'cheerio'
import type { ParsedMotorcycle } from '../../src/lib/parsers/types.js'

/**
 * Kawasaki Direct Scraper
 * Scrapes from kawasaki.com.tr/Home/FiyatListesi
 * Simple HTML parsing without Puppeteer
 */
export class KawasakiDirectScraper {
  private priceListUrl = 'https://www.kawasaki.com.tr/Home/FiyatListesi'

  async scrapeMotorcycles(): Promise<ParsedMotorcycle[]> {
    console.log('🚀 Starting Kawasaki Direct scraper...')
    console.log(`📄 Fetching ${this.priceListUrl}...`)

    try {
      const html = await this.fetchPage()
      console.log(`✅ Page fetched (${(html.length / 1024).toFixed(0)} KB)`)

      const motorcycles = this.parseHTML(html)
      console.log(`✅ Found ${motorcycles.length} motorcycles`)

      return motorcycles.length > 0 ? motorcycles : this.getSampleData()
    } catch (error) {
      console.error('❌ Kawasaki scraping failed:', error)
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

    // Parse table rows - Kawasaki uses a simple table structure
    // Format: <td>Model Name</td><td>Category</td><td>Price ₺</td>
    $('table tr').each((_, el) => {
      const $row = $(el)
      const cells = $row.find('td')

      if (cells.length >= 3) {
        // Extract model name from first cell
        const modelText = $(cells[0]).find('h6').text().trim()

        // Extract category from second cell (optional)
        const categoryText = $(cells[1]).find('h6').text().trim()

        // Extract price from third cell (format: "582.000 ₺")
        const priceText = $(cells[2]).find('h6').text().trim()
        const priceMatch = priceText.match(/([\d.]+)\s*₺/)

        if (modelText && priceMatch) {
          const name = this.cleanModelName(modelText)
          const price = this.parsePrice(priceMatch[1])

          if (name && price > 10000) {
            motorcycles.push({
              name,
              brand: 'Kawasaki',
              category: this.mapCategory(categoryText) || this.guessCategory(name),
              year: new Date().getFullYear(),
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
      .replace(/^KAWASAKI\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private mapCategory(categoryText: string): string | undefined {
    if (!categoryText) return undefined

    const categoryUpper = categoryText.toUpperCase()

    if (categoryUpper.includes('SUPERSPORT') || categoryUpper.includes('SPORT')) return 'Sport'
    if (categoryUpper.includes('NAKED')) return 'Naked'
    if (categoryUpper.includes('TOURING')) return 'Touring'
    if (categoryUpper.includes('ADVENTURE')) return 'Adventure'
    if (categoryUpper.includes('CRUISER')) return 'Cruiser'
    if (categoryUpper.includes('OFF') || categoryUpper.includes('ENDURO')) return 'Off-Road'
    if (categoryUpper.includes('HYBRID')) return 'Hybrid'

    return undefined
  }

  private guessCategory(name: string): string | undefined {
    const nameUpper = name.toUpperCase()

    if (nameUpper.includes('NINJA')) return 'Sport'
    if (nameUpper.includes('Z ') || nameUpper.startsWith('Z')) return 'Naked'
    if (nameUpper.includes('VERSYS')) return 'Adventure'
    if (nameUpper.includes('W ')) return 'Retro/Classic'
    if (nameUpper.includes('VULCAN')) return 'Cruiser'
    if (nameUpper.includes('KLX') || nameUpper.includes('KX')) return 'Off-Road'
    if (nameUpper.includes('HYBRID')) return 'Hybrid'

    return undefined
  }

  private guessEngineCapacity(name: string): number | undefined {
    // Extract numbers from model name (e.g., Ninja 650 -> 650, Z900 -> 900)
    const match = name.match(/\b(\d{3,4})\b/)
    return match ? parseInt(match[1]) : undefined
  }

  /**
   * Sample Kawasaki data (fallback when scraping fails)
   */
  private getSampleData(): ParsedMotorcycle[] {
    return [
      {
        name: 'Ninja 650',
        brand: 'Kawasaki',
        category: 'Sport',
        year: 2024,
        price: 295000,
        engineCapacity: 649,
        power: 68,
      },
      {
        name: 'Z 900',
        brand: 'Kawasaki',
        category: 'Naked',
        year: 2024,
        price: 425000,
        engineCapacity: 948,
        power: 125,
      },
    ]
  }
}
