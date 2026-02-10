/**
 * Backend Scraper Runner
 * Runs Puppeteer scrapers and outputs results
 *
 * Usage:
 *   npm run scrape              - Run all scrapers
 *   npm run scrape bmw          - Run BMW scraper only
 *   npm run scrape yamaha       - Run Yamaha scraper only
 */

import { BMWBorusanScraper } from './scrapers/bmw-borusan-scraper.js'
import { YamahaDirectScraper } from './scrapers/yamaha-direct-scraper.js'
import { HondaPuppeteerScraper } from './scrapers/honda-puppeteer-scraper.js'
import { KawasakiDirectScraper } from './scrapers/kawasaki-direct-scraper.js'

interface ScraperResult {
  brand: string
  motorcycles: any[]
  duration: number
  error?: string
}

async function runScraper(brand: string, Scraper: any): Promise<ScraperResult> {
  const startTime = Date.now()

  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`🏍️  ${brand.toUpperCase()} SCRAPER`)
    console.log('='.repeat(60))

    const scraper = new Scraper()
    const motorcycles = await scraper.scrapeMotorcycles()
    const duration = Date.now() - startTime

    console.log(`✅ ${brand}: Found ${motorcycles.length} motorcycles in ${(duration / 1000).toFixed(2)}s`)

    return {
      brand,
      motorcycles,
      duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error(`❌ ${brand}: ${errorMessage}`)

    return {
      brand,
      motorcycles: [],
      duration,
      error: errorMessage,
    }
  }
}

async function main() {
  const targetBrand = process.argv[2]?.toLowerCase()

  console.log('\n🚀 Starting Motorcycle Price Scrapers...\n')
  console.log(`Target: ${targetBrand || 'ALL BRANDS'}`)
  console.log(`Time: ${new Date().toLocaleString('tr-TR')}\n`)

  const scrapers: Record<string, any> = {
    bmw: BMWBorusanScraper,
    yamaha: YamahaDirectScraper,
    honda: HondaPuppeteerScraper,
    kawasaki: KawasakiDirectScraper,
  }

  const results: ScraperResult[] = []

  if (targetBrand && scrapers[targetBrand]) {
    // Run single scraper
    const result = await runScraper(targetBrand, scrapers[targetBrand])
    results.push(result)
  } else if (targetBrand) {
    console.error(`❌ Unknown brand: ${targetBrand}`)
    console.log(`Available brands: ${Object.keys(scrapers).join(', ')}`)
    process.exit(1)
  } else {
    // Run all scrapers in sequence (not parallel to avoid overwhelming sites)
    for (const [brand, Scraper] of Object.entries(scrapers)) {
      const result = await runScraper(brand, Scraper)
      results.push(result)

      // Wait a bit between scrapers to be respectful
      if (brand !== 'kawasaki') {
        console.log('\n⏳ Waiting 2s before next scraper...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 SCRAPING SUMMARY')
  console.log('='.repeat(60))

  const totalMotorcycles = results.reduce((sum, r) => sum + r.motorcycles.length, 0)
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  const successCount = results.filter(r => !r.error).length
  const errorCount = results.filter(r => r.error).length

  console.log(`\nTotal Motorcycles: ${totalMotorcycles}`)
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`)
  console.log(`Successful: ${successCount}/${results.length}`)
  console.log(`Failed: ${errorCount}/${results.length}`)

  console.log('\nBy Brand:')
  results.forEach(result => {
    const status = result.error ? '❌' : '✅'
    const count = result.motorcycles.length
    const duration = (result.duration / 1000).toFixed(2)
    console.log(`  ${status} ${result.brand.toUpperCase()}: ${count} models (${duration}s)`)
  })

  // Output JSON file
  const outputFile = `motorcycles-${new Date().toISOString().split('T')[0]}.json`
  const allMotorcycles = results.flatMap(r => r.motorcycles)

  const fs = await import('fs/promises')
  await fs.writeFile(
    outputFile,
    JSON.stringify(allMotorcycles, null, 2),
    'utf-8'
  )

  console.log(`\n💾 Saved ${allMotorcycles.length} motorcycles to ${outputFile}`)
  console.log('\n✨ Done!\n')
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
