import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']?.trim()?.replace(/["']/g, '');
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim()?.replace(/["']/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSchema() {
  const { data: products } = await supabase.from('products').select('id, name, images');
  const { data: variants } = await supabase.from('product_variants').select('id, product_id, images');

  const productImagesMap = new Map(products?.map(p => [p.id, p.images]) || []);

  let legacyCount = 0;
  let totalLegacyVariants = 0;

  const legacyProducts = new Map();

  for (const variant of (variants || [])) {
    const originalImages = Array.isArray(variant.images) ? variant.images : [];
    const parentImages = productImagesMap.get(variant.product_id) || [];
    const imagesToProcess = originalImages.length > 0 ? originalImages : parentImages;
    const hasUnsplash = imagesToProcess.some((img: string) => img.includes("unsplash.com"));

    if (hasUnsplash) {
      if (!legacyProducts.has(variant.product_id)) {
        legacyProducts.set(variant.product_id, []);
      }
      legacyProducts.get(variant.product_id).push(variant);
      totalLegacyVariants++;
    }
  }

  console.log(`Legacy products: ${legacyProducts.size}, Legacy variants: ${totalLegacyVariants}`);
}

testSchema().catch(console.error);
