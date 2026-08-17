import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// Load env variables
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const firstEqual = trimmed.indexOf("=");
        if (firstEqual !== -1) {
          const key = trimmed.substring(0, firstEqual).trim();
          const val = trimmed.substring(firstEqual + 1).trim().replace(/^['"]|['"]$/g, "");
          process.env[key] = val;
        }
      }
    }
  }
} catch (err) {
  console.error("Failed to read env file", err);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function runAudit() {
  console.log("Fetching catalog products and variants...");
  
  // Paginated products
  let products: any[] = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, images")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    products = products.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  // Paginated variants
  let variants: any[] = [];
  page = 0;
  while (true) {
    const { data, error } = await supabase
      .from("product_variants")
      .select("id, product_id, images, sku")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    variants = variants.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log(`Retrieved ${products.length} products and ${variants.length} variants.`);

  const productImagesMap = new Map(products.map((p) => [p.id, Array.isArray(p.images) ? p.images : []]));
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  // Track remaining items containing Unsplash URLs
  let totalRemainingProducts = 0;
  const remainingProductIds = new Set<string>();
  
  const allUnsplashUrls: string[] = [];
  const uniqueUnsplashUrlsSet = new Set<string>();
  
  // Group products & variants by image count
  const productImagesGroup: Record<number, number> = {};
  const variantImagesGroup: Record<number, number> = {};

  // Unusual large image counts
  const unusualProducts: Array<{ id: string; name: string; count: number }> = [];
  const unusualVariants: Array<{ id: string; sku: string; count: number }> = [];

  // Group variants
  for (const v of variants) {
    const currentImages = Array.isArray(v.images) ? v.images : [];
    const parentImages = productImagesMap.get(v.product_id) || [];
    
    // We check unsplash urls
    const imagesToCheck = currentImages.length > 0 ? currentImages : parentImages;
    const unsplashUrls = imagesToCheck.filter((img: string) => img.includes("unsplash.com"));

    // Track total image count groups (for all images, not just unsplash)
    const totalCount = imagesToCheck.length;
    variantImagesGroup[totalCount] = (variantImagesGroup[totalCount] || 0) + 1;

    if (totalCount > 5) {
      unusualVariants.push({ id: v.id, sku: v.sku, count: totalCount });
    }

    if (unsplashUrls.length > 0) {
      remainingProductIds.add(v.product_id);
      unsplashUrls.forEach((url: string) => {
        allUnsplashUrls.push(url);
        uniqueUnsplashUrlsSet.add(url);
      });
    }
  }

  // Count products group
  for (const p of products) {
    const pImages = Array.isArray(p.images) ? p.images : [];
    const totalCount = pImages.length;
    productImagesGroup[totalCount] = (productImagesGroup[totalCount] || 0) + 1;

    if (totalCount > 5) {
      unusualProducts.push({ id: p.id, name: p.name, count: totalCount });
    }
  }

  totalRemainingProducts = remainingProductIds.size;
  const uniqueUnsplashUrls = Array.from(uniqueUnsplashUrlsSet);

  console.log("\n=== CONCURRENCY HEAD AUDIT ===");
  console.log(`Unique Unsplash URLs to audit: ${uniqueUnsplashUrls.length}`);

  let successCount = 0;
  let errorCount = 0;
  let totalEstimatedBytes = 0;

  // Batch execute HEAD requests with a limit of 40 at a time to prevent rate limits
  const CONCURRENCY_LIMIT = 40;
  
  async function auditUrl(url: string) {
    try {
      const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        successCount++;
        const len = res.headers.get("content-length");
        if (len) {
          totalEstimatedBytes += parseInt(len, 10);
        } else {
          // If content-length header is missing, estimate with average image size (~115KB)
          totalEstimatedBytes += 115000;
        }
      } else {
        errorCount++;
      }
    } catch (err) {
      errorCount++;
    }
  }

  // Execute queue
  const queue = [...uniqueUnsplashUrls];
  while (queue.length > 0) {
    const batch = queue.splice(0, CONCURRENCY_LIMIT);
    await Promise.all(batch.map((url) => auditUrl(url)));
  }

  console.log("\n=== AUDIT REPORT ===");
  console.log(`- Remaining products containing Unsplash URLs: ${totalRemainingProducts}`);
  console.log(`- Total Unsplash URLs (including variant inheritance): ${allUnsplashUrls.length}`);
  console.log(`- Unique Unsplash URLs: ${uniqueUnsplashUrls.length}`);
  
  console.log("\n- Products grouped by image count:");
  Object.keys(productImagesGroup).forEach((count) => {
    console.log(`   * ${count} images: ${productImagesGroup[parseInt(count)]} products`);
  });

  console.log("\n- Variants grouped by image count:");
  Object.keys(variantImagesGroup).forEach((count) => {
    console.log(`   * ${count} images: ${variantImagesGroup[parseInt(count)]} variants`);
  });

  console.log(`\n- Count of URLs returning 200 (Success): ${successCount}`);
  console.log(`- Count of URLs returning 404/Errors: ${errorCount}`);
  console.log(`- Total estimated image bytes (valid only): ${totalEstimatedBytes} bytes (${(totalEstimatedBytes / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`- Estimated Supabase Storage size if all valid images are migrated: ${(totalEstimatedBytes / (1024 * 1024)).toFixed(2)} MB`);

  console.log("\n- Products/Variants with unusually large image counts (> 5):");
  if (unusualProducts.length === 0 && unusualVariants.length === 0) {
    console.log("   None (All products/variants have 5 or fewer images)");
  } else {
    unusualProducts.forEach((p) => console.log(`   * Product [${p.id}] "${p.name}" has ${p.count} images`));
    unusualVariants.forEach((v) => console.log(`   * Variant [${v.id}] SKU: ${v.sku} has ${v.count} images`));
  }
}

runAudit();
