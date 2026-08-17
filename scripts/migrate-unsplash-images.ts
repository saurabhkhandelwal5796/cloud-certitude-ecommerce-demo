import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

// Load environment variables from .env.local manually
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
  console.error("Failed to read .env.local file", err);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse arguments
const args = process.argv.slice(2);
const isExecute = args.includes("--execute");
const isDryRun = !isExecute; // Default to dry run

// Parse --limit=N
let limit: number | null = null;
const limitArg = args.find((a) => a.startsWith("--limit="));
if (limitArg) {
  const parsed = parseInt(limitArg.split("=")[1], 10);
  if (!isNaN(parsed)) {
    limit = parsed;
  }
}

// Target bucket
const BUCKET_NAME = "profile-images";

// Ext / Content-Type mapping
const CONTENT_TYPE_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

interface MigrationStats {
  productsSelected: number;
  variantsProcessed: number;
  imagesFound: number;             // Total unsplash url references found in variants
  uniqueUrlsDiscovered: number;     // Unique unsplash urls discovered
  successfulDownloads: number;      // Successfully downloaded unique URLs
  failedUrlsCount: number;          // Failed unique URLs
  uniqueImagesUploaded: number;     // Unique images uploaded to storage
  databaseRowsUpdated: number;      // Database rows modified
  imagesSkipped: number;            // Unique images already migrated/skipped
  totalBytesUploaded: number;
  duplicateDownloadsAvoided: number;
  failureDetails: string[];
}

const stats: MigrationStats = {
  productsSelected: 0,
  variantsProcessed: 0,
  imagesFound: 0,
  uniqueUrlsDiscovered: 0,
  successfulDownloads: 0,
  failedUrlsCount: 0,
  uniqueImagesUploaded: 0,
  databaseRowsUpdated: 0,
  imagesSkipped: 0,
  totalBytesUploaded: 0,
  duplicateDownloadsAvoided: 0,
  failureDetails: []
};

function getExtensionFromContentType(contentType: string | null): string {
  if (!contentType) return "jpg";
  const cleanType = contentType.split(";")[0].trim().toLowerCase();
  return CONTENT_TYPE_MAP[cleanType] || "jpg";
}

async function runMigration() {
  console.log("====================================================");
  console.log(`Unsplash to Supabase Storage Migration (Optimized Full Migration)`);
  console.log(`Mode: ${isDryRun ? "DRY RUN (Safe / Read-Only)" : "EXECUTE (Live Migration)"}`);
  console.log(`Limit: ${limit !== null ? limit : "None (All eligible products)"}`);
  console.log("====================================================");

  // 1. Fetch products and variants (paginated)
  console.log("Fetching catalog products and variants...");
  
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

  console.log(`Found ${products.length} products and ${variants.length} variants in database.`);

  const productMap = new Map(products.map((p) => [p.id, p.name]));
  const productImagesMap = new Map(products.map((p) => [p.id, Array.isArray(p.images) ? p.images : []]));

  // 2. Identify products/variants containing legacy Unsplash URLs
  interface LegacyItem {
    variant: any;
    imagesToProcess: string[];
  }
  const legacyProducts = new Map<string, LegacyItem[]>();

  for (const variant of variants) {
    const originalImages: string[] = Array.isArray(variant.images) ? variant.images : [];
    const prodId = variant.product_id;
    const parentImages = productImagesMap.get(prodId) || [];
    const imagesToProcess = originalImages.length > 0 ? originalImages : parentImages;

    const hasUnsplash = imagesToProcess.some((img: string) => img.includes("unsplash.com"));

    if (hasUnsplash) {
      if (!legacyProducts.has(prodId)) {
        legacyProducts.set(prodId, []);
      }
      legacyProducts.get(prodId)!.push({
        variant,
        imagesToProcess
      });
    }
  }

  console.log(`Identified ${legacyProducts.size} products with legacy Unsplash variant images.`);

  // 3. Limit products if configurable
  const selectedProductIds = limit !== null
    ? Array.from(legacyProducts.keys()).slice(0, limit)
    : Array.from(legacyProducts.keys());
  stats.productsSelected = selectedProductIds.length;

  console.log(`Selecting ${stats.productsSelected} products for migration.`);

  // 4. Collect all unique Unsplash URLs from selected products/variants
  const uniqueUnsplashUrlsSet = new Set<string>();
  const processedVariants: LegacyItem[] = [];

  for (const prodId of selectedProductIds) {
    const prodVariants = legacyProducts.get(prodId) || [];
    for (const item of prodVariants) {
      processedVariants.push(item);
      item.imagesToProcess.forEach((img: string) => {
        if (img.includes("unsplash.com")) {
          stats.imagesFound++;
          uniqueUnsplashUrlsSet.add(img);
        }
      });
    }
  }

  const uniqueUnsplashUrls = Array.from(uniqueUnsplashUrlsSet);
  stats.uniqueUrlsDiscovered = uniqueUnsplashUrls.length;
  console.log(`Unique Unsplash URLs discovered: ${stats.uniqueUrlsDiscovered}`);

  // Fetch list of existing files in the shared storage path to optimize idempotency checks
  console.log("Checking existing files in shared storage...");
  const { data: existingSharedFiles } = await supabase.storage
    .from(BUCKET_NAME)
    .list("product-variants/shared");
  const existingSharedNames = new Set(existingSharedFiles?.map((f) => f.name) || []);

  // 5. Migrate each unique Unsplash URL exactly once
  const globalMigratedUrls = new Map<string, string>();
  const failedUrlsList: string[] = [];

  console.log("Migrating unique Unsplash URLs...");
  for (const imgUrl of uniqueUnsplashUrls) {
    // Generate deterministic, collision-safe file path/name using MD5 hash of original URL
    const hash = createHash("md5").update(imgUrl).digest("hex");
    
    let ext = "jpg";
    let contentType = "image/jpeg";
    let downloadBuffer: ArrayBuffer | null = null;

    const fileName = `unsplash_${hash}.${ext}`;
    const filePath = `product-variants/shared/${fileName}`;

    // Construct expected Storage URL format
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    const expectedStorageUrl = urlData.publicUrl;

    // Check if it already exists in storage bucket
    if (existingSharedNames.has(fileName)) {
      stats.imagesSkipped++;
      globalMigratedUrls.set(imgUrl, expectedStorageUrl);
      console.log(`  - URL [${imgUrl}] already migrated to shared storage. Skipping.`);
      continue;
    }

    try {
      if (isDryRun) {
        // In dry run, check headers only
        const headRes = await fetch(imgUrl, { method: "HEAD" });
        if (!headRes.ok) {
          throw new Error(`Unsplash fetch failed with status ${headRes.status}`);
        }
        contentType = headRes.headers.get("content-type") || "image/jpeg";
        ext = getExtensionFromContentType(contentType);
        
        globalMigratedUrls.set(imgUrl, expectedStorageUrl);
        console.log(`  - [DRY RUN] Would download/upload: ${imgUrl} -> ${expectedStorageUrl}`);
        continue;
      } else {
        console.log(`  - Downloading Unsplash URL: ${imgUrl}`);
        const downloadRes = await fetch(imgUrl);
        if (!downloadRes.ok) {
          throw new Error(`Unsplash fetch failed with status ${downloadRes.status}`);
        }
        contentType = downloadRes.headers.get("content-type") || "image/jpeg";
        ext = getExtensionFromContentType(contentType);
        downloadBuffer = await downloadRes.arrayBuffer();
        stats.successfulDownloads++;
      }
    } catch (err: any) {
      stats.failedUrlsCount++;
      failedUrlsList.push(imgUrl);
      const errorMsg = `Failed to process image ${imgUrl}: ${err.message || err}`;
      console.error(`  - ${errorMsg}`);
      stats.failureDetails.push(errorMsg);
      continue;
    }

    // EXECUTE Mode: Upload to Supabase Storage
    if (downloadBuffer) {
      try {
        console.log(`    Uploading shared file to bucket "${BUCKET_NAME}" path: ${filePath}...`);
        
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, Buffer.from(downloadBuffer), {
            contentType,
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        stats.uniqueImagesUploaded++;
        stats.totalBytesUploaded += downloadBuffer.byteLength;
        console.log(`    Upload success! Expected URL: ${expectedStorageUrl}`);

        globalMigratedUrls.set(imgUrl, expectedStorageUrl);
      } catch (uploadErr: any) {
        stats.failedUrlsCount++;
        failedUrlsList.push(imgUrl);
        const errorMsg = `Upload failed for ${imgUrl} to path ${filePath}: ${uploadErr.message || uploadErr}`;
        console.error(`    - ${errorMsg}`);
        stats.failureDetails.push(errorMsg);
        continue;
      }
    }
  }

  // 6. Update database rows for all processed products/variants
  console.log("\nUpdating variant database rows...");
  for (const item of processedVariants) {
    const variant = item.variant;
    stats.variantsProcessed++;
    const originalImages: string[] = Array.isArray(variant.images) ? variant.images : [];

    const finalImages: string[] = [];
    for (const imgUrl of item.imagesToProcess) {
      if (imgUrl.includes("unsplash.com")) {
        const migrated = globalMigratedUrls.get(imgUrl);
        if (migrated) {
          finalImages.push(migrated);
        } else {
          // Keep original Unsplash URL if download/upload failed
          finalImages.push(imgUrl);
        }
      } else {
        // Keep non-Unsplash custom image URLs untouched
        finalImages.push(imgUrl);
      }
    }

    const finalUniqueImages = Array.from(new Set(finalImages));
    
    // Check if the final array differs from original database images
    const originalUnique = Array.from(new Set(originalImages));
    const isDifferent = originalUnique.length !== finalUniqueImages.length || 
      originalUnique.some((val, index) => val !== finalUniqueImages[index]);

    if (isDifferent) {
      if (isDryRun) {
        console.log(`  - [DRY RUN] Would update variant ${variant.id} images to: ${JSON.stringify(finalUniqueImages)}`);
      } else {
        try {
          const { error: dbError } = await supabase
            .from("product_variants")
            .update({ images: finalUniqueImages })
            .eq("id", variant.id);

          if (dbError) {
            throw dbError;
          }
          stats.databaseRowsUpdated++;
        } catch (dbErr: any) {
          const errorMsg = `Database update failed for variant ${variant.id}: ${dbErr.message || dbErr}`;
          console.error(`    - ${errorMsg}`);
          stats.failureDetails.push(errorMsg);
        }
      }
    }
  }

  // Calculate duplicate downloads avoided
  stats.duplicateDownloadsAvoided = stats.imagesFound - (stats.successfulDownloads + stats.failedUrlsCount + stats.imagesSkipped);
  if (stats.duplicateDownloadsAvoided < 0) {
    stats.duplicateDownloadsAvoided = 0;
  }

  console.log("\n====================================================");
  console.log("MIGRATION SUMMARY:");
  console.log("====================================================");
  console.log(`Products Selected:           ${stats.productsSelected}`);
  console.log(`Variants Processed:          ${stats.variantsProcessed}`);
  console.log(`Unique URLs Discovered:      ${stats.uniqueUrlsDiscovered}`);
  console.log(`Successful Downloads:        ${stats.successfulDownloads}`);
  console.log(`Failed URLs:                 ${stats.failedUrlsCount}`);
  console.log(`Unique Images Uploaded:      ${stats.uniqueImagesUploaded}`);
  console.log(`Products/Variants Updated:   ${stats.databaseRowsUpdated}`);
  console.log(`Images Skipped:              ${stats.imagesSkipped}`);
  console.log(`Total Bytes Uploaded:        ${stats.totalBytesUploaded} bytes`);
  console.log(`Duplicate Downloads Avoided: ${stats.duplicateDownloadsAvoided}`);
  
  if (failedUrlsList.length > 0) {
    console.log("\nFailed Unsplash URLs:");
    failedUrlsList.forEach((url, idx) => console.log(` [${idx + 1}] ${url}`));
  }
  console.log("====================================================");
}

runMigration();
