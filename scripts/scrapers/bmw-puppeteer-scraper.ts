import puppeteer from 'puppeteer'
import type { ParsedMotorcycle } from '../../src/lib/parsers/types.js'

/**
 * BMW Motorrad Puppeteer Scraper
 * Uses headless browser to render JavaScript and extract motorcycle data
 */
export class BMWPuppeteerScraper {
  private baseUrl = 'https://www.bmw-motorrad.com.tr'
  private modelsUrl = '/tr/models.html' // Alternative: models page instead of price list

  async scrapeMotorcycles(): Promise<ParsedMotorcycle[]> {
    console.log('🚀 Starting BMW Puppeteer scraper...')

    let browser
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      })

      const page = await browser.newPage()

      // Set user agent to avoid detection
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )

      console.log(`📄 Loading ${this.baseUrl}${this.modelsUrl}...`)

      // Navigate to models page
      await page.goto(`${this.baseUrl}${this.modelsUrl}`, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      })

      console.log('⏳ Waiting for content to load...')

      // Wait for page to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Debug: Save page HTML for analysis
      const html = await page.content()
      const fs = await import('fs/promises')
      await fs.writeFile('bmw-page.html', html, 'utf-8')
      console.log('💾 Saved page HTML to bmw-page.html')

      // Debug: Take screenshot
      await page.screenshot({ path: 'bmw-page.png', fullPage: false })
      console.log('📸 Saved screenshot to bmw-page.png')

      // Debug: Get page text content
      const pageText = await page.evaluate(() => document.body.innerText)
      console.log('\n📄 Page Content Preview (first 800 chars):')
      console.log(pageText.substring(0, 800))
      console.log('...\n')

      // Debug: Find all elements with price-like text
      const priceElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'))
        const priceRegex = /[\d.]+(?:,\d{2})?\s*(?:TL|₺)|[\d.]{5,}/

        return elements
          .filter(el => {
            const text = el.textContent || ''
            return text.match(priceRegex) && text.length < 300
          })
          .map(el => ({
            tag: el.tagName,
            class: el.className,
            text: el.textContent?.substring(0, 150),
          }))
          .slice(0, 20) // First 20 matches
      })

      console.log('💰 Found price-like elements:')
      priceElements.forEach((el, i) => {
        console.log(`  ${i + 1}. <${el.tag} class="${el.class}">: ${el.text?.substring(0, 80)}...`)
      })
      console.log()

      // Extract motorcycle data
      const motorcycles = await page.evaluate(() => {
        const results: any[] = []

        // Try multiple selector strategies
        const strategies = [
          // Strategy 1: Common BMW price list structure
          () => {
            const rows = document.querySelectorAll('table tr, .price-row, [class*="price-item"]')
            rows.forEach(row => {
              const text = row.textContent || ''
              const modelMatch = text.match(/([A-Z]\s*\d+\s*[A-Z]*(?:\s*[A-Z]+)?)/i)
              const priceMatch = text.match(/([\d.]+(?:,\d{2})?)\s*(?:TL|₺)/i)

              if (modelMatch && priceMatch) {
                results.push({
                  name: modelMatch[1].trim(),
                  price: priceMatch[1].replace(/\./g, '').replace(',', '.'),
                })
              }
            })
          },

          // Strategy 2: Look for any elements containing prices
          () => {
            const elements = document.querySelectorAll('*')
            elements.forEach(el => {
              const text = el.textContent || ''
              if (text.length < 200 && text.match(/\d{3,}.*(?:TL|₺)/i)) {
                const modelMatch = text.match(/([A-Z]\s*\d+\s*[A-Z]*(?:\s*[A-Z]+)?)/i)
                const priceMatch = text.match(/([\d.]+(?:,\d{2})?)\s*(?:TL|₺)/i)

                if (modelMatch && priceMatch) {
                  results.push({
                    name: modelMatch[1].trim(),
                    price: priceMatch[1].replace(/\./g, '').replace(',', '.'),
                  })
                }
              }
            })
          },
        ]

        // Try each strategy until we get results
        for (const strategy of strategies) {
          strategy()
          if (results.length > 0) break
        }

        return results
      })

      console.log(`✅ Found ${motorcycles.length} motorcycles`)

      await browser.close()

      // If no motorcycles found, fall back to sample data
      if (motorcycles.length === 0) {
        console.log('⚠️  No motorcycles found, using sample data')
        return this.getSampleData()
      }

      // Parse and return motorcycles
      return this.parseMotorcycles(motorcycles)
    } catch (error) {
      console.error('❌ BMW Puppeteer scraping failed:', error)
      if (browser) {
        await browser.close()
      }
      return this.getSampleData()
    }
  }

  private parseMotorcycles(data: any[]): ParsedMotorcycle[] {
    const motorcycles: ParsedMotorcycle[] = []
    const seen = new Set<string>()

    data.forEach(item => {
      const name = this.cleanModelName(item.name)

      // Skip duplicates
      if (seen.has(name)) return
      seen.add(name)

      const price = this.parsePrice(item.price)
      if (!price || price < 10000) return // Skip invalid prices

      motorcycles.push({
        name,
        brand: 'BMW',
        category: this.guessCategory(name),
        year: new Date().getFullYear(),
        price,
        engineCapacity: this.guessEngineCapacity(name),
      })
    })

    return motorcycles
  }

  private cleanModelName(name: string): string {
    return name
      .replace(/^BMW\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private parsePrice(priceStr: string): number {
    const cleaned = priceStr.replace(/[^\d.,]/g, '')
    const normalized = cleaned.replace(/\./g, '').replace(',', '.')
    return parseFloat(normalized) || 0
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
