-- motofiyatlist.com - Initial Database Schema
-- This migration creates all necessary tables, indexes, RLS policies, and triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- BRANDS TABLE
-- ============================================================================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  country VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_is_active ON brands(is_active);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- ============================================================================
-- MODELS TABLE
-- ============================================================================
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  year INTEGER NOT NULL,

  -- Technical Specifications
  engine_capacity INTEGER, -- cc
  engine_type VARCHAR(50),
  power_hp DECIMAL(6,2),
  power_kw DECIMAL(6,2),
  torque_nm DECIMAL(6,2),
  fuel_type VARCHAR(20) DEFAULT 'Petrol',
  transmission VARCHAR(50),

  -- Physical Properties
  weight_kg INTEGER,
  fuel_capacity_liters DECIMAL(5,2),
  seat_height_mm INTEGER,

  -- Safety & Technology
  abs BOOLEAN DEFAULT false,
  traction_control BOOLEAN DEFAULT false,
  riding_modes INTEGER DEFAULT 0,

  -- Description & Media
  description TEXT,
  features JSONB, -- Additional features as JSON
  specifications JSONB, -- Full specs as JSON
  image_url TEXT,
  gallery_urls TEXT[], -- Array of image URLs

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, name, year)
);

CREATE INDEX idx_models_brand_id ON models(brand_id);
CREATE INDEX idx_models_category_id ON models(category_id);
CREATE INDEX idx_models_slug ON models(slug);
CREATE INDEX idx_models_year ON models(year);
CREATE INDEX idx_models_engine_capacity ON models(engine_capacity);
CREATE INDEX idx_models_is_active ON models(is_active);
CREATE INDEX idx_models_is_featured ON models(is_featured);
CREATE INDEX idx_models_features ON models USING GIN(features);

-- ============================================================================
-- PRICES TABLE
-- ============================================================================
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  price DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  price_type VARCHAR(20) DEFAULT 'official', -- official, dealer, market
  dealer_name VARCHAR(200),
  source_url TEXT,
  notes TEXT,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_prices_model_id ON prices(model_id);
CREATE INDEX idx_prices_valid_from ON prices(valid_from);
CREATE INDEX idx_prices_is_current ON prices(is_current);
CREATE INDEX idx_prices_created_at ON prices(created_at);

-- ============================================================================
-- PRICE HISTORY TABLE
-- ============================================================================
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  old_price DECIMAL(12,2),
  new_price DECIMAL(12,2) NOT NULL,
  price_change DECIMAL(12,2),
  percentage_change DECIMAL(6,2),
  change_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_model_id ON price_history(model_id);
CREATE INDEX idx_price_history_change_date ON price_history(change_date);

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(200),
  avatar_url TEXT,
  phone VARCHAR(20),
  city VARCHAR(100),
  preferences JSONB,
  role VARCHAR(20) DEFAULT 'user', -- user, admin, editor
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- ============================================================================
-- FAVORITES TABLE
-- ============================================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, model_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_model_id ON favorites(model_id);

-- ============================================================================
-- PRICE ALERTS TABLE
-- ============================================================================
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  target_price DECIMAL(12,2) NOT NULL,
  alert_type VARCHAR(20) DEFAULT 'below', -- below, above, any_change
  is_active BOOLEAN DEFAULT true,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_model_id ON price_alerts(model_id);
CREATE INDEX idx_price_alerts_is_active ON price_alerts(is_active);

-- ============================================================================
-- COMPARISONS TABLE
-- ============================================================================
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200),
  model_ids UUID[] NOT NULL,
  is_public BOOLEAN DEFAULT false,
  share_token VARCHAR(100) UNIQUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comparisons_user_id ON comparisons(user_id);
CREATE INDEX idx_comparisons_share_token ON comparisons(share_token);

-- ============================================================================
-- SCRAPING SOURCES TABLE
-- ============================================================================
CREATE TABLE scraping_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  source_type VARCHAR(50), -- manufacturer, dealer, marketplace
  scraper_config JSONB,
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMPTZ,
  last_scrape_status VARCHAR(20), -- success, failed, partial
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scraping_sources_is_active ON scraping_sources(is_active);

-- ============================================================================
-- SCRAPING LOGS TABLE
-- ============================================================================
CREATE TABLE scraping_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES scraping_sources(id),
  status VARCHAR(20), -- started, completed, failed
  models_found INTEGER DEFAULT 0,
  models_updated INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  error_details JSONB,
  duration_ms INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_scraping_logs_source_id ON scraping_logs(source_id);
CREATE INDEX idx_scraping_logs_started_at ON scraping_logs(started_at);

-- ============================================================================
-- SEO METADATA TABLE
-- ============================================================================
CREATE TABLE seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- brand, model, category, page
  entity_id UUID,
  page_slug VARCHAR(200) UNIQUE,
  title VARCHAR(200),
  description TEXT,
  keywords TEXT[],
  og_image TEXT,
  canonical_url TEXT,
  schema_markup JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seo_metadata_entity ON seo_metadata(entity_type, entity_id);
CREATE INDEX idx_seo_metadata_slug ON seo_metadata(page_slug);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on relevant tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Price Alerts: Users can manage their own alerts
CREATE POLICY "Users can view own alerts" ON price_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON price_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON price_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON price_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Comparisons: Users can manage their own comparisons, public ones are readable by all
CREATE POLICY "Users can view own comparisons" ON comparisons
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own comparisons" ON comparisons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comparisons" ON comparisons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comparisons" ON comparisons
  FOR DELETE USING (auth.uid() = user_id);

-- Public read access for main tables
CREATE POLICY "Public read access for active brands" ON brands
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access for active models" ON models
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for current prices" ON prices
  FOR SELECT USING (is_current = true);

CREATE POLICY "Public read access for price history" ON price_history
  FOR SELECT USING (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comparisons_updated_at BEFORE UPDATE ON comparisons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create price history when price changes
CREATE OR REPLACE FUNCTION track_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if price actually changed and new price is current
  IF NEW.is_current = true AND (OLD IS NULL OR OLD.price != NEW.price) THEN
    INSERT INTO price_history (
      model_id,
      old_price,
      new_price,
      price_change,
      percentage_change,
      source
    ) VALUES (
      NEW.model_id,
      OLD.price,
      NEW.price,
      NEW.price - COALESCE(OLD.price, NEW.price),
      CASE
        WHEN OLD.price IS NOT NULL AND OLD.price > 0
        THEN ((NEW.price - OLD.price) / OLD.price * 100)
        ELSE 0
      END,
      'price_update'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_price_changes AFTER INSERT OR UPDATE ON prices
  FOR EACH ROW EXECUTE FUNCTION track_price_change();

-- ============================================================================
-- INITIAL DATA - CATEGORIES
-- ============================================================================
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('Sport', 'sport', 'Yüksek performanslı sportif motosikletler', 'Zap', 1),
  ('Naked', 'naked', 'Çıplak gövdeli şehir motosikletleri', 'Wind', 2),
  ('Cruiser', 'cruiser', 'Rahat sürüş için tasarlanmış cruiser motosikletler', 'Bike', 3),
  ('Touring', 'touring', 'Uzun yol turları için ideal motosikletler', 'MapPin', 4),
  ('Adventure', 'adventure', 'On-road ve off-road kullanım için adventure motosikletler', 'Mountain', 5),
  ('Scooter', 'scooter', 'Şehir içi kullanım için scooter modelleri', 'Palette', 6),
  ('Off-Road', 'off-road', 'Arazi kullanımına uygun motosikletler', 'TreePine', 7),
  ('Electric', 'electric', 'Elektrikli motosikletler', 'Zap', 8),
  ('Retro/Classic', 'retro-classic', 'Klasik tasarımlı modern motosikletler', 'Gem', 9);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE brands IS 'Motosiklet markaları (Yamaha, Honda, vb.)';
COMMENT ON TABLE categories IS 'Motosiklet kategorileri (Sport, Naked, vb.)';
COMMENT ON TABLE models IS 'Motosiklet modelleri ve teknik özellikleri';
COMMENT ON TABLE prices IS 'Güncel ve geçmiş fiyat kayıtları';
COMMENT ON TABLE price_history IS 'Fiyat değişim geçmişi';
COMMENT ON TABLE user_profiles IS 'Kullanıcı profil bilgileri';
COMMENT ON TABLE favorites IS 'Kullanıcıların favori motosikletleri';
COMMENT ON TABLE price_alerts IS 'Kullanıcı fiyat alarmları';
COMMENT ON TABLE comparisons IS 'Motosiklet karşılaştırmaları';
COMMENT ON TABLE scraping_sources IS 'Web scraping kaynakları';
COMMENT ON TABLE scraping_logs IS 'Scraping işlem logları';
COMMENT ON TABLE seo_metadata IS 'Sayfa SEO metadata bilgileri';
