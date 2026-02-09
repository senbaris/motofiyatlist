import axios from 'axios'
import * as cheerio from 'cheerio'
import type { ParsedMotorcycle, ParserResult } from '../parsers/types'

/**
 * Web Scraper - Fetches and parses motorcycle data from websites
 * This is a client-side compatible version (no Puppeteer)
 */
export class WebScraper {
  protected brand: string
  private url: string

  constructor(brand: string, url: string) {
    this.brand = brand
    this.url = url
  }

  /**
   * Fetch HTML from URL
   */
  async fetchHTML(): Promise<string> {
    try {
      const response = await axios.get(this.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch ${this.url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Parse HTML with custom selector function
   */
  parseHTML(
    html: string,
    selectorFn: ($: cheerio.CheerioAPI) => ParsedMotorcycle[]
  ): ParserResult {
    try {
      const $ = cheerio.load(html)
      const motorcycles = selectorFn($)

      return {
        success: true,
        motorcycles,
        metadata: {
          source: this.url,
          parsedAt: new Date(),
          totalFound: motorcycles.length,
        },
      }
    } catch (error) {
      return {
        success: false,
        motorcycles: [],
        errors: [`Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        metadata: {
          source: this.url,
          parsedAt: new Date(),
          totalFound: 0,
        },
      }
    }
  }

  /**
   * Scrape and parse in one go
   */
  async scrape(
    selectorFn: ($: cheerio.CheerioAPI) => ParsedMotorcycle[]
  ): Promise<ParserResult> {
    const html = await this.fetchHTML()
    return this.parseHTML(html, selectorFn)
  }
}

/**
 * Helper functions for parsing
 */
export const ScraperUtils = {
  parsePrice(text: string): number | undefined {
    if (!text) return undefined
    const cleaned = text.replace(/[^\d,\.]/g, '')
    const normalized = cleaned.replace(/\./g, '').replace(',', '.')
    const price = parseFloat(normalized)
    return isNaN(price) ? undefined : price
  },

  parseEngineCapacity(text: string): number | undefined {
    if (!text) return undefined
    const match = text.match(/(\d+)\s*c?c?/i)
    return match ? parseInt(match[1]) : undefined
  },

  parsePower(text: string): number | undefined {
    if (!text) return undefined
    const hpMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hp|ps|bhp)/i)
    if (hpMatch) return parseFloat(hpMatch[1])
    const kwMatch = text.match(/(\d+(?:\.\d+)?)\s*kw/i)
    if (kwMatch) return parseFloat(kwMatch[1]) * 1.341
    return undefined
  },
}
