import { BaseParser } from './base-parser'
import type { ParserResult, ParsedMotorcycle } from './types'
import * as cheerio from 'cheerio'

/**
 * HTML Parser - Parses motorcycle data from HTML pages
 * Uses CSS selectors to extract data from structured HTML
 */
export class HTMLParser extends BaseParser {
  private selectors: HTMLParserSelectors

  constructor(config: any, selectors: HTMLParserSelectors) {
    super(config)
    this.selectors = selectors
  }

  async parse(data: string | Buffer): Promise<ParserResult> {
    try {
      const html = typeof data === 'string' ? data : data.toString('utf-8')
      const $ = cheerio.load(html)

      const motorcycles: ParsedMotorcycle[] = []
      const errors: string[] = []

      // Find all motorcycle items using the container selector
      $(this.selectors.container).each((_, element) => {
        try {
          const motorcycle = this.parseMotorcycleElement($, element)
          if (this.validateMotorcycle(motorcycle)) {
            motorcycles.push(motorcycle)
          }
        } catch (error) {
          errors.push(`Failed to parse element: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })

      if (motorcycles.length === 0 && errors.length > 0) {
        return this.createErrorResult(errors)
      }

      return {
        ...this.createSuccessResult(motorcycles),
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      return this.createErrorResult([
        `HTML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      ])
    }
  }

  private parseMotorcycleElement($: cheerio.CheerioAPI, element: any): ParsedMotorcycle {
    const $el = $(element)

    const name = $el.find(this.selectors.name).text().trim()
    const priceText = $el.find(this.selectors.price).text().trim()
    const imageUrl = $el.find(this.selectors.image).attr('src')

    // Optional fields
    const categoryText = this.selectors.category ? $el.find(this.selectors.category).text().trim() : undefined
    const engineText = this.selectors.engine ? $el.find(this.selectors.engine).text().trim() : undefined
    const powerText = this.selectors.power ? $el.find(this.selectors.power).text().trim() : undefined

    return {
      name,
      brand: this.config.brand,
      category: categoryText,
      year: new Date().getFullYear(),
      price: this.parsePrice(priceText) || 0,
      engineCapacity: engineText ? this.parseEngineCapacity(engineText) : undefined,
      power: powerText ? this.parsePower(powerText) : undefined,
      imageUrl: imageUrl ? this.resolveImageUrl(imageUrl) : undefined,
    }
  }

  private resolveImageUrl(url: string): string {
    // If URL is already absolute, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    // If URL is protocol-relative, add https
    if (url.startsWith('//')) {
      return `https:${url}`
    }

    // If URL is relative, prepend base URL from source
    const baseUrl = this.config.source.replace(/\/$/, '')
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }
}

export interface HTMLParserSelectors {
  container: string       // CSS selector for each motorcycle item
  name: string           // CSS selector for model name
  price: string          // CSS selector for price
  image: string          // CSS selector for image
  category?: string      // Optional: CSS selector for category
  engine?: string        // Optional: CSS selector for engine info
  power?: string         // Optional: CSS selector for power
}
