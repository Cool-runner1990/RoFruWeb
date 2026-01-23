-- ============================================
-- Scans Table Schema
-- For warehouse receipt barcode documentation
-- ============================================

-- Scans table for warehouse receipt documentation
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,                                    -- Device identifier from mobile app
    device_name TEXT,                                           -- Optional friendly device name
    gtin VARCHAR(20) NOT NULL,                                  -- Scanned barcode (EAN/GTIN)
    article_id UUID REFERENCES articles(id) ON DELETE SET NULL, -- Link to article if found
    scan_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (scan_status IN ('ok', 'problem', 'pending')),    -- Scan result status
    weight DECIMAL(10,3),                                       -- Optional weight in kg
    notes TEXT,                                                 -- Optional remarks
    photo_url TEXT,                                             -- Optional proof photo URL
    problem_type TEXT,                                          -- Type of problem if status='problem'
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),              -- When the scan occurred
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()               -- Record creation timestamp
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_gtin ON scans(gtin);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_device_id ON scans(device_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(scan_status);
CREATE INDEX IF NOT EXISTS idx_scans_article_id ON scans(article_id);

-- Enable Row Level Security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Public access policy (matches existing tables)
CREATE POLICY "Allow public access to scans" ON scans
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE scans;

-- Comment for documentation
COMMENT ON TABLE scans IS 'Stores barcode scans from mobile app for warehouse receipt documentation';
