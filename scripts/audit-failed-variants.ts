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

interface AuditRecord {
  productName: string;
  productId: string;
  category: string;
  nodePath: string;
  variantId: string;
  sku: string;
  variantName: string;
  attributesStr: string;
  brokenUrl: string;
  hasOtherImages: string;
}

async function getFullNodePath(nodeId: string): Promise<string> {
  if (!nodeId) return "N/A";
  
  const pathParts: string[] = [];
  let currentId: string | null = nodeId;
  
  while (currentId) {
    const result = await supabase
      .from("navigation_nodes")
      .select("id, name, parent_id")
      .eq("id", currentId)
      .single();
      
    if (result.error || !result.data) break;
    const nodeData = result.data as { id: string; name: string; parent_id: string | null };
    pathParts.unshift(nodeData.name);
    currentId = nodeData.parent_id;
  }
  
  return pathParts.join(" > ") || "N/A";
}

async function auditFailedVariants() {
  console.log("Fetching variants and products for audit...");

  // Fetch all variants (paginated)
  let variants: any[] = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("product_variants")
      .select("id, product_id, sku, variant_name, images")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    variants = variants.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  // Filter variants to find exactly one representative variant per unique failed Unsplash URL
  const targetVariants: any[] = [];
  const matchedFailedUrls = new Set<string>();

  for (const v of variants) {
    const imgs = Array.isArray(v.images) ? v.images : [];
    const firstFailedUrl = imgs.find((img: string) => failedUnsplashUrls.has(img));
    if (firstFailedUrl && !matchedFailedUrls.has(firstFailedUrl)) {
      matchedFailedUrls.add(firstFailedUrl);
      targetVariants.push(v);
      if (targetVariants.length === failedUnsplashUrls.size) {
        break;
      }
    }
  }

  console.log(`Selected ${targetVariants.length} representative variants containing known broken Unsplash URLs.`);

  const auditRecords: AuditRecord[] = [];

  for (const variant of targetVariants) {
    const { data: product, error: pError } = await supabase
      .from("products")
      .select("id, name, category, nav_node_id")
      .eq("id", variant.product_id)
      .single();

    if (pError || !product) {
      console.error(`Failed to fetch product for variant ${variant.id}`);
      continue;
    }

    // Node path
    const nodePath = await getFullNodePath(product.nav_node_id);

    // Fetch variant attributes manually to avoid loading UI components or dynamic import restrictions
    const { data: valAssignments, error: valError } = await supabase
      .from("variant_attribute_values")
      .select(`
        attribute_value_id,
        attribute_values(
          value,
          attribute_id,
          product_attributes(name)
        )
      `)
      .eq("variant_id", variant.id);

    let attributesStr = "N/A";
    if (!valError && valAssignments) {
      const attrs = valAssignments.map((a: any) => {
        const attrName = a.attribute_values?.product_attributes?.name || "Attribute";
        const attrVal = a.attribute_values?.value || "Value";
        return `${attrName}: ${attrVal}`;
      });
      attributesStr = attrs.join(", ") || "N/A";
    }

    // Broken URL
    const imgs = Array.isArray(variant.images) ? variant.images : [];
    const brokenUrl = imgs.find((img: string) => failedUnsplashUrls.has(img)) || "N/A";

    // Other images
    const otherValidImages = imgs.filter((img: string) => !img.includes("unsplash.com"));
    const hasOtherImages = otherValidImages.length > 0 ? `YES (${otherValidImages.length} images)` : "NO";

    auditRecords.push({
      productName: product.name,
      productId: product.id,
      category: product.category || "N/A",
      nodePath,
      variantId: variant.id,
      sku: variant.sku || "N/A",
      variantName: variant.variant_name || "N/A",
      attributesStr,
      brokenUrl,
      hasOtherImages
    });
  }

  // Print results
  console.log("\n=== FAILED UNsplash VARIANT AUDIT RECORDS ===");
  auditRecords.forEach((record, index) => {
    console.log(`\n--- Record ${index + 1} ---`);
    console.log(`Product Name:      ${record.productName}`);
    console.log(`Product ID:        ${record.productId}`);
    console.log(`Category:          ${record.category}`);
    console.log(`Node Path:         ${record.nodePath}`);
    console.log(`Variant ID:        ${record.variantId}`);
    console.log(`SKU:               ${record.sku}`);
    console.log(`Variant Name:      ${record.variantName}`);
    console.log(`Attributes:        ${record.attributesStr}`);
    console.log(`Broken URL:        ${record.brokenUrl}`);
    console.log(`Has Other Images:  ${record.hasOtherImages}`);
  });

  console.log("\n=== MARKDOWN TABLE (13 Rows) ===");
  console.log("| Product Name | Product ID | Category | Node Path | Variant ID | SKU | Variant Name | Attributes | Broken Unsplash URL | Has Other Valid Images |");
  console.log("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |");
  auditRecords.forEach(record => {
    console.log(`| ${record.productName} | ${record.productId} | ${record.category} | ${record.nodePath} | ${record.variantId} | ${record.sku} | ${record.variantName} | ${record.attributesStr} | ${record.brokenUrl} | ${record.hasOtherImages} |`);
  });
  console.log("=================================");
}

auditFailedVariants();
