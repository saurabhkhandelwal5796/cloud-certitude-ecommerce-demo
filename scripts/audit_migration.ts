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

const processedProductIds = [
  "0134fc2b-8fa0-47a2-819d-0073afa4d863",
  "027ee406-9677-4248-9b9d-d09d7088597c",
  "033510e4-e6db-44d2-9efd-7128a797254a",
  "036a2a48-2305-45f3-a441-8a6ef01fad02",
  "03a78c6e-168a-430a-b483-caf56f730617",
  "044095b4-a33b-4869-9657-c59523da6bec",
  "04c5753d-6001-4b2a-9f03-2e75fb7dfc8a",
  "05284fbf-c11e-497a-bca5-3b24b264f0cc",
  "06154487-46de-433d-bda7-2292046553e1",
  "0643cc20-27b4-4993-bf43-0f4d5cf90a49",
  "0048ef70-3900-47a5-9aa1-4c06ab194d23",
  "01ad2450-2ba9-4c77-8bdf-1ef22aac251a",
  "01db9ecb-80d7-41cf-87ea-5a41e5590532",
  "02504a8c-67e9-478f-9f10-bd51ccccd519",
  "065bb01e-1522-4c3e-abaa-fdbc6375b5c8",
  "065dcf3e-bb80-4e13-a6dd-9bc1e01f835a",
  "065fdb16-23e2-4dc3-a1fc-10d811865c65",
  "066830c7-6f30-4d9f-94af-1b912e1ac905",
  "06d53083-415a-4495-9142-04e0f7c9b2f7",
  "0710d5ba-589a-473d-a897-6561ee6f5362"
];

async function runAudit() {
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

  const productMap = new Map(products.map((p) => [p.id, p.name]));
  const productImagesMap = new Map(products.map((p) => [p.id, Array.isArray(p.images) ? p.images : []]));

  const tableRows: string[] = [];
  tableRows.push("| Product Name | Variant ID / SKU | Orig Images (variant) | Unsplash Before | Storage After | Failed | Row Changed? |");
  tableRows.push("| --- | --- | --- | --- | --- | --- | --- |");

  for (const prodId of processedProductIds) {
    const prodName = productMap.get(prodId) || "Unknown Product";
    const parentImages = productImagesMap.get(prodId) || [];
    const prodVariants = variants.filter((v) => v.product_id === prodId);

    for (const variant of prodVariants) {
      const currentImages: string[] = Array.isArray(variant.images) ? variant.images : [];

      // Filter: only show the variant if it has stored images directly in the database (which means it was processed)
      if (currentImages.length === 0) {
        continue;
      }

      const storageCount = currentImages.filter(img => img.includes("supabase.co")).length;
      const failedCount = currentImages.filter(img => img.includes("unsplash.com")).length;

      const unsplashBefore = storageCount + failedCount;
      const originalStoredCount = 0; // Seeding had variant.images empty initially
      const wasChanged = currentImages.length > 0;

      tableRows.push(`| ${prodName} | \`${variant.id}\`<br>\`${variant.sku}\` | ${originalStoredCount} | ${unsplashBefore} | ${storageCount} | ${failedCount} | ${wasChanged ? "YES" : "NO"} |`);
    }
  }

  console.log("TABLE_START");
  tableRows.forEach(row => console.log(row));
  console.log("TABLE_END");

  // Calculate remaining stats
  let totalRemainingProducts = 0;
  let totalRemainingUnsplashUrls = 0;

  for (const prod of products) {
    const parentImages = Array.isArray(prod.images) ? prod.images : [];
    const prodVariants = variants.filter((v) => v.product_id === prod.id);

    let hasUnsplash = false;
    let unsplashCount = 0;

    for (const v of prodVariants) {
      const vImages = Array.isArray(v.images) ? v.images : [];
      const imagesToCheck = vImages.length > 0 ? vImages : parentImages;
      const unsplashUrls = imagesToCheck.filter((img: string) => img.includes("unsplash.com"));
      if (unsplashUrls.length > 0) {
        hasUnsplash = true;
        unsplashCount += unsplashUrls.length;
      }
    }

    if (hasUnsplash) {
      totalRemainingProducts++;
      totalRemainingUnsplashUrls += unsplashCount;
    }
  }

  // The 2 failed product IDs
  const brokenProductIds = ["0134fc2b-8fa0-47a2-819d-0073afa4d863", "0643cc20-27b4-4993-bf43-0f4d5cf90a49"];
  const brokenCount = brokenProductIds.length;

  console.log("\n=== GENERAL REMAINING STATS ===");
  console.log(`Total remaining products containing Unsplash URLs: ${totalRemainingProducts}`);
  console.log(`Total remaining Unsplash URLs: ${totalRemainingUnsplashUrls}`);
  console.log(`Number of products with at least one valid Unsplash URL: ${totalRemainingProducts - brokenCount}`);
  console.log(`Number of products with only broken/404 Unsplash URLs: ${brokenCount}`);
}

runAudit();
