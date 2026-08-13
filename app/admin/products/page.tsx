// @ts-nocheck
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import Image from "next/image";
import { formatPrice, getCategoryFallbackImage } from "@/utils";
import { getProducts, getAdminProductsPaginated, saveProduct, deleteProduct, bulkUpdateProducts, AdminProduct } from "@/services/AdminService";
import CascadingNavPicker from "@/components/ui/CascadingNavPicker";
import Pagination from "@/components/ui/Pagination";
import { ALLOWED_IMAGE_HOSTS } from "@/utils/imageConfig";
import {
  CatalogGroup,
  AttributeGroup,
  getAttributeGroups,
  getFullCatalog,
  getProductAttributes,
  setProductAttributes,
  
} from "@/services/AttributeService";
import {
  ProductVariant,
  getProductVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  validateSku,
  getVariantAttributeValues,
  setVariantAttributeValues,
  getVariantsWithAttributes,
  generateVariantSignature,
  type VariantWithAttributes,
} from "@/services/VariantService";
// NavNode shape — mirrors NavigationService.NavNode without importing the
// server-only service into this client component.
interface NavNode { id: string; name: string; slug: string; fullPath: string; level: number; icon: string | null; sortOrder: number; isActive: boolean; children: NavNode[]; }

const CATEGORIES = ["Men", "Women", "Kids", "New Arrivals", "Sale"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["Beige", "Black", "Charcoal", "Cream", "White", "Blue", "Olive", "Blush"];

/**
 * AdminProductsPage Component
 *
 * Provides comprehensive product inventory management (CRUD).
 * Styled in matching premium cream aesthetics with glassmorphic modals.
 */
function AdminProductImage({ product }: { product: AdminProduct }) {
  const [src, setSrc] = useState(product.imageSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setSrc(product.imageSrc);
    setHasError(false);
  }, [product.imageSrc]);

  if (!src || hasError) {
    return (
      <div className="h-12 w-10 flex items-center justify-center rounded-lg border border-stone-200 bg-stone-100 text-[10px] text-stone-400 font-medium text-center leading-tight">
        No<br/>Image
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={product.name}
      width={40}
      height={48}
      className="h-12 w-10 object-cover rounded-lg border border-stone-100 bg-stone-50"
      onError={() => {
        setHasError(true);
      }}
    />
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 when new search starts
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Bulk operations state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showBulkNodeModal, setShowBulkNodeModal] = useState(false);
  const [bulkNavNodeId, setBulkNavNodeId] = useState("");


  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [price, setPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [hsnCode, setHsnCode] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "archived">("draft");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "active" | "archived">("all");
  const [formError, setFormError] = useState("");

  // Attribute groups for product form dropdown
  const [allGroups, setAllGroups] = useState<AttributeGroup[]>([]);

  // ── Subcategory state ─────────────────────────────────────────────────────
  // Leaf nodes are loaded dynamically whenever `category` changes.
  const [leafNodes, setLeafNodes] = useState<NavNode[]>([]);
  const [leafNodesLoading, setLeafNodesLoading] = useState(false);
  
  // ── Navigation Nodes state ────────────────────────────────────────────────
  interface RawNode { id: string; name: string; full_path: string; level: number; parent_id: string | null; children?: RawNode[] }
  const [navNodes, setNavNodes] = useState<RawNode[]>([]);
  const [navTree, setNavTree] = useState<RawNode[]>([]);
  const [selectedNavNodeId, setSelectedNavNodeId] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/navigation")
      .then(res => res.json())
      .then((data: RawNode[]) => {
        setNavNodes(data);
        // Build a quick tree
        const map = new Map<string, RawNode>();
        data.forEach(node => map.set(node.id, { ...node, children: [] }));
        const tree: RawNode[] = [];
        data.forEach(node => {
          if (node.parent_id && map.has(node.parent_id)) {
            map.get(node.parent_id)!.children!.push(map.get(node.id)!);
          } else {
            tree.push(map.get(node.id)!);
          }
        });
        setNavTree(tree);
      })
      .catch(err => console.error("Failed to load nav tree", err));
  }, []);

  // Derive leaf nodes client-side from navNodes (already fetched via /api/admin/navigation).
  // A leaf node is any active node whose id does not appear as a parent_id of any other node.
  // Filter by the selected category prefix (e.g. "men", "women", "kids").
  useEffect(() => {
    if (!navNodes.length) {
      setLeafNodes([]);
      return;
    }
    setLeafNodesLoading(true);
    const parentIds = new Set(navNodes.map((n) => n.parent_id).filter(Boolean));
    const categorySlug = category.toLowerCase().replace(/\s+/g, "-");
    const leaves: NavNode[] = navNodes
      .filter((n) => !parentIds.has(n.id))
      .filter((n) => !categorySlug || n.full_path.startsWith(categorySlug))
      .map((n) => ({
        id: n.id,
        name: n.name,
        slug: n.full_path.split("/").pop() ?? n.name,
        fullPath: n.full_path,
        level: n.level,
        icon: null,
        sortOrder: 0,
        isActive: true,
        children: [],
      }));
    setLeafNodes(leaves);
    setLeafNodesLoading(false);
  }, [navNodes, category]);

  // ── Generic attribute options for the variant form ──────────────────────
  // Keyed by attribute name (e.g. "Color", "Size", "Fit", "Rise").
  // Populated from the product's assigned attribute group when the variant
  // modal is opened — no attribute names are hardcoded anywhere below.
  interface AttrOption { id: string; value: string; attrId: string; }
  const [productAttrOptions, setProductAttrOptions] = useState<Record<string, AttrOption[]>>({});
  // Selected attribute value IDs for the current variant form.
  // e.g. { "Color": "uuid-of-Blue", "Size": "uuid-of-32", "Fit": "uuid-of-Slim" }
  const [vSelectedAttrIds, setVSelectedAttrIds] = useState<Record<string, string>>({});

  // Image upload constants
  const MAX_VARIANT_IMAGES = 5;
  const MAX_FILE_SIZE_MB = 2;
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  // Variant form extra state fields
  const [vDiscountPercent, setVDiscountPercent] = useState<string>("");
  const [vImages, setVImages] = useState<string[]>([]);
  const [vSelectedFiles, setVSelectedFiles] = useState<File[]>([]);
  const [vFilePreviews, setVFilePreviews] = useState<string[]>([]);
  const [vFileError, setVFileError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVFileError(null);
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);

    // Validate each file
    for (const file of incoming) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setVFileError(`"${file.name}" is not allowed. Only JPG, PNG, and WEBP files are accepted.`);
        e.target.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setVFileError(`"${file.name}" exceeds the 2 MB size limit.`);
        e.target.value = "";
        return;
      }
    }

    // Enforce total image cap
    const currentTotal = vImages.length + vSelectedFiles.length;
    const remainingSlots = MAX_VARIANT_IMAGES - currentTotal;
    if (remainingSlots <= 0) {
      setVFileError(`Maximum ${MAX_VARIANT_IMAGES} images allowed. Remove an existing image first.`);
      e.target.value = "";
      return;
    }
    if (incoming.length > remainingSlots) {
      setVFileError(`You can only add ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} (max ${MAX_VARIANT_IMAGES} total).`);
      e.target.value = "";
      return;
    }

    const newPreviews = incoming.map(file => URL.createObjectURL(file));
    setVSelectedFiles(prev => [...prev, ...incoming]);
    setVFilePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const handleRemoveExistingImage = (idx: number) => {
    setVFileError(null);
    setVImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveNewFile = (idx: number) => {
    setVFileError(null);
    setVSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setVFilePreviews(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Load all attribute groups on mount
  useEffect(() => {
    getAttributeGroups()
      .then(setAllGroups)
      .catch((err) => console.error("Error loading attribute groups:", err));
  }, []);

  // ── Manage Variants modal state ───────────────────────────────────────
  const [variantModalProduct, setVariantModalProduct] = useState<AdminProduct | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantModalLoading, setVariantModalLoading] = useState(false);
  const [variantModalError, setVariantModalError] = useState<string | null>(null);
  // Full variant+attribute map for duplicate-combo detection
  const [variantAttributeMap, setVariantAttributeMap] = useState<VariantWithAttributes[]>([]);
  // Inline add-variant form
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [vSku, setVSku] = useState("");
  const [vPrice, setVPrice] = useState("");
  const [vDiscPrice, setVDiscPrice] = useState("");
  const [vQty, setVQty] = useState("");
  const [vGstRate, setVGstRate] = useState("5");
  const [vActive, setVActive] = useState(true);
  const [vIsPrimary, setVIsPrimary] = useState(false);
  const [vFormError, setVFormError] = useState<string | null>(null);
  const [vSaving, setVSaving] = useState(false);
  // Variant count badge per product
  const [variantCounts, setVariantCounts] = useState<Record<string, number>>({})

  // ── Manage Attributes modal state ──────────────────────────────────────────
  const [attrModalProduct, setAttrModalProduct] = useState<AdminProduct | null>(null);
  const [catalog, setCatalog] = useState<CatalogGroup[]>([]);
  const [checkedValueIds, setCheckedValueIds] = useState<Set<string>>(new Set());
  const [attrModalLoading, setAttrModalLoading] = useState(false);
  const [attrModalSaving, setAttrModalSaving] = useState(false);
  const [attrModalError, setAttrModalError] = useState<string | null>(null);
  // expandedGroupIds: which accordion sections are open (all by default)
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());
  // Count of assigned values per product (for badge display)
  const [assignedCounts, setAssignedCounts] = useState<Record<string, number>>({});

  // Load assigned counts for all products (for badge display)
  const loadAssignedCounts = useCallback(async (productList: AdminProduct[]) => {
    const counts: Record<string, number> = {};
    await Promise.all(
      productList.map(async (p) => {
        try {
          const ids = await getProductAttributes(p.id);
          counts[p.id] = ids.length;
        } catch {
          counts[p.id] = 0;
        }
      })
    );
    setAssignedCounts(counts);
  }, []);

  const openAttrModal = async (p: AdminProduct) => {
    setAttrModalProduct(p);
    setAttrModalLoading(true);
    setAttrModalError(null);
    setCheckedValueIds(new Set());
    setExpandedGroupIds(new Set());
    try {
        const [fullCatalog, assignedIds] = await Promise.all([
          getFullCatalog(),
          getProductAttributes(p.id),
        ]);
        
        let navGroupIds: string[] = [];
        if (p.navNodeId) {
          const { getSupabaseClient } = await import("@/lib/supabase/client");
          const supabase = getSupabaseClient();
          const { data } = await supabase.from("navigation_attribute_groups" as any).select("attribute_group_id").eq("nav_node_id", p.navNodeId);
          if (data) navGroupIds = data.map((r: any) => r.attribute_group_id);
        }
        
        const filteredCatalog = fullCatalog.filter(g => navGroupIds.includes(g.id));
        setCatalog(filteredCatalog);
        setCheckedValueIds(new Set(assignedIds));
        // Expand all groups by default
        setExpandedGroupIds(new Set(filteredCatalog.map(g => g.id)));
    } catch {
      setAttrModalError("Failed to load attribute catalog.");
    } finally {
      setAttrModalLoading(false);
    }
  };

  const closeAttrModal = () => {
    setAttrModalProduct(null);
    setCatalog([]);
    setCheckedValueIds(new Set());
    setAttrModalError(null);
    setExpandedGroupIds(new Set());
  };

  /** Toggle a single accordion section open/closed. */
  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const toggleValueCheck = (valueId: string, attributeId: string) => {
    setCheckedValueIds((prev) => {
      const next = new Set(prev);
      if (next.has(valueId)) {
        next.delete(valueId);
      } else {
        next.add(valueId);
      }
      return next;
    });
    void attributeId;
  };

  const handleSaveAttributes = async () => {
    if (!attrModalProduct) return;
    setAttrModalSaving(true);
    setAttrModalError(null);
    try {
      // Build assignments from ALL catalog groups (not just one active group)
      const assignments: Array<{ attributeId: string; attributeValueId: string }> = [];
      for (const group of catalog) {
        for (const attr of group.attributes) {
          for (const val of attr.values) {
            if (checkedValueIds.has(val.id)) {
              assignments.push({ attributeId: attr.id, attributeValueId: val.id });
            }
          }
        }
      }
      // Save value assignments
      await setProductAttributes(attrModalProduct.id, assignments);
      // Update local badge count
      setAssignedCounts((prev) => ({ ...prev, [attrModalProduct.id]: assignments.length }));
      closeAttrModal();
    } catch {
      setAttrModalError("Failed to save attributes. Please try again.");
    } finally {
      setAttrModalSaving(false);
    }
  };

  // Load variant counts for badge display
  const loadVariantCounts = useCallback(async (productList: AdminProduct[]) => {
    const counts: Record<string, number> = {};
    await Promise.all(
      productList.map(async (p) => {
        try {
          const vs = await getProductVariants(p.id);
          counts[p.id] = vs.length;
        } catch {
          counts[p.id] = 0;
        }
      })
    );
    setVariantCounts(counts);
  }, []);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    getAdminProductsPaginated({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearch,
      sortOrder
    })
      .then((res) => {
        setProducts(res.products);
        setTotalProducts(res.total);
        setIsLoading(false);
        loadAssignedCounts(res.products);
        loadVariantCounts(res.products);
      })
      .catch((err) => {
        console.error("[Products] Error fetching list:", err);
        setIsLoading(false);
      });
  }, [refreshTrigger, currentPage, debouncedSearch, sortOrder, loadAssignedCounts, loadVariantCounts]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setBrand("");
    setDescription("");
    setCategory("Men");
    // Fallback/stub values to pass validation for hidden fields
    setPrice("1");
    setDiscountPercent("");
    setStockQuantity("0");
    setImageSrc("https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop");
    setSelectedSizes(["One Size"]);
    setSelectedColors(["Default"]);
    setHsnCode("");
    setStatus("draft");
    setSelectedNavNodeId("");
    setBulkNavNodeId("");
    setFormError("");
    setShowModal(true);
  };

  const handleExportCsv = () => {
    if (products.length === 0) {
      alert("No products to export.");
      return;
    }
    const headers = [
      "id", "name", "description", "category", "brand", "price", "discountPercent", 
      "stockQuantity", "imageSrc", "images", "size", "color", "gstRate", 
      "hsnCode", "status", "navNodeId"
    ];
    const csvRows = [headers.join(",")];
    for (const p of products) {
      const values = headers.map(header => {
        const val = (p as any)[header];
        if (Array.isArray(val)) {
          return `"${val.join(";")}"`;
        }
        if (typeof val === "string") {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val ?? "";
      });
      csvRows.push(values.join(","));
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      alert("Invalid CSV format or empty file.");
      return;
    }
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
    let imported = 0;
    
    // Very basic CSV parser for import
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      const cols: string[] = [];
      let inQuotes = false;
      let curr = "";
      for (let j = 0; j < row.length; j++) {
        if (row[j] === '"') {
          if (inQuotes && row[j+1] === '"') { curr += '"'; j++; } // escaped quote
          else inQuotes = !inQuotes;
        } else if (row[j] === ',' && !inQuotes) {
          cols.push(curr);
          curr = "";
        } else {
          curr += row[j];
        }
      }
      cols.push(curr);

      const data: any = {};
      headers.forEach((h, idx) => {
        data[h] = cols[idx] !== undefined ? cols[idx] : "";
      });

      // Map to correct types for saveProduct
      const productPayload = {
        id: data.id || `csv-import-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: data.name || "",
        description: data.description || "",
        category: data.category || "Uncategorized",
        brand: data.brand || "Atelier",
        price: Number(data.price) || 0,
        discountPercent: data.discountPercent ? Number(data.discountPercent) : undefined,
        stockQuantity: Number(data.stockQuantity) || 0,
        imageSrc: data.imageSrc || "",
        images: data.images ? data.images.split(";") : [],
        size: data.size ? data.size.split(";") : [],
        color: data.color ? data.color.split(";") : [],
        gstRate: data.gstRate ? Number(data.gstRate) : undefined,
        hsnCode: data.hsnCode || "",
        status: ["draft", "active", "archived"].includes(data.status) ? data.status as any : "draft",
        navNodeId: data.navNodeId || null,
              };

      try {
        await saveProduct(productPayload as any);
        imported++;
      } catch (err) {
        console.error("Failed to import product row", i, err);
      }
    }
    
    alert(`Successfully imported/updated ${imported} products.`);
    e.target.value = ""; // Reset file input
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDuplicateProduct = (p: AdminProduct) => {
    setEditingProduct(null); // It's a new product, no ID attached
    setName(`${p.name} (Copy)`);
    setBrand(p.brand);
    setDescription(p.description);
    setCategory(p.category);
    setPrice(p.price.toString());
    setDiscountPercent(p.discountPercent ? p.discountPercent.toString() : "");
    setStockQuantity("0"); // reset stock for duplicate
    setImageSrc(p.imageSrc);
    setSelectedSizes(p.size);
    setSelectedColors(p.color);
    setHsnCode(p.hsnCode || "");
    setStatus("draft"); // keep status draft by default
    setSelectedNavNodeId(p.navNodeId || "");
        setShowModal(true);
  };

  const openEditModal = (p: AdminProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setDescription(p.description);
    setCategory(p.category);
    // Keep existing values of hidden fields so we don't modify them
    setPrice(p.price.toString());
    setDiscountPercent(p.discountPercent ? p.discountPercent.toString() : "");
    setStockQuantity(p.stockQuantity.toString());
    setImageSrc(p.imageSrc);
    setSelectedSizes(p.size);
    setSelectedColors(p.color);
    setHsnCode(p.hsnCode || "");
    setStatus(p.status || "draft");
    setSelectedNavNodeId(p.navNodeId || "");

        // Fetch and set assigned attribute group
    

    setFormError("");
    setShowModal(true);
  };


  const toggleProductSelection = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(new Set(products.map(p => p.id)));
    } else {
      setSelectedProductIds(new Set());
    }
  };

  const handleBulkStatus = async (newStatus: "draft" | "active" | "archived") => {
    if (selectedProductIds.size === 0) return;
    if (confirm(`Are you sure you want to mark ${selectedProductIds.size} products as ${newStatus.toUpperCase()}?`)) {
      const targetProducts = products.filter(p => selectedProductIds.has(p.id)).map(p => ({ ...p, status: newStatus }));
      await bulkUpdateProducts(targetProducts);
      setSelectedProductIds(new Set());
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleBulkNodeAssign = async () => {
    if (!bulkNavNodeId) {
      alert("Please select a navigation node first.");
      return;
    }
    await bulkUpdateProducts(Array.from(selectedProductIds), { navNodeId: bulkNavNodeId });
    setShowBulkNodeModal(false);
    setSelectedProductIds(new Set());
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"?`)) {
      await deleteProduct(id);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  // ── Variant modal handlers ──────────────────────────────────────

  const resetVariantForm = () => {
    setEditingVariantId(null);
    setVSku("");
    setVPrice("");
    setVDiscPrice("");
    setVDiscountPercent("");
    setVQty("");
    setVGstRate("5");
    setVActive(true);
    setVIsPrimary(false);
    setVSelectedAttrIds({});
    setVImages([]);
    setVSelectedFiles([]);
    setVFilePreviews([]);
    setVFileError(null);
    setVFormError(null);
  };

  const openVariantModal = async (p: AdminProduct) => {
    setVariantModalProduct(p);
    setVariantModalLoading(true);
    setVariantModalError(null);
    setShowVariantForm(false);
    resetVariantForm();
    try {
      const [vs, assignedValueIds, catalog, variantsWithAttrs] = await Promise.all([
        getProductVariants(p.id),
        getProductAttributes(p.id),
        getFullCatalog(),
        getVariantsWithAttributes(p.id),
      ]);
      setVariants(vs);
      setVariantAttributeMap(variantsWithAttrs);

      // ── Generic attribute extraction ────────────────────────────────────
      // Build a map of { attrName → [option, ...] } from the product's
      // assigned attribute values. All attributes are included — no
      // hardcoding of "Color" or "Size".
      const attrOpts: Record<string, AttrOption[]> = {};
      for (const group of catalog) {
        for (const attr of group.attributes) {
          const options = attr.values
            .filter((val) => assignedValueIds.includes(val.id))
            .map((val) => ({ id: val.id, value: val.value, attrId: attr.id }));
          if (options.length > 0) {
            attrOpts[attr.name] = options;
          }
        }
      }
      setProductAttrOptions(attrOpts);
    } catch {
      setVariantModalError("Failed to load variants or attributes.");
    } finally {
      setVariantModalLoading(false);
    }
  };

  const closeVariantModal = () => {
    setVariantModalProduct(null);
    setVariants([]);
    setVariantAttributeMap([]);
    setShowVariantForm(false);
    resetVariantForm();
    setVariantModalError(null);
  };

  const startEditVariant = async (v: ProductVariant) => {
    setEditingVariantId(v.id);
    setVSku(v.sku);
    setVPrice(v.price.toString());

    // Calculate discount percent
    if (v.discountedPrice != null && v.price > 0) {
      const diff = v.price - v.discountedPrice;
      const pct = Math.round((diff / v.price) * 100);
      setVDiscountPercent(pct.toString());
    } else {
      setVDiscountPercent("");
    }

    setVQty(v.quantity.toString());
    setVGstRate(v.gstRate?.toString() || "5");
    setVActive(v.isActive);
    setVIsPrimary(v.isPrimary);
    setVImages(v.images || []);
    setVSelectedFiles([]);
    setVFilePreviews([]);
    setVFormError(null);
    setShowVariantForm(true);

    try {
      const assignedIds = await getVariantAttributeValues(v.id);
      // Restore all attributes generically from the current productAttrOptions map
      const restored: Record<string, string> = {};
      for (const [attrName, options] of Object.entries(productAttrOptions)) {
        const match = options.find((opt) => assignedIds.includes(opt.id));
        if (match) restored[attrName] = match.id;
      }
      setVSelectedAttrIds(restored);
    } catch (err) {
      console.error("Failed to load variant attributes:", err);
    }
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantModalProduct) return;
    setVFormError(null);

    // Validate that every attribute with options has a value selected
    const missingAttrs = Object.keys(productAttrOptions).filter(
      (attrName) => !vSelectedAttrIds[attrName]
    );
    if (missingAttrs.length > 0) {
      setVFormError(`Please select a value for: ${missingAttrs.join(", ")}.`);
      return;
    }

    // ── Full attribute-combination duplicate check ────────────────────────
    // Checks ALL selected attributes, not just Color+Size.
    // Blue/32/Slim/Mid Rise and Blue/32/Slim/High Rise are correctly treated
    // as distinct variants.
    const hasAnySelection = Object.values(vSelectedAttrIds).some(Boolean);
    if (hasAnySelection) {
      const conflict = variantAttributeMap.find((va) => {
        if (editingVariantId && va.variant.id === editingVariantId) return false;
        return Object.entries(vSelectedAttrIds).every(([attrName, valueId]) => {
          if (!valueId) return true;
          const opt = productAttrOptions[attrName]?.find((o) => o.id === valueId);
          return opt ? va.attributes[attrName] === opt.value : true;
        });
      });
      if (conflict) {
        const parts = Object.entries(vSelectedAttrIds)
          .filter(([, id]) => id)
          .map(([attrName, valueId]) => {
            const opt = productAttrOptions[attrName]?.find((o) => o.id === valueId);
            return opt ? `${attrName} = ${opt.value}` : null;
          })
          .filter(Boolean)
          .join(" & ");
        setVFormError(
          `A variant with ${parts} already exists (SKU: ${conflict.variant.sku}). Each attribute combination must be unique.`
        );
        return;
      }
    }
    // ── End duplicate check ──────────────────────────────────────────────

    // Validate common fields
    const { validateVariantFields, uploadVariantImages, generateVariantName, generateVariantSignature, createVariant, getVariantsWithAttributes, isSkuUnique } = await import("@/services/VariantService");
    
    const selectedValues = Object.entries(vSelectedAttrIds)
      .filter(([, id]) => id)
      .map(([attrName, valueId]) => productAttrOptions[attrName]?.find((o) => o.id === valueId)?.value);
    const generatedName = generateVariantName(selectedValues);

    const val = validateVariantFields(vPrice, vQty, null, vSku, generatedName);
    if (!val.isValid) {
      setVFormError(val.error!);
      return;
    }
    
    const priceNum = parseFloat(vPrice);
    const qtyNum = parseInt(vQty, 10);
    
    // Validate discount percentage
    const discountPercentNum = vDiscountPercent.trim() ? parseFloat(vDiscountPercent) : 0;
    if (isNaN(discountPercentNum) || discountPercentNum < 0 || discountPercentNum > 100) {
      setVFormError("Discount percentage must be a number between 0 and 100.");
      return;
    }

    const sellingPrice = discountPercentNum > 0
      ? Number((priceNum - (priceNum * discountPercentNum / 100)).toFixed(2))
      : null;

    setVSaving(true);
    try {
      const isUnique = await isSkuUnique(vSku, editingVariantId || undefined);
      if (!isUnique) {
        setVFormError(`SKU "${vSku}" already exists. Please enter a unique SKU.`);
        setVSaving(false);
        return;
      }

      let savedVariant: ProductVariant;

      // 0. Compute the unique attribute signature
      const selectedValueIds = Object.values(vSelectedAttrIds).filter(Boolean) as string[];
      const variantSignature = generateVariantSignature(selectedValueIds);

      // 1. If editing existing variant
      if (editingVariantId) {
        // Upload any new files first
        let finalImages = [...vImages];
        if (vSelectedFiles.length > 0) {
          const uploadedUrls = await uploadVariantImages(variantModalProduct.id, editingVariantId, vSelectedFiles);
          finalImages = [...finalImages, ...uploadedUrls];
        }

        savedVariant = await updateVariant(editingVariantId, {
          sku: vSku,
          variantName: generatedName,
          price: priceNum,
          discountedPrice: sellingPrice,
          quantity: qtyNum,
          isActive: vActive,
          isPrimary: vIsPrimary,
          gstRate: parseInt(vGstRate, 10) || 5,
          images: finalImages,
          variantSignature,
        });
        setVariants((prev) => prev.map((v) => v.id === editingVariantId ? savedVariant : v));
      } 
      // 2. If creating new variant
      else {
        // Create variant first to get variant ID
        savedVariant = await createVariant({
          productId: variantModalProduct.id,
          sku: vSku,
          variantName: generatedName,
          price: priceNum,
          discountedPrice: sellingPrice,
          quantity: qtyNum,
          isActive: vActive,
          isPrimary: vIsPrimary,
          gstRate: parseInt(vGstRate, 10) || 5,
          images: [],
          variantSignature,
        });

        // Now upload new files using the new variant ID
        if (vSelectedFiles.length > 0) {
          const uploadedUrls = await uploadVariantImages(variantModalProduct.id, savedVariant.id, vSelectedFiles);
          if (uploadedUrls.length > 0) {
            savedVariant = await updateVariant(savedVariant.id, {
              images: uploadedUrls,
            });
          }
        }
        
        setVariants((prev) => [...prev, savedVariant]);
        setVariantCounts((prev) => ({ ...prev, [variantModalProduct.id]: (prev[variantModalProduct.id] ?? 0) + 1 }));
      }

      // Save ALL attribute assignments generically
      const assignments: Array<{ attributeId: string; attributeValueId: string }> = Object.entries(
        vSelectedAttrIds
      )
        .filter(([, valueId]) => valueId)
        .map(([attrName, valueId]) => {
          const opt = productAttrOptions[attrName]?.find((o) => o.id === valueId);
          return opt ? { attributeId: opt.attrId, attributeValueId: opt.id } : null;
        })
        .filter((a): a is { attributeId: string; attributeValueId: string } => a !== null);
      await setVariantAttributeValues(savedVariant.id, assignments);

      // Update the in-memory attribute map with the full generic attribute set
      const updatedAttributes: Record<string, string> = {};
      for (const [attrName, valueId] of Object.entries(vSelectedAttrIds)) {
        const opt = productAttrOptions[attrName]?.find((o) => o.id === valueId);
        if (opt) updatedAttributes[attrName] = opt.value;
      }
      setVariantAttributeMap((prev) => [
        ...prev.filter((va) => va.variant.id !== savedVariant.id),
        { variant: savedVariant, attributes: updatedAttributes },
      ]);

      // Clean up object URLs
      vFilePreviews.forEach(url => URL.revokeObjectURL(url));

      setShowVariantForm(false);
      resetVariantForm();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      setVFormError(err instanceof Error ? err.message : "Failed to save variant.");
    } finally {
      setVSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string, sku: string) => {
    if (!confirm(`Delete variant "${sku}"? This cannot be undone.`)) return;
    try {
      await deleteVariant(variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      // Also remove from the attribute map so duplicate checks reflect the deletion
      setVariantAttributeMap(prev => prev.filter(va => va.variant.id !== variantId));
      if (variantModalProduct) {
        setVariantCounts((prev) => ({
          ...prev,
          [variantModalProduct.id]: Math.max(0, (prev[variantModalProduct.id] ?? 1) - 1),
        }));
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch {
      setVariantModalError("Failed to delete variant.");
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!name.trim()) return setFormError("Product name is required.");
    if (!brand.trim()) return setFormError("Brand is required.");
    if (!description.trim()) return setFormError("Description is required.");
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return setFormError("Price must be a valid positive number.");
    }
    if (discountPercent && (isNaN(Number(discountPercent)) || Number(discountPercent) < 0 || Number(discountPercent) > 100)) {
      return setFormError("Discount percentage must be between 0 and 100.");
    }
    if (!stockQuantity || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0) {
      return setFormError("Stock quantity must be a non-negative number.");
    }
    // Removed obsolete Product-level image URL validation
    if (selectedSizes.length === 0) {
      return setFormError("Please select at least one product size.");
    }
    if (selectedColors.length === 0) {
      return setFormError("Please select at least one product color.");
    }

    if (!selectedNavNodeId) {
      return setFormError("Navigation Node is required.");
    }
    const selectedNode = navNodes.find(n => n.id === selectedNavNodeId);
    if (!selectedNode) {
      return setFormError("Invalid Navigation Node selected.");
    }
    // Check if it's a leaf node
    const hasChildren = navNodes.some(n => n.parent_id === selectedNavNodeId);
    if (hasChildren) {
      return setFormError("You must select a leaf node (a category without subcategories).");
    }

    try {
      const { getSupabaseClient } = await import("@/lib/supabase/client");
      const supabase = getSupabaseClient();
      const { data } = await supabase.from("navigation_attribute_groups" as any)
                                     .select("attribute_group_id")
                                     .eq("nav_node_id", selectedNavNodeId)
                                     .limit(1);
      if (!data || data.length === 0) {
        return setFormError("The selected Navigation Node has no mapped Attribute Group. Please configure it in Taxonomy settings first.");
      }
    } catch (err) {
      return setFormError("Failed to validate attribute mapping for the selected node.");
    }

    console.log("[AdminService] Saving product with navNodeId:", selectedNavNodeId);

    const payload: AdminProduct = {
      id: editingProduct ? editingProduct.id : `product_${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      stockQuantity: Number(stockQuantity),
      imageSrc: imageSrc.trim(),
      images: [imageSrc.trim()],
      size: selectedSizes,
      color: selectedColors,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 0,
      sku: editingProduct ? editingProduct.sku : `CC-${brand.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      hsnCode: hsnCode.trim() || undefined,
      status: status,
              navNodeId: selectedNavNodeId || null,
    };

    try {
      console.log("[AdminService] Category:", category);

      await saveProduct(payload);
      
      setShowModal(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      console.error(
        "[AdminService] handleSaveProduct catch error:",
        JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
      );
      setFormError("Failed to save product. Please try again.");
    }
  };

  const calculatedSellingPrice = useMemo(() => {
    const mrp = parseFloat(vPrice);
    const disc = parseFloat(vDiscountPercent);
    if (isNaN(mrp) || mrp <= 0) return null;
    if (isNaN(disc) || disc <= 0) return mrp;
    return mrp - (mrp * disc / 100);
  }, [vPrice, vDiscountPercent]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading product listings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
            Products Inventory
          </h1>
          <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
            Manage catalogue, prices, descriptions, sizing, and categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Export CSV
          </button>
          <label className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors uppercase tracking-wider cursor-pointer inline-flex items-center">
            <span>Import CSV</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
          </label>
          <button
            onClick={openAddModal}
            className="rounded-full bg-[#E0A99E] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#D4988D] transition-colors shadow-md hover:shadow-[#E0A99E]/20 uppercase tracking-wider cursor-pointer"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-stone-200/50 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-stone-700 uppercase tracking-wider">Products</span>
          <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-1 rounded-full">({totalProducts})</span>
        </div>
        <div className="w-full sm:w-96 relative">
          <input
            type="text"
            placeholder="Search by name, brand, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-sm focus:border-[#E0A99E]/50 focus:ring-1 focus:ring-[#E0A99E]/50 outline-none"
          />
          <svg className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Product List Table */}
      <div className="rounded-3xl border border-stone-200/50 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-stone-150 bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400">
                <th className="py-4 px-6 w-12 text-center"><input type="checkbox" checked={selectedProductIds.size === products.length && products.length > 0} onChange={toggleAllSelection} className="w-4 h-4 rounded border-stone-300 text-[#E0A99E] focus:ring-[#E0A99E]" /></th>
                  <th className="py-4 px-6 font-semibold">Image</th>
                <th className="py-4 px-6 font-semibold">Product Name</th>
                <th className="py-4 px-6 font-semibold">Category</th>
                <th className="py-4 px-6 font-semibold">Stock</th>
                <th 
                  className="py-4 px-6 font-semibold cursor-pointer hover:text-stone-700 transition-colors select-none"
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                >
                  <div className="flex items-center gap-1">
                    Created Date
                    <span className="text-[10px]">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                  </div>
                </th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500 text-sm font-medium">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-6 text-center"><input type="checkbox" checked={selectedProductIds.has(p.id)} onChange={() => toggleProductSelection(p.id)} className="w-4 h-4 rounded border-stone-300 text-[#E0A99E] focus:ring-[#E0A99E]" /></td>
                    <td className="py-3 px-6">
                    <AdminProductImage product={p} />
                  </td>
                  <td className="py-3 px-6">
                    <div>
                      <span className="block font-bold text-stone-900 text-sm">
                        {p.name}
                      </span>
                      <span className="block text-[10px] text-[#E0A99E] font-extrabold uppercase tracking-widest mt-0.5">
                        {p.brand} &middot; SKU: {p.sku || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-medium text-stone-650">
                    {p.category}
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`inline-block font-extrabold rounded-full px-3 py-0.5 text-[9px] uppercase tracking-wider ${
                        p.stockQuantity === 0
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : p.stockQuantity < 10
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      {p.stockQuantity === 0 ? "Out of Stock" : `${p.stockQuantity} Left`}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-stone-500">
                    <div className="flex flex-col">
                      <span className="font-medium text-stone-700">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}</span>
                      <span className="text-[10px] uppercase tracking-wider">{p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-3.5">
                      {/* Attribute count badge */}
                      {assignedCounts[p.id] !== undefined && (
                        <button
                          onClick={() => openAttrModal(p)}
                          className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E0A99E]/10 text-[#C68B7D] border border-[#E0A99E]/30 hover:bg-[#E0A99E]/20 transition-colors cursor-pointer"
                          title="Manage Attributes"
                        >
                          🏷️ {assignedCounts[p.id]}
                        </button>
                      )}
                      {/* Variant count badge */}
                      {variantCounts[p.id] !== undefined && (
                        <button
                          onClick={() => openVariantModal(p)}
                          className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200 transition-colors cursor-pointer"
                          title="Manage Variants"
                        >
                          📦 {variantCounts[p.id]}
                        </button>
                      )}
                      <button
                        onClick={() => openAttrModal(p)}
                        className="text-[#C68B7D] hover:text-[#A5756A] font-bold tracking-wider uppercase text-[10px] cursor-pointer"
                      >
                        Attributes
                      </button>
                      <button
                        onClick={() => openVariantModal(p)}
                        className="text-emerald-600 hover:text-emerald-800 font-bold tracking-wider uppercase text-[10px] cursor-pointer"
                      >
                        Variants
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-stone-500 hover:text-stone-850 font-bold tracking-wider uppercase text-[10px] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-rose-400 hover:text-rose-600 font-bold tracking-wider uppercase text-[10px] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalProducts > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-stone-200/50 shadow-sm">
          <div className="text-xs text-stone-500 font-medium">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} of {totalProducts}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalProducts / ITEMS_PER_PAGE)}
            onPageChange={(page) => setCurrentPage(page)}
            className="w-full sm:w-auto"
          />
        </div>
      )}

      {/* Reusable Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white/95 border border-white/50 shadow-2xl rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl flex flex-col space-y-6 transform scale-100 transition-transform duration-300 animate-zoom-in">
            
            {/* Title */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900 uppercase tracking-wide">
                {editingProduct ? "Edit Product Details" : "Create New Product"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <p className="text-xs font-semibold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                ⚠️ {formError}
              </p>
            )}

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs text-stone-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="block font-bold uppercase tracking-wider text-stone-500">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tailored Summer Linen Blazer"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                  />
                </div>

                {/* Brand */}
                <div className="space-y-1.5">
                  <label className="block font-bold uppercase tracking-wider text-stone-500">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Atelier Certitude"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block font-bold uppercase tracking-wider text-stone-500">
                  Product Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the product materials, fit guidelines, styling suggestions, and finish quality..."
                  rows={3}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Navigation Node Picker */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-stone-500">
                    Navigation Node *
                  </label>
                  <CascadingNavPicker 
                    nodes={navNodes} 
                    selectedId={selectedNavNodeId} 
                    onChange={(id) => {
                      setSelectedNavNodeId(id);
                      // Fallback for legacy
                      const node = navNodes.find(n => n.id === id);
                      if (node) {
                         const rootId = node.full_path.split('/')[0];
                         const root = navNodes.find(n => n.id === rootId);
                         if (root) setCategory(root.name);
                      }
                    }} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* HSN Code */}
                <div className="space-y-1.5">
                  <label className="block font-bold uppercase tracking-wider text-stone-500">
                    HSN Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="e.g. 6204"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5 bg-stone-50/50 p-4 rounded-xl border border-stone-200">
                <label className="block text-sm font-bold tracking-wider text-stone-600">
                  Product Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "draft" | "active" | "archived")}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-850 shadow-sm focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                >
                  <option value="draft">Draft (Admin Only)</option>
                  <option value="active">Active (Visible Everywhere)</option>
                  <option value="archived">Archived (Hidden from Storefront)</option>
                </select>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3.5 border-t border-stone-100 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-stone-200 px-6 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50 uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-stone-900 px-8 py-2.5 text-xs font-bold text-white hover:bg-stone-850 transition-all shadow-md uppercase tracking-wider cursor-pointer"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Manage Attributes Modal ─────────────────────────────────────────── */}
      {attrModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-stone-200/60 shadow-2xl rounded-3xl p-0 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-stone-100 flex-shrink-0">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#E0A99E] mb-0.5">
                  Product Attributes
                </p>
                <h2 className="text-base font-black text-stone-900 uppercase tracking-wide leading-tight">
                  {attrModalProduct.name}
                </h2>
                <p className="text-[10px] text-stone-400 font-light mt-0.5 uppercase tracking-widest">
                  {attrModalProduct.brand} &middot; {attrModalProduct.category}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAttrModal}
                className="text-stone-400 hover:text-stone-700 transition-colors text-xl leading-none mt-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {attrModalLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
                    <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading attribute catalog…
                  </div>
                </div>
              ) : catalog.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-stone-400 text-xs font-light uppercase tracking-widest">
                    No attribute groups defined yet.
                  </p>
                  <p className="text-stone-300 text-[10px] mt-1">
                    Go to Admin → Attributes to create groups, attributes, and values first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {catalog.map((group) => {
                    const isExpanded = expandedGroupIds.has(group.id);
                    const groupSelectedCount = group.attributes
                      .flatMap(a => a.values)
                      .filter(v => checkedValueIds.has(v.id)).length;
                    return (
                      <div key={group.id} className="rounded-2xl border border-stone-200/60 overflow-hidden">
                        {/* Accordion header */}
                        <button
                          type="button"
                          onClick={() => toggleGroupExpanded(group.id)}
                          className="w-full flex items-center justify-between px-5 py-3.5 bg-stone-50/70 hover:bg-stone-100/60 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-stone-500">
                              {group.name}
                            </span>
                            {groupSelectedCount > 0 && (
                              <span className="text-[9px] font-extrabold bg-[#E0A99E]/15 text-[#C68B7D] border border-[#E0A99E]/25 rounded-full px-2 py-0.5">
                                {groupSelectedCount}
                              </span>
                            )}
                          </div>
                          <svg
                            className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Accordion body */}
                        {isExpanded && (
                          <div className="px-5 py-4 space-y-5">
                            {group.attributes.length === 0 ? (
                              <p className="text-[10px] text-stone-300 italic">
                                No attributes defined in &ldquo;{group.name}&rdquo; yet.
                              </p>
                            ) : (
                              group.attributes.map((attr) => (
                                <div key={attr.id}>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                                    {attr.name}
                                  </p>
                                  {attr.values.length === 0 ? (
                                    <p className="text-[10px] text-stone-300 italic">No values defined.</p>
                                  ) : (
                                    <div className="flex flex-wrap gap-2">
                                      {attr.values.map((val) => {
                                        const checked = checkedValueIds.has(val.id);
                                        return (
                                          <label
                                            key={val.id}
                                            className={`inline-flex items-center gap-2 cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-150 select-none ${
                                              checked
                                                ? "bg-[#E0A99E]/10 border-[#E0A99E] text-[#C68B7D] shadow-sm"
                                                : "bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700"
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              className="sr-only"
                                              checked={checked}
                                              onChange={() => toggleValueCheck(val.id, attr.id)}
                                            />
                                            <span
                                              className={`w-3.5 h-3.5 flex-shrink-0 rounded border flex items-center justify-center transition-colors ${
                                                checked
                                                  ? "bg-[#E0A99E] border-[#E0A99E]"
                                                  : "border-stone-300 bg-white"
                                              }`}
                                            >
                                              {checked && (
                                                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12">
                                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                              )}
                                            </span>
                                            {val.value}
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t border-stone-100 px-8 py-5">
              {attrModalError && (
                <p className="text-xs font-semibold text-rose-500 mb-3 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                  ⚠️ {attrModalError}
                </p>
              )}

              {/* Read-only summary of selections */}
              {!attrModalLoading && checkedValueIds.size > 0 && (
                <div className="mb-4 rounded-2xl bg-stone-50 border border-stone-200/60 px-4 py-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-2">
                    Assigned Attributes ({checkedValueIds.size})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {catalog.flatMap((g) =>
                      g.attributes.flatMap((a) =>
                        a.values
                          .filter((v) => checkedValueIds.has(v.id))
                          .map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full bg-[#E0A99E]/15 text-[#C68B7D] px-2.5 py-0.5 border border-[#E0A99E]/20"
                            >
                              <span className="text-stone-400 font-normal">{a.name}:</span>
                              {v.value}
                            </span>
                          ))
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] text-stone-400 font-light">
                  {checkedValueIds.size === 0
                    ? "No attributes selected"
                    : `${checkedValueIds.size} value${checkedValueIds.size === 1 ? "" : "s"} selected`}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeAttrModal}
                    className="rounded-full border border-stone-200 px-6 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50 uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAttributes}
                    disabled={attrModalSaving || attrModalLoading}
                    className="rounded-full bg-[#E0A99E] px-8 py-2.5 text-xs font-bold text-white hover:bg-[#D4988D] transition-all shadow-md uppercase tracking-wider disabled:opacity-60 cursor-pointer"
                  >
                    {attrModalSaving ? "Saving…" : "Save Attributes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Variants Modal ─────────────────────────────────────────── */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-stone-200/60 shadow-2xl rounded-3xl p-0 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-stone-100 flex-shrink-0">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 mb-0.5">
                  Product Variants
                </p>
                <h2 className="text-base font-black text-stone-900 uppercase tracking-wide leading-tight">
                  {variantModalProduct.name}
                </h2>
                <p className="text-[10px] text-stone-400 font-light mt-0.5 uppercase tracking-widest">
                  {variantModalProduct.brand} &middot; {variantModalProduct.category} &middot; {variants.length} variant{variants.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button type="button" onClick={closeVariantModal}
                className="text-stone-400 hover:text-stone-700 transition-colors text-xl leading-none mt-1 cursor-pointer">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              {variantModalLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
                    <svg className="h-5 w-5 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading variants…
                  </div>
                </div>
              ) : (
                <>
                  {/* Variant list */}
                  {variants.length === 0 && !showVariantForm ? (
                    <div className="rounded-2xl border border-dashed border-stone-200 py-10 text-center">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-300">
                        No variants yet. Add the first one below.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {variants.map((v, idx) => (
                        <div key={v.id} className="rounded-2xl border border-stone-200/60 bg-stone-50/50 px-5 py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
                                  Variant #{idx + 1}
                                </span>
                                {v.variantCode && (
                                  <span className="flex items-center gap-1">
                                    <span className="font-mono text-[9px] font-extrabold text-[#C47E72] bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded tracking-widest">
                                      {v.variantCode}
                                    </span>
                                    <button
                                      type="button"
                                      title="Copy Variant Code"
                                      onClick={() => navigator.clipboard.writeText(v.variantCode)}
                                      className="text-stone-400 hover:text-stone-600 transition-colors"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    </button>
                                  </span>
                                )}
                                <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  v.isActive
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-stone-100 text-stone-400 border border-stone-200"
                                }`}>
                                  {v.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <p className="text-xs font-black text-stone-900 mt-1 truncate">
                                {v.variantName || v.sku}
                              </p>
                              <div className="flex flex-wrap gap-x-5 gap-y-0.5 mt-1.5 text-[10px] text-stone-500">
                                <span><span className="text-stone-400">SKU:</span> {v.sku}</span>
                                <span><span className="text-stone-400">Price:</span> ₹{v.price.toLocaleString("en-IN")}</span>
                                {v.discountedPrice != null && (
                                  <span><span className="text-stone-400">Sale:</span> ₹{v.discountedPrice.toLocaleString("en-IN")}</span>
                                )}
                                <span><span className="text-stone-400">Stock:</span> {v.quantity}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <button type="button" onClick={() => startEditVariant(v)}
                                className="text-stone-500 hover:text-stone-900 font-bold uppercase tracking-wider text-[10px] cursor-pointer">
                                Edit
                              </button>
                              <button type="button" onClick={() => handleDeleteVariant(v.id, v.sku)}
                                className="text-rose-400 hover:text-rose-600 font-bold uppercase tracking-wider text-[10px] cursor-pointer">
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add / Edit variant inline form */}
                  {showVariantForm ? (
                    <form onSubmit={handleSaveVariant}
                      className="rounded-2xl border border-emerald-200/60 bg-emerald-50/30 px-6 py-5 space-y-4 text-xs text-stone-600">
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600 mb-1">
                        {editingVariantId ? "Edit Variant" : "Add New Variant"}
                      </p>

                      {/* Variant Code — read-only when editing */}
                      {editingVariantId && (() => {
                        const editingV = variants.find(v => v.id === editingVariantId);
                        return editingV?.variantCode ? (
                          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Code</span>
                            <span className="font-mono text-xs font-extrabold text-[#C47E72] tracking-widest">{editingV.variantCode}</span>
                            <button
                              type="button"
                              title="Copy Variant Code"
                              onClick={() => navigator.clipboard.writeText(editingV.variantCode)}
                              className="ml-auto text-stone-400 hover:text-stone-600 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        ) : null;
                      })()}

                      {vFormError && (
                        <p className="text-xs font-semibold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                          ⚠️ {vFormError}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Dynamic attribute dropdowns — one per attribute in the product's group */}
                        {Object.keys(productAttrOptions).length > 0 ? (
                          Object.entries(productAttrOptions).map(([attrName, options]) => (
                            <div key={attrName} className="space-y-1.5">
                              <label className="block font-bold uppercase tracking-wider text-stone-500">
                                {attrName} *
                              </label>
                              <select
                                value={vSelectedAttrIds[attrName] ?? ""}
                                onChange={(e) =>
                                  setVSelectedAttrIds((prev) => ({ ...prev, [attrName]: e.target.value }))
                                }
                                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-850 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
                              >
                                <option value="">— Select {attrName} —</option>
                                {options.map((opt) => (
                                  <option key={opt.id} value={opt.id}>
                                    {opt.value}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                            <p className="text-[11px] font-semibold text-amber-700">
                              ⚠️ No attribute group is assigned to this product, or the group has no values assigned.
                            </p>
                            <p className="text-[10px] text-amber-600 mt-1">
                              Go to the product's <strong>Attributes</strong> panel and assign an attribute group with values (Color, Size, Fit, Rise, etc.) before adding variants.
                            </p>
                          </div>
                        )}

                        {/* SKU */}
                        <div className="space-y-1.5">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">SKU *</label>
                          <input type="text" value={vSku} onChange={(e) => setVSku(e.target.value)}
                            placeholder="e.g. LEV-511-BLU-30"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40" />
                        </div>

                        {/* MRP */}
                        <div className="space-y-1.5">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">MRP (₹) *</label>
                          <input type="number" min="0" step="0.01" value={vPrice} onChange={(e) => setVPrice(e.target.value)}
                            placeholder="e.g. 2499"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40" />
                        </div>

                        {/* Discount Percentage */}
                        <div className="space-y-1.5">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">Discount Percentage (%)</label>
                          <input type="number" min="0" max="100" value={vDiscountPercent} onChange={(e) => setVDiscountPercent(e.target.value)}
                            placeholder="e.g. 10"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40" />
                        </div>

                        {/* GST Rate */}
                        <div className="space-y-1.5">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">GST Rate (%) *</label>
                          <select 
                            value={vGstRate} 
                            onChange={(e) => setVGstRate(e.target.value)}
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-850 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </div>

                        {/* Selling Price Preview */}
                        <div className="space-y-1.5">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">Selling Price (Preview)</label>
                          <div className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-stone-880 font-bold">
                            {calculatedSellingPrice !== null ? `₹${calculatedSellingPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-1.5">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">Quantity *</label>
                          <input type="number" min="0" step="1" value={vQty} onChange={(e) => setVQty(e.target.value)}
                            placeholder="e.g. 15"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40" />
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">Status</label>
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={vActive} onChange={(e) => setVActive(e.target.checked)}
                              className="sr-only" />
                            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              vActive ? "bg-emerald-500" : "bg-stone-300"
                            }`}>
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                vActive ? "translate-x-4" : "translate-x-1"
                              }`} />
                            </span>
                            <span className="text-xs font-semibold text-stone-600">{vActive ? "Active" : "Inactive"}</span>
                          </label>
                        </div>

                        {/* Primary Variant */}
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <label className="block font-bold uppercase tracking-wider text-stone-500" title={editingVariantId && variants.find(v => v.id === editingVariantId)?.isPrimary ? "Primary variant cannot be unchecked directly. Make another variant primary instead." : ""}>Primary Variant</label>
                          <label className={`inline-flex items-center gap-2 ${editingVariantId && variants.find(v => v.id === editingVariantId)?.isPrimary ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                            <input type="checkbox" checked={vIsPrimary} onChange={(e) => setVIsPrimary(e.target.checked)} disabled={vSaving || (!!editingVariantId && !!variants.find(v => v.id === editingVariantId)?.isPrimary)}
                              className="sr-only" />
                            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              vIsPrimary ? "bg-emerald-500" : "bg-stone-300"
                            }`}>
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                vIsPrimary ? "translate-x-4" : "translate-x-1"
                              }`} />
                            </span>
                            <span className="text-xs font-semibold text-stone-600">{vIsPrimary ? "Primary" : "Secondary"}</span>
                          </label>
                        </div>
                      </div>

                      {/* Images */}
                      <div className="space-y-3">
                        {/* Header row */}
                        <div className="flex items-end justify-between">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">
                            Variant Images
                          </label>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            vImages.length + vSelectedFiles.length >= MAX_VARIANT_IMAGES
                              ? "text-rose-500"
                              : "text-stone-400"
                          }`}>
                            {vImages.length + vSelectedFiles.length} / {MAX_VARIANT_IMAGES}
                          </span>
                        </div>

                        {/* Helper text */}
                        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 space-y-1">
                          <p className="text-[11px] font-semibold text-amber-700">ℹ️ Image Guidelines</p>
                          <ul className="text-[10px] text-amber-700 space-y-0.5 list-disc list-inside">
                            <li>Maximum <strong>5 images</strong> allowed per variant.</li>
                            <li>The <strong>first image</strong> is used as the primary product image across the website.</li>
                            <li>Recommended order: <strong>Front, Back, Left, Right, Lifestyle/Model.</strong></li>
                            <li>Accepted formats: JPG, PNG, WEBP &bull; Max size: 2 MB each.</li>
                          </ul>
                        </div>

                        {/* Upload zone — disabled when cap is reached */}
                        <div className="flex flex-col gap-3">
                          {vImages.length + vSelectedFiles.length < MAX_VARIANT_IMAGES ? (
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-stone-200 border-dashed rounded-2xl cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors">
                                <div className="flex flex-col items-center justify-center py-4">
                                  <svg className="w-7 h-7 mb-2 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <p className="text-xs text-stone-500"><span className="font-bold">Click to upload</span> or drag and drop</p>
                                  <p className="text-[10px] text-stone-400 mt-0.5">
                                    JPG, PNG, WEBP &bull; Max 2 MB each &bull; Up to {MAX_VARIANT_IMAGES - vImages.length - vSelectedFiles.length} more
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  multiple
                                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                  onChange={handleFileChange}
                                />
                              </label>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-full h-16 rounded-2xl border-2 border-rose-200 bg-rose-50">
                              <p className="text-[11px] font-semibold text-rose-500">
                                Maximum {MAX_VARIANT_IMAGES} images reached. Remove an image to upload more.
                              </p>
                            </div>
                          )}

                          {/* File validation error */}
                          {vFileError && (
                            <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                              ⚠️ {vFileError}
                            </p>
                          )}

                          {/* Image thumbnails */}
                          {((vImages && vImages.length > 0) || vFilePreviews.length > 0) && (
                            <div className="grid grid-cols-5 gap-2">
                              {vImages.map((img, idx) => (
                                <div key={`existing-${idx}`} className="relative group aspect-square border border-stone-200 rounded-xl overflow-hidden bg-stone-50 shadow-sm">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img} alt={`Variant Image ${idx + 1}`} className="w-full h-full object-cover" />
                                  {idx === 0 && vSelectedFiles.length === 0 && (
                                    <span className="absolute top-1 left-1 bg-[#E0A99E] text-white text-[8px] font-black uppercase px-1 rounded leading-tight">
                                      Primary
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExistingImage(idx)}
                                    className="absolute inset-0 bg-rose-500/85 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ))}
                              {vFilePreviews.map((previewUrl, idx) => (
                                <div key={`new-${idx}`} className="relative group aspect-square border border-emerald-200 rounded-xl overflow-hidden bg-stone-50 shadow-sm">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={previewUrl} alt={`New Variant Image ${idx + 1}`} className="w-full h-full object-cover" />
                                  {vImages.length === 0 && idx === 0 && (
                                    <span className="absolute top-1 left-1 bg-[#E0A99E] text-white text-[8px] font-black uppercase px-1 rounded leading-tight">
                                      Primary
                                    </span>
                                  )}
                                  <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-[8px] font-black uppercase px-1 rounded leading-tight">
                                    New
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveNewFile(idx)}
                                    className="absolute inset-0 bg-rose-500/85 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-1">
                        <button type="button" onClick={() => { setShowVariantForm(false); resetVariantForm(); }}
                          className="rounded-full border border-stone-200 px-5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 uppercase tracking-wider cursor-pointer">
                          Cancel
                        </button>
                        <button type="submit" disabled={vSaving}
                          className="rounded-full bg-emerald-500 px-7 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-all shadow-md uppercase tracking-wider disabled:opacity-60 cursor-pointer">
                          {vSaving ? "Saving…" : editingVariantId ? "Update Variant" : "Add Variant"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button type="button"
                      onClick={() => { resetVariantForm(); setShowVariantForm(true); }}
                      className="w-full rounded-2xl border-2 border-dashed border-emerald-200 py-3 text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer">
                      + Add Variant
                    </button>
                  )}

                  {variantModalError && (
                    <p className="text-xs font-semibold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                      ⚠️ {variantModalError}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-stone-100 px-8 py-4 flex items-center justify-between">
              <p className="text-[10px] text-stone-400 font-light">
                {variants.length} variant{variants.length !== 1 ? "s" : ""} &middot; Total stock:{" "}
                {variants.reduce((s, v) => s + (v.isActive ? v.quantity : 0), 0)} units
              </p>
              <button type="button" onClick={closeVariantModal}
                className="rounded-full border border-stone-200 px-6 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50 uppercase tracking-wider cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



