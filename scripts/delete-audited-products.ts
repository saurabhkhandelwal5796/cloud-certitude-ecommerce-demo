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

const targetProductIds = [
  "0134fc2b-8fa0-47a2-819d-0073afa4d863",
  "0643cc20-27b4-4993-bf43-0f4d5cf90a49",
  "073f3eb6-edc2-4d5b-b7fa-1bfb3843235b",
  "095f99f2-7cf5-4338-a655-aa2a24e7ea1d",
  "0cdbf185-e0ea-4a04-8f47-198c13c41b4c",
  "0d220bee-45e9-4a8f-b529-bb0cc818758c",
  "0e2c31a2-db14-461e-be4d-9f256c0f145f",
  "1590467e-6972-4e0a-b740-d0e779d46abf",
  "174d1aa5-a1fb-4d32-a836-86207469373b",
  "1bc80d09-d300-42b1-98f9-942bf36c1ac4",
  "27e7097b-ac0a-4937-9a2b-b50dd6621777",
  "60b4e194-96d1-4d4a-930c-13b38ad43283",
  "733fe1fa-e334-4f6c-8006-1cf54529ffc1"
];

async function executeDeletionAndVerification() {
  console.log("=== STEP 1: RE-VERIFYING TARGET PRODUCTS BEFORE DELETION ===");
  
  // Total count before deletion
  const { count: initialProductCount } = await supabase.from("products").select("id", { count: "exact", head: true });
  const { count: initialVariantCount } = await supabase.from("product_variants").select("id", { count: "exact", head: true });
  const { count: initialVavCount } = await supabase.from("variant_attribute_values").select("id", { count: "exact", head: true });

  console.log(`Initial Product Count:               ${initialProductCount}`);
  console.log(`Initial Variant Count:               ${initialVariantCount}`);
  console.log(`Initial Variant Attribute Val Count: ${initialVavCount}`);

  // Fetch target products & variant IDs before deletion
  const { data: targetProducts, error: fetchErr } = await supabase
    .from("products")
    .select("id, name")
    .in("id", targetProductIds);

  if (fetchErr || !targetProducts || targetProducts.length !== 13) {
    console.error("Error: Could not verify all 13 products exist!", fetchErr);
    process.exit(1);
  }

  console.log(`Verified ${targetProducts.length} products match target list:`);
  targetProducts.forEach(p => console.log(` - ${p.name} (${p.id})`));

  // Get target variants before deletion
  const { data: targetVariants } = await supabase
    .from("product_variants")
    .select("id")
    .in("product_id", targetProductIds);

  const targetVariantIds = (targetVariants || []).map(v => v.id);
  
  // Get target variant_attribute_values before deletion
  let targetVavCount = 0;
  if (targetVariantIds.length > 0) {
    const { count: vavCnt } = await supabase
      .from("variant_attribute_values")
      .select("id", { count: "exact", head: true })
      .in("variant_id", targetVariantIds);
    targetVavCount = vavCnt || 0;
  }

  console.log(`Pre-deletion Target Variants:         ${targetVariantIds.length}`);
  console.log(`Pre-deletion Target Attribute Values: ${targetVavCount}`);

  console.log("\n=== STEP 2: EXECUTING PRODUCT DELETION ===");
  const { error: deleteErr } = await supabase
    .from("products")
    .delete()
    .in("id", targetProductIds);

  if (deleteErr) {
    console.error("Deletion failed:", deleteErr.message);
    process.exit(1);
  }
  console.log("Deletion query executed successfully.");

  console.log("\n=== STEP 3: POST-DELETION VERIFICATION ===");
  
  // Re-fetch deleted products
  const { count: deletedProductsCheck } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .in("id", targetProductIds);

  // Re-fetch deleted variants
  const { count: deletedVariantsCheck } = await supabase
    .from("product_variants")
    .select("id", { count: "exact", head: true })
    .in("id", targetProductIds);

  // Re-fetch deleted VAVs
  let deletedVavCheck = 0;
  if (targetVariantIds.length > 0) {
    const { count: vavCheck } = await supabase
      .from("variant_attribute_values")
      .select("id", { count: "exact", head: true })
      .in("variant_id", targetVariantIds);
    deletedVavCheck = vavCheck || 0;
  }

  // Total count after deletion
  const { count: finalProductCount } = await supabase.from("products").select("id", { count: "exact", head: true });
  const { count: finalVariantCount } = await supabase.from("product_variants").select("id", { count: "exact", head: true });
  const { count: finalVavCount } = await supabase.from("variant_attribute_values").select("id", { count: "exact", head: true });

  // Check orphan variants (variants whose product_id is not in products table)
  // Since FK CASCADE is enforced, this will be 0
  const { data: allVariants } = await supabase.from("product_variants").select("product_id");
  const { data: allProducts } = await supabase.from("products").select("id");
  const productIdSet = new Set((allProducts || []).map(p => p.id));
  const orphanVariants = (allVariants || []).filter(v => !productIdSet.has(v.product_id));

  console.log("=========================================");
  console.log("POST-DELETION VERIFICATION REPORT:");
  console.log("=========================================");
  console.log(`Products Deleted:                    ${13 - (deletedProductsCheck || 0)} (Expected: 13, Remaining target: ${deletedProductsCheck})`);
  console.log(`Variants Deleted (CASCADE):          ${targetVariantIds.length - (deletedVariantsCheck || 0)} (Expected: 104)`);
  console.log(`Attribute Values Deleted (CASCADE):   ${targetVavCount - (deletedVavCheck || 0)} (Expected: 208)`);
  console.log(`Orphan Variants Remaining:           ${orphanVariants.length}`);
  console.log(`Initial Product Count:               ${initialProductCount}`);
  console.log(`Final Product Count:                 ${finalProductCount} (Expected: ${initialProductCount! - 13})`);
  console.log(`Initial Variant Count:               ${initialVariantCount}`);
  console.log(`Final Variant Count:                 ${finalVariantCount} (Expected: ${initialVariantCount! - 104})`);
  console.log(`Initial Attribute Values Count:      ${initialVavCount}`);
  console.log(`Final Attribute Values Count:        ${finalVavCount} (Expected: ${initialVavCount! - 208})`);
  console.log("=========================================");
}

executeDeletionAndVerification();
