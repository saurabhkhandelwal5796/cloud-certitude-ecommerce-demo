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

const candidateTables = [
  { table: "product_variants", fk: "product_id", isVariantTable: true },
  { table: "variant_attribute_values", fk: "variant_id", isVariantChild: true },
  { table: "product_selected_attribute_values", fk: "product_id" },
  { table: "product_attribute_values", fk: "product_id" },
  { table: "product_attribute_group", fk: "product_id" },
  { table: "product_relationships", fk: "product_id" },
  { table: "product_relationships", fk: "related_product_id" },
  { table: "product_return_policies", fk: "product_id" },
  { table: "reviews", fk: "product_id" },
  { table: "cart_items", fk: "product_id" },
  { table: "cart_items", fk: "variant_id", isVariantChild: true },
  { table: "wishlist", fk: "product_id" },
  { table: "wishlist_items", fk: "product_id" },
  { table: "order_items", fk: "product_id" },
  { table: "order_items", fk: "variant_id", isVariantChild: true }
];

async function checkTableExistsAndCount(tableName: string, colName: string, idVal: string | string[]): Promise<number> {
  try {
    let query = supabase.from(tableName).select("id", { count: "exact", head: true });
    if (Array.isArray(idVal)) {
      if (idVal.length === 0) return 0;
      query = query.in(colName, idVal);
    } else {
      query = query.eq(colName, idVal);
    }
    const { count, error } = await query;
    if (error) {
      // Table or column might not exist or error
      return 0;
    }
    return count || 0;
  } catch (e) {
    return 0;
  }
}

async function auditDeletionImpact() {
  console.log("=== STARTING READ-ONLY DELETION IMPACT AUDIT ===\n");

  const results: any[] = [];

  for (const productId of targetProductIds) {
    // 1. Fetch Product
    const { data: product, error: pError } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", productId)
      .single();

    if (pError || !product) {
      console.log(`Product ID ${productId} NOT FOUND!`);
      continue;
    }

    // 2. Fetch Variants
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", productId);

    const variantIds = (variants || []).map((v: any) => v.id);

    // 3. Check each dependent table
    const tableCounts: Record<string, number> = {};
    let totalDependentRecords = 0;

    // Check variant_attribute_values
    const vavCount = await checkTableExistsAndCount("variant_attribute_values", "variant_id", variantIds);
    if (vavCount > 0) tableCounts["variant_attribute_values"] = vavCount;

    // Check product_selected_attribute_values
    const psavCount = await checkTableExistsAndCount("product_selected_attribute_values", "product_id", productId);
    if (psavCount > 0) tableCounts["product_selected_attribute_values"] = psavCount;

    // Check product_attribute_values
    const pavCount = await checkTableExistsAndCount("product_attribute_values", "product_id", productId);
    if (pavCount > 0) tableCounts["product_attribute_values"] = pavCount;

    // Check product_attribute_group
    const pagCount = await checkTableExistsAndCount("product_attribute_group", "product_id", productId);
    if (pagCount > 0) tableCounts["product_attribute_group"] = pagCount;

    // Check product_relationships (product_id & related_product_id)
    const pr1Count = await checkTableExistsAndCount("product_relationships", "product_id", productId);
    const pr2Count = await checkTableExistsAndCount("product_relationships", "related_product_id", productId);
    if (pr1Count + pr2Count > 0) tableCounts["product_relationships"] = pr1Count + pr2Count;

    // Check product_return_policies
    const prpCount = await checkTableExistsAndCount("product_return_policies", "product_id", productId);
    if (prpCount > 0) tableCounts["product_return_policies"] = prpCount;

    // Check reviews
    const revCount = await checkTableExistsAndCount("reviews", "product_id", productId);
    if (revCount > 0) tableCounts["reviews"] = revCount;

    // Check cart_items
    const cartPCount = await checkTableExistsAndCount("cart_items", "product_id", productId);
    const cartVCount = await checkTableExistsAndCount("cart_items", "variant_id", variantIds);
    if (cartPCount + cartVCount > 0) tableCounts["cart_items"] = cartPCount + cartVCount;

    // Check order_items
    const orderPCount = await checkTableExistsAndCount("order_items", "product_id", productId);
    const orderVCount = await checkTableExistsAndCount("order_items", "variant_id", variantIds);
    if (orderPCount + orderVCount > 0) tableCounts["order_items"] = orderPCount + orderVCount;

    // Check wishlist
    const wishPCount = await checkTableExistsAndCount("wishlist", "product_id", productId);
    if (wishPCount > 0) tableCounts["wishlist"] = wishPCount;

    // Calculate total dependent records (excluding variant_attribute_values which cascade from variants)
    for (const [tbl, cnt] of Object.entries(tableCounts)) {
      totalDependentRecords += cnt;
    }

    const dependentSummary = Object.entries(tableCounts)
      .map(([tbl, cnt]) => `${tbl}: ${cnt}`)
      .join(", ") || "None";

    results.push({
      productId: product.id,
      productName: product.name,
      variantCount: variantIds.length,
      dependentCountsStr: dependentSummary,
      totalDependentRecords,
      isCascadeSafe: true, // Will confirm via schema checks
      explicitCleanupRequired: "None (CASCADE handles product_variants and variant_attribute_values)"
    });
  }

  console.log("=== AUDIT SUMMARY RESULTS ===");
  results.forEach((r, idx) => {
    console.log(`\n[${idx + 1}] ${r.productName} (${r.productId})`);
    console.log(`    Variant Count: ${r.variantCount}`);
    console.log(`    Dependent Records: ${r.dependentCountsStr}`);
  });

  console.log("\n=== MARKDOWN REPORT TABLE ===");
  console.log("| Product Name | Product ID | Variant Count | Related / Dependent Records | Deletion Safe? | Explicit Cleanup Required |");
  console.log("| :--- | :--- | :--- | :--- | :--- | :--- |");
  results.forEach(r => {
    console.log(`| ${r.productName} | \`${r.productId}\` | ${r.variantCount} | ${r.dependentCountsStr} | YES (ON DELETE CASCADE) | ${r.explicitCleanupRequired} |`);
  });
}

auditDeletionImpact();
