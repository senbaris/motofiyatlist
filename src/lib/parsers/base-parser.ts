import type { ParserResult, ParserConfig, ParsedMotorcycle } from './types'

export abstract class BaseParser {
  protected config: ParserConfig

  constructor(config: ParserConfig) {
    this.config = config
  }

  /**
   * Main parsing method - must be implemented by each parser
   */
  abstract parse(data: string | Buffer): Promise<ParserResult>

  /**
   * Normalize price string to number
   * Handles: "185.000 TL", "185,000 ₺", "185000"
   */
  protected parsePrice(priceText: string): number | undefined {
    if (!priceText) return undefined

    // Remove all non-digit characters except comma and dot
    const cleaned = priceText.replace(/[^\d,\.]/g, '')

    // Handle Turkish format: 185.000,50 -> 185000.50
    const normalized = cleaned.replace(/\./g, '').replace(',', '.')

    const price = parseFloat(normalized)
    return isNaN(price) ? undefined : price
  }

  /**
   * Parse engine capacity from text
   * Handles: "689cc", "689 cc", "689"
   */
  protected parseEngineCapacity(text: string): number | undefined {
    if (!text) return undefined

    const match = text.match(/(\d+)\s*c?c?/i)
    const capacity = match ? parseInt(match[1]) : undefined

    return capacity && capacity > 0 ? capacity : undefined
  }

  /**
   * Parse power from text
   * Handles: "73 HP", "73hp", "73 PS", "54 kW"
   */
  protected parsePower(text: string): number | undefined {
    if (!text) return undefined

    const hpMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hp|ps|bhp)/i)
    if (hpMatch) return parseFloat(hpMatch[1])

    const kwMatch = text.match(/(\d+(?:\.\d+)?)\s*kw/i)
    if (kwMatch) return parseFloat(kwMatch[1]) * 1.341 // Convert kW to HP

    return undefined
  }

  /**
   * Generate slug from name
   */
  protected generateSlug(brand: string, name: string, year: number): string {
    const combined = `${brand}-${name}-${year}`
    return combined
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Validate parsed motorcycle data
   */
  protected validateMotorcycle(moto: ParsedMotorcycle): boolean {
    return !!(
      moto.name &&
      moto.brand &&
      moto.year &&
      moto.price &&
      moto.price > 0
    )
  }

  /**
   * Create successful result
   */
  protected createSuccessResult(motorcycles: ParsedMotorcycle[]): ParserResult {
    return {
      success: true,
      motorcycles,
      metadata: {
        source: this.config.source,
        parsedAt: new Date(),
        totalFound: motorcycles.length,
      },
    }
  }

  /**
   * Create error result
   */
  protected createErrorResult(errors: string[]): ParserResult {
    return {
      success: false,
      motorcycles: [],
      errors,
      metadata: {
        source: this.config.source,
        parsedAt: new Date(),
        totalFound: 0,
      },
    }
  }
}
