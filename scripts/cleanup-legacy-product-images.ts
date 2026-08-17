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

const args = process.argv.slice(2);
const isExecute = args.includes("--execute");

async function cleanupProductImages() {
  console.log("=========================================");
  console.log("Cleanup Legacy Product-Level Images Script");
  console.log(`Mode: ${isExecute ? "EXECUTE (Live DB Update)" : "DRY-RUN (Verification Only)"}`);
  console.log("=========================================\n");

  // Fetch all products (paginated)
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

  let totalProducts = products.length;
  let productsAffected = 0;
  let unsplashUrlsRemoved = 0;
  let nonUnsplashPreserved = 0;
  let dbUpdatesSucceeded = 0;

  for (const product of products) {
    const originalImages: string[] = Array.isArray(product.images) ? product.images : [];
    
    // Filter out Unsplash URLs only
    const filteredImages = originalImages.filter((img: string) => !img.includes("unsplash.com"));
    const unsplashCount = originalImages.length - filteredImages.length;
    const nonUnsplashCount = filteredImages.length;

    if (unsplashCount > 0) {
      productsAffected++;
      unsplashUrlsRemoved += unsplashCount;
      nonUnsplashPreserved += nonUnsplashCount;

      if (isExecute) {
        const { error: updateError } = await supabase
          .from("products")
          .update({ images: filteredImages })
          .eq("id", product.id);

        if (updateError) {
          console.error(`Error updating product ${product.id}:`, updateError.message);
        } else {
          dbUpdatesSucceeded++;
        }
      } else {
        console.log(`- [DRY RUN] Would update product "${product.name}" (${product.id}):`);
        console.log(`  Original images count: ${originalImages.length}`);
        console.log(`  Filtered images count: ${filteredImages.length} (Preserved non-Unsplash: ${nonUnsplashCount})`);
      }
    }
  }

  console.log("\n=========================================");
  console.log("CLEANUP REPORT SUMMARY:");
  console.log("=========================================");
  console.log(`Total Products Evaluated:    ${totalProducts}`);
  console.log(`Products Affected:           ${productsAffected}`);
  console.log(`Unsplash URLs to be Removed: ${unsplashUrlsRemoved}`);
  console.log(`Non-Unsplash URLs Preserved: ${nonUnsplashPreserved}`);
  if (isExecute) {
    console.log(`Database Updates Succeeded:  ${dbUpdatesSucceeded}`);
  }
  console.log("=========================================");
}

cleanupProductImages();
