import { BaseParser } from './base-parser'
import type { ParserResult, ParsedMotorcycle } from './types'

/**
 * PDF Parser - Parses motorcycle data from PDF files
 *
 * Note: PDF parsing in browser requires pdf-parse library
 * This is a basic implementation that extracts text and uses regex patterns
 */
export class PDFParser extends BaseParser {
  private patterns: PDFParserPatterns

  constructor(config: any, patterns?: PDFParserPatterns) {
    super(config)
    this.patterns = patterns || this.getDefaultPatterns()
  }

  async parse(data: string | Buffer): Promise<ParserResult> {
    try {
      // Note: In a real implementation, you would use pdf-parse or similar
      // For now, we'll handle text-based PDFs that have been pre-extracted
      const text = typeof data === 'string' ? data : data.toString('utf-8')

      const motorcycles: ParsedMotorcycle[] = []

      // Split by lines and parse each potential motorcycle entry
      const lines = text.split('\n')
      let currentMotorcycle: Partial<ParsedMotorcycle> | null = null

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        // Try to match motorcycle name
        const nameMatch = trimmed.match(this.patterns.name)
        if (nameMatch) {
          // Save previous motorcycle if exists
          if (currentMotorcycle && this.isCompleteMotorcycle(currentMotorcycle)) {
            motorcycles.push(currentMotorcycle as ParsedMotorcycle)
          }

          // Start new motorcycle
          currentMotorcycle = {
            name: nameMatch[1].trim(),
            brand: this.config.brand,
            year: new Date().getFullYear(),
          }
          continue
        }

        if (!currentMotorcycle) continue

        // Try to match price
        const priceMatch = trimmed.match(this.patterns.price)
        if (priceMatch) {
          currentMotorcycle.price = this.parsePrice(priceMatch[0])
          continue
        }

        // Try to match engine capacity
        const engineMatch = trimmed.match(this.patterns.engine)
        if (engineMatch) {
          currentMotorcycle.engineCapacity = this.parseEngineCapacity(engineMatch[0])
          continue
        }

        // Try to match power
        const powerMatch = trimmed.match(this.patterns.power)
        if (powerMatch) {
          currentMotorcycle.power = this.parsePower(powerMatch[0])
          continue
        }
      }

      // Add last motorcycle
      if (currentMotorcycle && this.isCompleteMotorcycle(currentMotorcycle)) {
        motorcycles.push(currentMotorcycle as ParsedMotorcycle)
      }

      if (motorcycles.length === 0) {
        return this.createErrorResult(['No motorcycles found in PDF'])
      }

      return this.createSuccessResult(motorcycles)
    } catch (error) {
      return this.createErrorResult([
        `PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      ])
    }
  }

  private isCompleteMotorcycle(moto: Partial<ParsedMotorcycle>): moto is ParsedMotorcycle {
    return !!(moto.name && moto.brand && moto.year && moto.price && moto.price > 0)
  }

  private getDefaultPatterns(): PDFParserPatterns {
    return {
      name: /^([A-Z][A-Z0-9\-\s]+)/,
      price: /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:TL|₺)/i,
      engine: /(\d+)\s*c?c/i,
      power: /(\d+(?:\.\d+)?)\s*(?:hp|ps|bhp|kw)/i,
    }
  }
}

export interface PDFParserPatterns {
  name: RegExp
  price: RegExp
  engine: RegExp
  power: RegExp
}
