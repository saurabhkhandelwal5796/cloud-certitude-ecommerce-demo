-- 1. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review_text TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Additional fields to support existing app features
    title TEXT,
    helpful_count INTEGER DEFAULT 0,
    reported BOOLEAN DEFAULT false,
    helpful_user_emails TEXT[] DEFAULT '{}'
);

-- 2. Seed data for reviews
INSERT INTO reviews (product_id, customer_email, customer_name, rating, review_text, is_verified_purchase, created_at, title, helpful_count, reported, helpful_user_emails)
VALUES
('m1', 'eleanor@sky.net', 'Eleanor Vance', 5, 'Absolutely stunning quality. The cashmere feels exceptionally soft and heavy. The drape is elegant and tailored to perfection.', true, '2026-07-12T00:00:00Z', 'Stunning Cashmere Quality!', 24, false, '{}'),
('m1', 'julian@gmail.com', 'Julian Brooks', 5, 'Highly recommend this piece. Fits perfectly across the shoulders, and the fabric breathes well in warm environments.', true, '2026-06-30T00:00:00Z', 'Perfect Tailoring', 15, false, '{}'),
('m1', 'saskia@yahoo.in', 'Saskia Sterling', 4, 'Exquisite details. The buttons feel solid and high-end. Deducted one star only because shipping took an extra day.', false, '2026-06-14T00:00:00Z', 'Exquisite details', 8, false, '{}'),
('w1', 'sarah@sky.net', 'Sarah Connor', 5, 'Exquisite floor-length evening gown crafted from heavy 100% mulberry silk satin with a delicate drape back. Fit is phenomenal.', true, '2026-07-10T00:00:00Z', 'Worth every single rupee!', 42, false, '{}'),
('w1', 'emma@watson.co.uk', 'Emma Watson', 5, 'Simply breathtaking gown. The texture and sheen under ambient lighting are mesmerizing. Perfect for high-profile galas.', true, '2026-06-24T00:00:00Z', 'Pure elegance and class', 19, false, '{}'),
('w2', 'clarissa@gmail.com', 'Clarissa Finch', 5, 'The material texture is beautiful. You can tell this is crafted with care from sustainable organic extra-fine wool fabrics.', true, '2026-05-10T00:00:00Z', 'Responsible luxury knitwear', 12, false, '{}'),
('w2', 'dimitri@outlook.com', 'Dimitri Mercer', 4, 'An essential addition to my capsule wardrobe. Minimalist, premium, and holds its shape well after cleaning. Slightly larger than expected.', true, '2026-05-28T00:00:00Z', 'Warm and cozy oversized look', 3, false, '{}')
ON CONFLICT (id) DO NOTHING;
