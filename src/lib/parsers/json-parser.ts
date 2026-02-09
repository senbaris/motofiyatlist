import { BaseParser } from './base-parser'
import type { ParserResult, ParsedMotorcycle } from './types'

/**
 * JSON Parser - Parses motorcycle data from JSON files
 *
 * Expected JSON format:
 * [
 *   {
 *     "name": "MT-07",
 *     "year": 2024,
 *     "price": "289.000 TL",
 *     "engine": "689cc",
 *     "power": "73 HP",
 *     ...
 *   }
 * ]
 */
export class JSONParser extends BaseParser {
  async parse(data: string | Buffer): Promise<ParserResult> {
    try {
      const content = typeof data === 'string' ? data : data.toString('utf-8')
      const rawData = JSON.parse(content)

      if (!Array.isArray(rawData)) {
        return this.createErrorResult(['JSON data must be an array'])
      }

      const motorcycles: ParsedMotorcycle[] = []
      const errors: string[] = []

      for (const item of rawData) {
        try {
          const motorcycle = this.parseMotorcycleItem(item)
          if (this.validateMotorcycle(motorcycle)) {
            motorcycles.push(motorcycle)
          } else {
            errors.push(`Invalid motorcycle data: ${item.name || 'unknown'}`)
          }
        } catch (error) {
          errors.push(`Failed to parse item: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      if (motorcycles.length === 0 && errors.length > 0) {
        return this.createErrorResult(errors)
      }

      return {
        ...this.createSuccessResult(motorcycles),
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      return this.createErrorResult([
        `JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      ])
    }
  }

  private parseMotorcycleItem(item: any): ParsedMotorcycle {
    return {
      name: item.name || item.model,
      brand: this.config.brand,
      category: item.category || item.type,
      year: parseInt(item.year) || new Date().getFullYear(),
      price: this.parsePrice(item.price || item.fiyat) || 0,
      previousPrice: this.parsePrice(item.previousPrice || item.eskiFiyat),
      engineCapacity: this.parseEngineCapacity(item.engine || item.motor || item.engineCapacity),
      engineType: item.engineType || item.motorTipi,
      power: this.parsePower(item.power || item.guc || item.hp),
      torque: parseFloat(item.torque || item.tork) || undefined,
      weight: parseInt(item.weight || item.agirlik) || undefined,
      imageUrl: item.image || item.imageUrl || item.gorsel,
      specifications: item.specifications || item.ozellikler,
    }
  }
}
