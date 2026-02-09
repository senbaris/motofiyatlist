export interface ParsedMotorcycle {
  name: string
  brand: string
  category?: string
  year: number
  price: number
  previousPrice?: number
  engineCapacity?: number
  engineType?: string
  power?: number
  torque?: number
  weight?: number
  imageUrl?: string
  specifications?: Record<string, any>
}

export interface ParserResult {
  success: boolean
  motorcycles: ParsedMotorcycle[]
  errors?: string[]
  metadata?: {
    source: string
    parsedAt: Date
    totalFound: number
  }
}

export interface ParserConfig {
  brand: string
  source: string
  type: 'pdf' | 'json' | 'html' | 'web'
}
