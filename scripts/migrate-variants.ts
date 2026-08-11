import { createClient } from "@supabase/supabase-js";
// @ts-ignore
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log("Starting Variant Migration...");

  // 1. Fetch all products
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, stock, images");

  if (productsError) {
    console.error("Error fetching products:", productsError);
    return;
  }

  console.log(`Found ${products.length} products.`);

  // 2. Fetch existing variants
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("product_id");

  if (variantsError) {
    console.error("Error fetching variants:", variantsError);
    return;
  }

  const productsWithVariants = new Set(variants.map((v) => v.product_id));

  let migratedCount = 0;

  // 3. For each product without a variant, create a DEFAULT variant
  for (const product of products) {
    if (!productsWithVariants.has(product.id)) {
      console.log(`Migrating product ${product.id} (${product.name})...`);

      const defaultSku = `PROD-${product.id.substring(0, 8).toUpperCase()}-DEFAULT`;
      
      const { error: insertError } = await supabase
        .from("product_variants")
        .insert({
          product_id: product.id,
          sku: defaultSku,
          variant_name: "Default",
          price: product.price || 0,
          quantity: product.stock || 0,
          is_active: true,
          images: product.images || [],
        });

      if (insertError) {
        console.error(`Failed to migrate product ${product.id}:`, insertError);
      } else {
        migratedCount++;
      }
    }
  }

  console.log(`Migration complete. Created default variants for ${migratedCount} products.`);
}

migrateData();
