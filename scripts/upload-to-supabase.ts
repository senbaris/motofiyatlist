/**
 * Upload Scraped Data to Supabase
 *
 * This script:
 * 1. Runs all scrapers to fetch latest prices
 * 2. Uploads motorcycles to Supabase database
 * 3. Tracks price changes in price_history table
 * 4. Triggers price alerts if needed
 *
 * Usage:
 *   npm run scrape:upload
 */

// Load environment variables from .env.local (only in local development)
import dotenv from 'dotenv'
import { existsSync } from 'fs'

// Load .env.local if it exists (local development), otherwise use process.env (CI/GitHub Actions)
if (existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
}

import { createClient } from '@supabase/supabase-js'
import { BMWBorusanScraper } from './scrapers/bmw-borusan-scraper.js'
import { YamahaDirectScraper } from './scrapers/yamaha-direct-scraper.js'
import { HondaPuppeteerScraper } from './scrapers/honda-puppeteer-scraper.js'
import { KawasakiDirectScraper } from './scrapers/kawasaki-direct-scraper.js'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.log('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ScrapedMotorcycle {
  brand: string
  name: string
  price: number
  year?: number
  category?: string
  engineCapacity?: number
  power?: number
  torque?: number
  weight?: number
}

async function scrapeAllBrands(): Promise<ScrapedMotorcycle[]> {
  console.log('🚀 Starting scraping process...\n')

  const scrapers = [
    { name: 'BMW', scraper: new BMWBorusanScraper() },
    { name: 'Yamaha', scraper: new YamahaDirectScraper() },
    { name: 'Kawasaki', scraper: new KawasakiDirectScraper() },
    { name: 'Honda', scraper: new HondaPuppeteerScraper() },
  ]

  const allMotorcycles: ScrapedMotorcycle[] = []

  for (const { name, scraper } of scrapers) {
    try {
      console.log(`🏍️  Scraping ${name}...`)
      const motorcycles = await scraper.scrapeMotorcycles()
      allMotorcycles.push(...motorcycles)
      console.log(`✅ ${name}: ${motorcycles.length} motorcycles scraped`)
    } catch (error) {
      console.error(`❌ ${name} failed:`, error)
    }

    // Wait between scrapers
    if (name !== 'Honda') {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  console.log(`\n📊 Total: ${allMotorcycles.length} motorcycles scraped\n`)
  return allMotorcycles
}

async function uploadToSupabase(motorcycles: ScrapedMotorcycle[]) {
  console.log('💾 Uploading to Supabase...\n')

  let newCount = 0
  let updatedCount = 0
  let priceChanges = 0

  for (const motorcycle of motorcycles) {
    try {
      // Create unique identifier
      const motorcycleKey = `${motorcycle.brand}-${motorcycle.name}`

      // Check if motorcycle exists
      const { data: existing } = await supabase
        .from('models')
        .select('id, price')
        .eq('brand', motorcycle.brand)
        .eq('name', motorcycle.name)
        .single()

      if (existing) {
        // Update existing motorcycle
        const oldPrice = existing.price || 0
        const newPrice = motorcycle.price

        // Update model
        await supabase
          .from('models')
          .update({
            price: newPrice,
            year: motorcycle.year,
            category: motorcycle.category,
            engine_capacity: motorcycle.engineCapacity,
            power_hp: motorcycle.power,
            torque_nm: motorcycle.torque,
            weight_kg: motorcycle.weight,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        updatedCount++

        // Track price change
        if (oldPrice > 0 && newPrice !== oldPrice) {
          const priceChange = newPrice - oldPrice
          const percentageChange = ((priceChange / oldPrice) * 100).toFixed(2)

          await supabase.from('price_history').insert({
            model_id: existing.id,
            old_price: oldPrice,
            new_price: newPrice,
            price_change: priceChange,
            percentage_change: parseFloat(percentageChange),
            change_date: new Date().toISOString(),
          })

          priceChanges++

          console.log(
            `📈 ${motorcycleKey}: ${oldPrice.toLocaleString('tr-TR')} ₺ → ${newPrice.toLocaleString('tr-TR')} ₺ (${priceChange > 0 ? '+' : ''}${percentageChange}%)`
          )
        }
      } else {
        // Insert new motorcycle
        const { data: brand } = await supabase
          .from('brands')
          .select('id')
          .eq('name', motorcycle.brand)
          .single()

        let brandId = brand?.id

        // Create brand if doesn't exist
        if (!brandId) {
          const { data: newBrand } = await supabase
            .from('brands')
            .insert({
              name: motorcycle.brand,
              slug: motorcycle.brand.toLowerCase(),
              is_active: true,
            })
            .select('id')
            .single()

          brandId = newBrand?.id
        }

        // Insert motorcycle
        await supabase.from('models').insert({
          brand_id: brandId,
          name: motorcycle.name,
          slug: `${motorcycle.brand.toLowerCase()}-${motorcycle.name.toLowerCase().replace(/\s+/g, '-')}`,
          year: motorcycle.year || new Date().getFullYear(),
          price: motorcycle.price,
          category: motorcycle.category,
          engine_capacity: motorcycle.engineCapacity,
          power_hp: motorcycle.power,
          torque_nm: motorcycle.torque,
          weight_kg: motorcycle.weight,
          is_active: true,
        })

        newCount++
        console.log(`✨ ${motorcycleKey}: Added (${motorcycle.price.toLocaleString('tr-TR')} ₺)`)
      }
    } catch (error) {
      console.error(`❌ Error processing ${motorcycle.brand} ${motorcycle.name}:`, error)
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 UPLOAD SUMMARY')
  console.log('='.repeat(60))
  console.log(`New motorcycles: ${newCount}`)
  console.log(`Updated motorcycles: ${updatedCount}`)
  console.log(`Price changes: ${priceChanges}`)
  console.log('='.repeat(60))
}

async function main() {
  try {
    const startTime = Date.now()

    // Scrape all brands
    const motorcycles = await scrapeAllBrands()

    if (motorcycles.length === 0) {
      console.error('❌ No motorcycles scraped, aborting upload')
      process.exit(1)
    }

    // Upload to Supabase
    await uploadToSupabase(motorcycles)

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`\n✨ Done in ${duration}s!\n`)
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

main()
