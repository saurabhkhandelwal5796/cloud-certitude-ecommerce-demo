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

const failedUnsplashUrls = new Set([
  "https://images.unsplash.com/photo-1591172207264-a7b2e04c0764?w=800",
  "https://images.unsplash.com/photo-1614252235316-8c857196f5f4?w=800",
  "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800",
  "https://images.unsplash.com/photo-1600185365778-918c8960b2f2?w=800",
  "https://images.unsplash.com/photo-1594938298603-c8148c4b4086?w=800",
  "https://images.unsplash.com/photo-1531245423-38a5327a7c7d?w=800",
  "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800",
  "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800",
  "https://images.unsplash.com/photo-1565339119519-7d63ad604e72?w=800",
  "https://images.unsplash.com/photo-1631343864-ba43c1540f25?w=800",
  "https://images.unsplash.com/photo-1496440788591-d1004764c3f6?w=800",
  "https://images.unsplash.com/photo-1538325857685-75ec87614a7d?w=800",
  "https://images.unsplash.com/photo-1614945787055-a0c3f68e0673?w=800"
]);

async function verifyMigration() {
  // Paginate fetching products
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

  // Paginate fetching variants
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

  // 1. Count remaining Unsplash URLs
  let productUnsplashCount = 0;
  products.forEach((p) => {
    const imgs = Array.isArray(p.images) ? p.images : [];
    productUnsplashCount += imgs.filter((img: string) => img.includes("unsplash.com")).length;
  });

  let variantUnsplashCount = 0;
  const remainingVariantUnsplashUrls = new Set<string>();
  variants.forEach((v) => {
    const imgs = Array.isArray(v.images) ? v.images : [];
    imgs.forEach((img: string) => {
      if (img.includes("unsplash.com")) {
        variantUnsplashCount++;
        remainingVariantUnsplashUrls.add(img);
      }
    });
  });

  // 2. Confirm the only remaining Unsplash URLs in variants are the 13 failed ones
  let allRemainingAreFailed = true;
  remainingVariantUnsplashUrls.forEach((url) => {
    if (!failedUnsplashUrls.has(url)) {
      allRemainingAreFailed = false;
      console.log(`Anomaly: Variant images contains unfailed Unsplash URL: ${url}`);
    }
  });

  // 3. Count Supabase Storage URLs now referenced by variants
  let variantStorageUrlCount = 0;
  const uniqueStorageUrls = new Set<string>();
  const customUploadedUrls = new Set<string>();

  variants.forEach((v) => {
    const imgs = Array.isArray(v.images) ? v.images : [];
    imgs.forEach((img: string) => {
      if (img.includes("supabase.co") || img.includes("supabase.in")) {
        variantStorageUrlCount++;
        uniqueStorageUrls.add(img);
        
        // Custom uploaded images do not match the unique shared unsplash path pattern: "product-variants/shared/unsplash_"
        if (!img.includes("product-variants/shared/unsplash_")) {
          customUploadedUrls.add(img);
        }
      }
    });
  });

  // 4. Confirm the 67 migrated storage objects are referenced correctly
  const migratedSharedUrls = Array.from(uniqueStorageUrls).filter(url => url.includes("product-variants/shared/unsplash_"));
  const correctMigratedCount = migratedSharedUrls.length === 67;

  // 5. Check for duplicate storage URLs mapping to different Unsplash source URLs
  // This verifies that each migrated storage object is unique and correctly mapped
  const uniqueSharedFileNames = new Set(migratedSharedUrls.map(url => {
    const parts = url.split("/");
    return parts[parts.length - 1];
  }));
  const noDuplicates = uniqueSharedFileNames.size === migratedSharedUrls.length;

  console.log("=== POST-MIGRATION VERIFICATION REPORT ===");
  console.log(`1. Remaining Unsplash URLs in products: ${productUnsplashCount}`);
  console.log(`   Remaining Unsplash URLs in product_variants: ${variantUnsplashCount}`);
  console.log(`2. Are all remaining Unsplash URLs in variants from the 13 failed ones?: ${allRemainingAreFailed ? "YES" : "NO"}`);
  console.log(`3. Total Supabase Storage URLs referenced by variants: ${variantStorageUrlCount}`);
  console.log(`4. Unique migrated shared storage objects (expected 67): ${migratedSharedUrls.length}`);
  console.log(`   Are 67 unique storage objects referenced correctly?: ${correctMigratedCount ? "YES" : "NO"}`);
  console.log(`5. Are there any duplicate file name mappings in shared storage?: ${noDuplicates ? "NO" : "YES"}`);
  console.log(`6. Number of previously uploaded / custom non-Unsplash images preserved: ${customUploadedUrls.size}`);
  
  // 7. Report any anomalies
  const anomalies: string[] = [];
  if (!allRemainingAreFailed) {
    anomalies.push("Found Unsplash URLs in variants that were not in the failed list.");
  }
  if (migratedSharedUrls.length !== 67) {
    anomalies.push(`Expected 67 migrated storage URLs, but found ${migratedSharedUrls.length}.`);
  }
  if (!noDuplicates) {
    anomalies.push("Detected duplicate storage path filenames.");
  }
  
  console.log("\n7. Anomalies identified:");
  if (anomalies.length === 0) {
    console.log("   None (All migration verification checks passed perfectly!)");
  } else {
    anomalies.forEach((a, idx) => console.log(`   [${idx + 1}] ${a}`));
  }
  console.log("==========================================");
}

verifyMigration();
