# Daily Automated Scraping Setup

This document explains how to set up daily automated motorcycle price scraping to Supabase.

## Overview

The scraping system:
- Fetches latest prices from BMW, Yamaha, Kawasaki, and Honda websites
- Automatically uploads to Supabase database
- Tracks price changes in `price_history` table
- Can trigger price alerts for users

## Quick Start

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public anon key (for frontend)
- `SUPABASE_SERVICE_KEY` - Service role key (for scraping script)

⚠️ **IMPORTANT**: Never commit `.env.local` or expose `SUPABASE_SERVICE_KEY` to the client!

### 2. Manual Scraping

Run scrapers manually to test:

```bash
# Scrape all brands and save to JSON file
npm run scrape

# Scrape specific brand
npm run scrape:bmw
npm run scrape:yamaha
npm run scrape:kawasaki
npm run scrape:honda

# Scrape and upload to Supabase
npm run scrape:upload
```

### 3. Automated Daily Scraping

We provide two options for automation:

#### Option A: GitHub Actions (Recommended)

The repository includes a GitHub Actions workflow (`.github/workflows/daily-scraping.yml`) that runs daily at 2 AM UTC.

**Setup:**

1. Go to your GitHub repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `VITE_SUPABASE_URL` - Your Supabase URL
   - `SUPABASE_SERVICE_KEY` - Your service role key

3. The workflow will run automatically every day
4. You can also trigger it manually from the Actions tab

**Benefits:**
- Free (within GitHub Actions limits)
- No server maintenance
- Email notifications on failure
- Logs available in GitHub

#### Option B: Vercel Cron Jobs

If you deploy to Vercel, you can use Vercel Cron Jobs:

1. Create `/api/cron/scrape.ts`:

```typescript
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// Import your scraping logic

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Run scraping...

  return new Response('OK', { status: 200 })
}
```

2. Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/scrape",
    "schedule": "0 2 * * *"
  }]
}
```

#### Option C: External Cron Service

Use services like:
- **EasyCron** - https://www.easycron.com
- **Cron-job.org** - https://cron-job.org
- **Render** - https://render.com (with cron jobs)

Setup:
1. Deploy a serverless function that runs `npm run scrape:upload`
2. Configure the cron service to call your endpoint daily

## Database Schema

The scraping script expects the following Supabase tables:

### `brands`
```sql
- id (uuid, primary key)
- name (text)
- slug (text, unique)
- is_active (boolean)
- created_at (timestamp)
```

### `models`
```sql
- id (uuid, primary key)
- brand_id (uuid, foreign key → brands.id)
- name (text)
- slug (text, unique)
- year (integer)
- price (numeric)
- category (text)
- engine_capacity (integer) -- in cc
- power_hp (numeric)
- torque_nm (numeric)
- weight_kg (numeric)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### `price_history`
```sql
- id (uuid, primary key)
- model_id (uuid, foreign key → models.id)
- old_price (numeric)
- new_price (numeric)
- price_change (numeric) -- absolute change
- percentage_change (numeric) -- percentage change
- change_date (timestamp)
- created_at (timestamp)
```

## How It Works

1. **Scraping**: Each brand scraper fetches data from manufacturer websites:
   - BMW: borusanotomotiv.com (iframe)
   - Yamaha: tr-yamaha-motor.com (direct HTML)
   - Kawasaki: kawasaki.com.tr (direct HTML)
   - Honda: honda.com.tr (Puppeteer)

2. **Data Processing**:
   - Clean and normalize model names
   - Parse prices (handle Turkish number format: 185.000 → 185000)
   - Extract technical specifications
   - Guess categories if not provided

3. **Database Upload**:
   - Check if motorcycle exists (by brand + name)
   - If new: Insert into `models` table
   - If exists: Update price and specs
   - If price changed: Insert into `price_history`

4. **Price Change Detection**:
   - Compare old vs new price
   - Calculate absolute and percentage change
   - Log to `price_history` table
   - (Future) Trigger price alerts

## Monitoring

### Check Scraping Logs

GitHub Actions:
- Go to Actions tab in GitHub
- Click on latest "Daily Motorcycle Price Scraping" run
- View logs for each step

Manual:
```bash
npm run scrape:upload 2>&1 | tee scraping.log
```

### View Price Changes

Query Supabase:

```sql
-- Recent price changes
SELECT
  m.brand,
  m.name,
  ph.old_price,
  ph.new_price,
  ph.price_change,
  ph.percentage_change,
  ph.change_date
FROM price_history ph
JOIN models m ON m.id = ph.model_id
ORDER BY ph.change_date DESC
LIMIT 20;

-- Biggest price increases
SELECT
  m.brand,
  m.name,
  ph.old_price,
  ph.new_price,
  ph.percentage_change
FROM price_history ph
JOIN models m ON m.id = ph.model_id
WHERE ph.change_date >= NOW() - INTERVAL '30 days'
ORDER BY ph.percentage_change DESC
LIMIT 10;
```

## Troubleshooting

### Scraping Fails

1. **403 Forbidden**: Website blocked the scraper
   - Check if website structure changed
   - Try updating User-Agent header
   - Add delays between requests

2. **No Data Scraped**: HTML structure changed
   - Inspect the target website
   - Update CSS selectors in scraper
   - Check console logs for errors

3. **Puppeteer Timeout**: Honda scraper times out
   - Increase timeout: `await page.waitForSelector('...', { timeout: 30000 })`
   - Check if website is down
   - Verify Puppeteer dependencies installed

### Database Errors

1. **Connection Failed**:
   - Verify `VITE_SUPABASE_URL` is correct
   - Check `SUPABASE_SERVICE_KEY` is set
   - Ensure Supabase project is active

2. **Permission Denied**:
   - Service key is required (not anon key)
   - Check RLS policies on tables
   - Verify service role has access

3. **Duplicate Key Error**:
   - Model already exists with same slug
   - Update logic to handle duplicates
   - Check brand_id is correct

## Best Practices

1. **Rate Limiting**: Add delays between requests to avoid overloading websites
2. **Error Handling**: Always catch errors and log them
3. **Monitoring**: Set up alerts for scraping failures
4. **Backups**: Keep historical price data in `price_history`
5. **Testing**: Test scrapers manually before automating

## Future Enhancements

- [ ] Add more motorcycle brands (Suzuki, KTM, Ducati, etc.)
- [ ] Implement price alert notifications (email/SMS)
- [ ] Add scraping dashboard in admin panel
- [ ] Track scraping success rates
- [ ] Add data quality checks
- [ ] Implement fallback scrapers for redundancy
- [ ] Add image scraping and storage

## Support

If scraping fails or you need help:
1. Check GitHub Actions logs
2. Review scraper code in `scripts/scrapers/`
3. Test manually with `npm run scrape`
4. Open an issue with error logs
