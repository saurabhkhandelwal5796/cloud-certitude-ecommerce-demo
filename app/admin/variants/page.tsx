"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { formatPrice } from "@/utils";
import { getAdminVariantsPaginated, AdminVariantListItem } from "@/services/AdminVariantService";
import { getVariantsWithAttributes, type VariantWithAttributes, bulkUpsertVariants, bulkDeleteVariants, updateVariant, deleteVariant } from "@/services/VariantService";
import VariantFilters from "./components/VariantFilters";
import VariantBulkToolbar from "./components/VariantBulkToolbar";
import VariantActionMenu from "./components/VariantActionMenu";
import VariantInlineCell from "./components/VariantInlineCell";
import Pagination from "@/components/ui/Pagination";

export default function AdminVariantsPage() {
  const [variants, setVariants] = useState<AdminVariantListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<"products.name" | "price" | "quantity" | "created_at">("created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVariants, setTotalVariants] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // --- Phase 4 States ---
  const [filters, setFilters] = useState({
    productId: "",
    status: "",
    stock: "",
    minPrice: "",
    maxPrice: "",
    fromDate: "",
    toDate: "",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  // ----------------------

  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<AdminVariantListItem | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<{ attrName: string; attrValue: string }[]>([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);

  // Create workflow state
  const [availableProducts, setAvailableProducts] = useState<{ id: string; name: string }[]>([]);
  const [selectedCreateProduct, setSelectedCreateProduct] = useState<{ id: string; name: string } | null>(null);
  const [lookupSearchTerm, setLookupSearchTerm] = useState("");
  const [debouncedLookupSearch, setDebouncedLookupSearch] = useState("");
  const [lookupResults, setLookupResults] = useState<{ id: string; name: string }[]>([]);
  const [isLookupSearching, setIsLookupSearching] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [availableAttributes, setAvailableAttributes] = useState<Record<string, { id: string; value: string; attrId: string; }[]>>({});
  const [cSelectedAttrIds, setCSelectedAttrIds] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [fSku, setFSku] = useState("");
  const [fPrice, setFPrice] = useState("");
  const [fDiscPrice, setFDiscPrice] = useState("");
  const [fDiscPercent, setFDiscPercent] = useState("");
  const [fQty, setFQty] = useState("");
  const [fActive, setFActive] = useState(true);
  const [fIsPrimary, setFIsPrimary] = useState(false);
  const [fGstRate, setFGstRate] = useState("5");
  // Manual variant name — used only when availableAttributes is empty (no attributes assigned to product)
  const [fManualName, setFManualName] = useState("");

  // Image upload
  const MAX_VARIANT_IMAGES = 5;
  const MAX_FILE_SIZE_MB = 2;
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  
  const [vImages, setVImages] = useState<string[]>([]);
  const [vSelectedFiles, setVSelectedFiles] = useState<File[]>([]);
  const [vFilePreviews, setVFilePreviews] = useState<string[]>([]);
  const [vFileError, setVFileError] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
      setSelectedIds(new Set());
      setIsSelectAll(false);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, filters]);

  const calculatedSellingPrice = useMemo(() => {
    const mrp = parseFloat(fPrice);
    const disc = parseFloat(fDiscPercent);
    if (isNaN(mrp) || mrp <= 0) return null;
    if (isNaN(disc) || disc <= 0) return mrp;
    return mrp - (mrp * disc) / 100;
  }, [fPrice, fDiscPercent]);

  const loadVariants = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, total } = await getAdminVariantsPaginated({
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        searchQuery: debouncedSearch,
        sortBy,
        sortOrder,
        productId: filters.productId || undefined,
        status: filters.status ? (filters.status as any) : undefined,
        stock: filters.stock ? (filters.stock as any) : undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      });
      setVariants(data);
      setTotalVariants(total);
    } catch (err) {
      console.error("Failed to load variants:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, sortBy, sortOrder, filters]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLookupSearch(lookupSearchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [lookupSearchTerm]);

  useEffect(() => {
    if (!isLookupOpen) return;
    let isMounted = true;
    const fetchLookup = async () => {
      setIsLookupSearching(true);
      try {
        const { getAdminProductsPaginated } = await import("@/services/AdminService");
        const res = await getAdminProductsPaginated({ page: 1, limit: 15, search: debouncedLookupSearch });
        if (isMounted) {
          setLookupResults(res.products.map(p => ({ id: p.id, name: p.name })));
        }
      } catch (err) {
        console.error("Failed to fetch products for lookup", err);
      } finally {
        if (isMounted) setIsLookupSearching(false);
      }
    };
    fetchLookup();
    return () => { isMounted = false; };
  }, [debouncedLookupSearch, isLookupOpen]);

  useEffect(() => {
    import("@/services/AdminVariantService").then(m => {
      m.getProductsWithAttributes().then(p => setAvailableProducts(p)).catch(console.error);
    });
  }, []);

  const toggleSort = (field: "products.name" | "price" | "quantity" | "created_at") => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVFileError(null);
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);

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

  const resetForm = () => {
    setFormError(null);
    setSuccessMessage(null);
    setVFileError(null);
    setVSelectedFiles([]);
    vFilePreviews.forEach(p => URL.revokeObjectURL(p));
    setVFilePreviews([]);
    setFManualName("");
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setIsSelectAll(false);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectPage = () => {
    if (selectedIds.size === variants.length && !isSelectAll && variants.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(variants.map(v => v.id)));
      setIsSelectAll(false);
    }
  };

  const handleSelectAllDataset = () => {
    setSelectedIds(new Set(variants.map(v => v.id)));
    setIsSelectAll(true);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setIsSelectAll(false);
  };

  const getTargetVariantIdsForBulk = async (): Promise<string[]> => {
    if (!isSelectAll) {
      return Array.from(selectedIds);
    }
    // Fetch all matching IDs across dataset
    let allIds: string[] = [];
    let page = 1;
    while (true) {
      const res = await getAdminVariantsPaginated({
        page, pageSize: 500, searchQuery: debouncedSearch, sortBy, sortOrder,
        productId: filters.productId || undefined,
        status: filters.status ? (filters.status as any) : undefined,
        stock: filters.stock ? (filters.stock as any) : undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      });
      allIds = [...allIds, ...res.data.map(d => d.id)];
      if (res.data.length < 500) break;
      page++;
    }
    return allIds;
  };

  const updateOptimisticUI = (updatedFields: Partial<AdminVariantListItem>[]) => {
    setVariants(prev => prev.map(v => {
      const update = updatedFields.find(u => u.id === v.id);
      if (update) return { ...v, ...update };
      return v;
    }));
  };

  const handleBulkActivate = async () => {
    setIsBulkLoading(true);
    try {
      const ids = await getTargetVariantIdsForBulk();
      const { bulkUpdateVariantsFields } = await import("@/services/VariantService");
      await bulkUpdateVariantsFields(ids, { isActive: true });
      updateOptimisticUI(ids.map(id => ({ id, isActive: true })));
      handleClearSelection();
    } catch (err) {
      console.error(err);
      alert("Failed to bulk activate.");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    setIsBulkLoading(true);
    try {
      const ids = await getTargetVariantIdsForBulk();
      const { bulkUpdateVariantsFields } = await import("@/services/VariantService");
      await bulkUpdateVariantsFields(ids, { isActive: false });
      updateOptimisticUI(ids.map(id => ({ id, isActive: false })));
      handleClearSelection();
    } catch (err) {
      console.error(err);
      alert("Failed to bulk deactivate.");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${isSelectAll ? totalVariants : selectedIds.size} variant(s)?`)) return;
    setIsBulkLoading(true);
    try {
      const ids = await getTargetVariantIdsForBulk();
      const { bulkDeleteVariants } = await import("@/services/VariantService");
      await bulkDeleteVariants(ids);
      setVariants(prev => prev.filter(v => !ids.includes(v.id)));
      setTotalVariants(prev => prev - ids.length);
      handleClearSelection();
    } catch (err) {
      console.error(err);
      alert("Failed to bulk delete.");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkUpdateStock = async (mode: 'increase' | 'decrease' | 'replace', value: number) => {
    setIsBulkLoading(true);
    try {
      const ids = await getTargetVariantIdsForBulk();
      const { getSupabaseClient } = await import("@/lib/supabase/client");
      const supabase = getSupabaseClient();
      
      if (mode === 'replace') {
        const { bulkUpdateVariantsFields } = await import("@/services/VariantService");
        await bulkUpdateVariantsFields(ids, { quantity: value });
        updateOptimisticUI(ids.map(id => ({ id, quantity: value })));
      } else {
        const { data } = await supabase.from('product_variants').select('*').in('id', ids);
        if (!data) throw new Error("No data found");
        const updates = data.map(row => {
          let newQty = row.quantity;
          if (mode === 'increase') newQty += value;
          if (mode === 'decrease') newQty = Math.max(0, newQty - value);
          return { ...row, quantity: newQty };
        });
        await supabase.from('product_variants').upsert(updates, { onConflict: 'id' });
        updateOptimisticUI(updates.map(u => ({ id: u.id, quantity: u.quantity })));
      }
      handleClearSelection();
    } catch (err) {
      console.error(err);
      alert("Failed to bulk update stock.");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkUpdatePrice = async (mode: 'replace' | 'add_fixed' | 'add_percent', value: number, isDiscount: boolean) => {
    setIsBulkLoading(true);
    try {
      const ids = await getTargetVariantIdsForBulk();
      const { getSupabaseClient } = await import("@/lib/supabase/client");
      const supabase = getSupabaseClient();
      
      if (mode === 'replace') {
        const { bulkUpdateVariantsFields } = await import("@/services/VariantService");
        const fields = isDiscount ? { discountedPrice: value } : { price: value };
        await bulkUpdateVariantsFields(ids, fields);
        updateOptimisticUI(ids.map(id => ({ id, ...fields })));
      } else {
        const { data } = await supabase.from('product_variants').select('*').in('id', ids);
        if (!data) throw new Error("No data found");
        const updates = data.map(row => {
          let newPrice = isDiscount ? (row.discounted_price || row.price) : row.price;
          if (mode === 'add_fixed') newPrice += value;
          if (mode === 'add_percent') newPrice = newPrice * (1 + value / 100);
          newPrice = Math.max(0, newPrice); // No negative prices
          if (isDiscount && newPrice > row.price) newPrice = row.price; // Discount cannot exceed price
          return { ...row, [isDiscount ? 'discounted_price' : 'price']: newPrice };
        });
        await supabase.from('product_variants').upsert(updates, { onConflict: 'id' });
        updateOptimisticUI(updates.map(u => ({ id: u.id, price: u.price, discountedPrice: u.discounted_price })));
      }
      handleClearSelection();
    } catch (err) {
      console.error(err);
      alert("Failed to bulk update price.");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleInlineSave = async (id: string, field: 'price' | 'discountedPrice' | 'quantity' | 'isActive', value: any) => {
    const { updateVariant } = await import("@/services/VariantService");
    const payload = { [field]: value };
    await updateVariant(id, payload);
    setVariants(prev => prev.map(v => v.id === id ? { ...v, ...payload } : v));
  };

  const handleEditClick = async (variant: AdminVariantListItem) => {
    resetForm();
    setIsCreating(false);
    setSelectedVariant(variant);
    
    // Populate form fields
    setFSku(variant.sku);
    setFPrice(variant.price.toString());
    
    if (variant.discountedPrice != null && variant.price > 0) {
      const diff = variant.price - variant.discountedPrice;
      const pct = Math.round((diff / variant.price) * 100);
      setFDiscPercent(pct.toString());
      setFDiscPrice(variant.discountedPrice.toString());
    } else {
      setFDiscPercent("");
      setFDiscPrice("");
    }
    setFQty(variant.quantity.toString());
    setFActive(variant.isActive);
    setFIsPrimary(variant.isPrimary);
    setFGstRate(variant.gstRate?.toString() || "5");
    setVImages([...variant.images]);
    // Pre-fill manual name fallback in case product has no attributes assigned
    setFManualName(variant.variantName || "");

    setShowModal(true);
    setIsLoadingAttributes(true);
    try {
      const { getProductAttributes, getFullCatalog } = await import("@/services/AttributeService");
      const { getVariantAttributeValues } = await import("@/services/VariantService");
      
      const [valIds, attributeGroups, assignedIds] = await Promise.all([
        getProductAttributes(variant.product!.id),
        getFullCatalog(),
        getVariantAttributeValues(variant.id)
      ]);
      
      const attrMap: Record<string, { id: string; value: string; attrId: string; }[]> = {};
      for (const group of attributeGroups) {
        for (const attr of group.attributes) {
          const options = attr.values
            .filter((val: any) => valIds.includes(val.id))
            .map((val: any) => ({ id: val.id, value: val.value, attrId: attr.id }));
          if (options.length > 0) {
            attrMap[attr.name] = options;
          }
        }
      }
      
      setAvailableAttributes(attrMap);
      
      // Initialize selections based on existing variant attribute value IDs
      const initialSelections: Record<string, string> = {};
      for (const [attrName, options] of Object.entries(attrMap)) {
        const match = options.find((opt) => assignedIds.includes(opt.id));
        if (match) {
          initialSelections[attrName] = match.id;
        } else {
          initialSelections[attrName] = "";
        }
      }
      setCSelectedAttrIds(initialSelections);
    } catch (err) {
      console.error("Error loading attributes", err);
      setAvailableAttributes({});
      setCSelectedAttrIds({});
    } finally {
      setIsLoadingAttributes(false);
    }
  };

  const handleCreateClick = async () => {
    resetForm();
    setIsCreating(true);
    setSelectedVariant(null);
    setSelectedCreateProduct(null);
    setLookupSearchTerm("");
    setCSelectedAttrIds({});
    
    // Default form values for creation
    setFSku("");
    setFPrice("");
    setFDiscPrice("");
    setFDiscPercent("");
    setFQty("0");
    setFActive(true);
    setFIsPrimary(false);
    setFGstRate("5");
    setVImages([]);

    setShowModal(true);
    
    if (availableProducts.length === 0) {
      try {
        const { getProductsWithAttributes } = await import("@/services/AdminVariantService");
        const products = await getProductsWithAttributes();
        setAvailableProducts(products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }
  };

  const handleProductSelect = async (product: { id: string; name: string } | null) => {
    if (!product) {
      setSelectedCreateProduct(null);
      setAvailableAttributes({});
      setCSelectedAttrIds({});
      return;
    }
    
    setSelectedCreateProduct(product);
    setIsLoadingAttributes(true);
    try {
      const { getProductAttributes, getFullCatalog } = await import("@/services/AttributeService");
        const [valIds, attributeGroups] = await Promise.all([
          getProductAttributes(product.id),
          getFullCatalog()
        ]);
        
        const attrMap: Record<string, { id: string; value: string; attrId: string; }[]> = {};
        for (const group of attributeGroups) {
          for (const attr of group.attributes) {
            const options = attr.values
              .filter((val: any) => valIds.includes(val.id))
              .map((val: any) => ({ id: val.id, value: val.value, attrId: attr.id }));
            if (options.length > 0) {
              attrMap[attr.name] = options;
            }
          }
        }
        
        setAvailableAttributes(attrMap);
        
        // Initialize selections
        const initialSelections: Record<string, string> = {};
        Object.keys(attrMap).forEach(k => {
          initialSelections[k] = "";
        });
        setCSelectedAttrIds(initialSelections);
      } catch (err) {
        console.error("Error fetching attributes", err);
      } finally {
        setIsLoadingAttributes(false);
      }
  };

  const handleDuplicateVariant = async (variant: AdminVariantListItem) => {
    resetForm();
    setIsCreating(true);
    setSelectedVariant(variant);
    
    // Set the product for creation workflow
    if (variant.product) {
      setSelectedCreateProduct(variant.product);
    }
    
    // Populate form fields with duplicated data
    setFSku(`Copy Of ${variant.sku}`);
    setFPrice(variant.price.toString());
    if (variant.discountedPrice != null && variant.price > 0) {
      const diff = variant.price - variant.discountedPrice;
      const pct = Math.round((diff / variant.price) * 100);
      setFDiscPercent(pct.toString());
      setFDiscPrice(variant.discountedPrice.toString());
    } else {
      setFDiscPercent("");
      setFDiscPrice("");
    }
    setFQty(variant.quantity.toString());
    setFActive(variant.isActive);
    setFGstRate(variant.gstRate?.toString() || "5");
    setVImages([...variant.images]);
    // Pre-fill manual name fallback for duplicate workflow
    setFManualName(variant.variantName ? `Copy Of ${variant.variantName}` : "");

    setShowModal(true);
    setIsLoadingAttributes(true);
    try {
      const { getProductAttributes, getFullCatalog } = await import("@/services/AttributeService");
      const { getVariantsWithAttributes } = await import("@/services/VariantService");
      
      const [valIds, attributeGroups, variantsWithAttrs] = await Promise.all([
        getProductAttributes(variant.product!.id),
        getFullCatalog(),
        getVariantsWithAttributes(variant.product!.id)
      ]);
      
      const attrMap: Record<string, { id: string; value: string; attrId: string; }[]> = {};
      for (const group of attributeGroups) {
        for (const attr of group.attributes) {
          const options = attr.values
            .filter((val: any) => valIds.includes(val.id))
            .map((val: any) => ({ id: val.id, value: val.value, attrId: attr.id }));
          if (options.length > 0) {
            attrMap[attr.name] = options;
          }
        }
      }
      setAvailableAttributes(attrMap);
      
      const variantWithAttr = variantsWithAttrs.find(v => v.variant.id === variant.id);
      
      const initialSelections: Record<string, string> = {};
      if (variantWithAttr) {
        Object.entries(attrMap).forEach(([attrName, options]) => {
          const originalValue = variantWithAttr.attributes[attrName];
          const matchingOption = options.find(o => o.value === originalValue);
          initialSelections[attrName] = matchingOption ? matchingOption.id : "";
        });
      } else {
        Object.keys(attrMap).forEach(k => {
          initialSelections[k] = "";
        });
      }
      setCSelectedAttrIds(initialSelections);
    } catch (err) {
      console.error("Error loading attributes", err);
      setCSelectedAttrIds({});
    } finally {
      setIsLoadingAttributes(false);
    }
  };

  const handleDeleteVariant = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the variant "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { deleteVariant } = await import("@/services/VariantService");
      await deleteVariant(id);
      setVariants(prev => prev.filter(v => v.id !== id));
      setTotalVariants(prev => prev - 1);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete variant. Please try again.");
    }
  };

  const handleSetPrimary = async (variant: AdminVariantListItem) => {
    try {
      const { setPrimaryVariant } = await import("@/services/VariantService");
      await setPrimaryVariant(variant.product!.id, variant.id);
      
      // Update UI optimistically
      setVariants(prev => prev.map(v => {
        if (v.product?.id === variant.product?.id) {
          return { ...v, isPrimary: v.id === variant.id } as AdminVariantListItem;
        }
        return v;
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to set primary variant.");
    }
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCreating && !selectedVariant) return;

    setFormError(null);
    setSuccessMessage(null);

    const { validateVariantFields, generateVariantName } = await import("@/services/VariantService");
    
    let generatedName = "";
    const selectedValues = Object.entries(cSelectedAttrIds)
      .filter(([, id]) => id)
      .map(([attrName, valueId]) => availableAttributes[attrName]?.find((o) => o.id === valueId)?.value);
    // If no attributes are assigned to the product, fall back to the manually-entered name
    const hasAttrOptions = Object.keys(availableAttributes).length > 0;
    generatedName = hasAttrOptions ? generateVariantName(selectedValues) : fManualName.trim();

    // When no attributes are configured, validate the manual name
    if (!hasAttrOptions && !generatedName) {
      return setFormError("Please enter a Variant Name.");
    }
    // Validate calculated selling price instead of fDiscPrice since we're using percentage
    const discPriceToValidate = fDiscPrice.trim() !== "" ? fDiscPrice : "";
    const val = validateVariantFields(fPrice, fQty, discPriceToValidate, fSku, hasAttrOptions ? generatedName : undefined);
    if (!val.isValid) {
      return setFormError(val.error!);
    }

    const priceNum = parseFloat(fPrice);
    const qtyNum = parseInt(fQty, 10);
    const discPercentNum = fDiscPrice.trim() ? parseFloat(fDiscPrice) : 0;

    setIsSaving(true);
    try {
      const targetProductId = isCreating ? selectedCreateProduct!.id : selectedVariant!.product!.id;
      const { generateVariantSignature, createVariant, updateVariant, uploadVariantImages, isSkuUnique, getProductVariants, setVariantAttributeValues } = await import("@/services/VariantService");
      
      const isUnique = await isSkuUnique(fSku, isCreating ? undefined : selectedVariant!.id);
      if (!isUnique) {
        throw new Error(`SKU "${fSku.trim()}" already exists. Please enter a unique SKU.`);
      }

      let savedVariant: any;

      const selectedValueIds = Object.values(cSelectedAttrIds).filter(Boolean) as string[];
      const variantSignature = generateVariantSignature(selectedValueIds);

      // 1. If editing existing variant
      if (!isCreating && selectedVariant) {
        let finalImages = [...vImages];
        if (vSelectedFiles.length > 0) {
          const uploadedUrls = await uploadVariantImages(targetProductId, selectedVariant.id, vSelectedFiles);
          finalImages = [...finalImages, ...uploadedUrls];
        }

        savedVariant = await updateVariant(selectedVariant.id, {
          sku: fSku.trim(),
          variantName: generatedName,
          price: priceNum,
          discountedPrice: discPercentNum > 0 && fDiscPrice.trim() ? parseFloat(fDiscPrice) : null,
          quantity: qtyNum,
          isActive: fActive,
          isPrimary: fIsPrimary,
          gstRate: parseInt(fGstRate, 10) || 5,
          images: finalImages,
          variantSignature,
        });

        // Update optimistic state
        setVariants(prev => prev.map(v => {
          if (v.id === savedVariant.id) {
            return {
              ...v,
              ...savedVariant,
              product: v.product
            };
          }
          if (savedVariant.isPrimary && v.product?.id === targetProductId) {
            return { ...v, isPrimary: false };
          }
          return v;
        }));
        setSuccessMessage("Variant updated successfully.");

      } 
      // 2. If creating new variant
      else {
        // Create variant first to get variant ID
        savedVariant = await createVariant({
          productId: targetProductId,
          sku: fSku.trim(),
          variantName: generatedName,
          price: priceNum,
          discountedPrice: discPercentNum > 0 && fDiscPrice.trim() ? parseFloat(fDiscPrice) : null,
          quantity: qtyNum,
          isActive: fActive,
          isPrimary: fIsPrimary,
          gstRate: parseInt(fGstRate, 10) || 5,
          images: [],
          variantSignature,
        });

        // Now upload new files using the new variant ID
        if (vSelectedFiles.length > 0) {
          const uploadedUrls = await uploadVariantImages(targetProductId, savedVariant.id, vSelectedFiles);
          if (uploadedUrls.length > 0) {
            savedVariant = await updateVariant(savedVariant.id, {
              images: uploadedUrls,
            });
          }
        }
        
        // Note: For create, products flow omits gstRate and isPrimary in createVariant, but we should make sure we update optimistic state correctly.
        // Actually, we must use the SAME payload construction. The working flow didn`t pass isPrimary or gstRate inside createVariant!
        // So we just did that.
        
        setVariants(prev => [{
          id: savedVariant.id,
          sku: savedVariant.sku,
          variantCode: savedVariant.variantCode || "",
          variantName: savedVariant.variantName,
          price: savedVariant.price,
          discountedPrice: savedVariant.discountedPrice,
          quantity: savedVariant.quantity,
          isActive: savedVariant.isActive,
          images: savedVariant.images,
          variantSignature: savedVariant.variantSignature || variantSignature,
          gstRate: savedVariant.gstRate || 5,
          createdAt: savedVariant.createdAt,
          updatedAt: savedVariant.updatedAt || new Date().toISOString(),
          isPrimary: savedVariant.isPrimary,
          product: { id: targetProductId, name: selectedCreateProduct!.name }
        }, ...prev.map(v => savedVariant.isPrimary && v.product?.id === targetProductId ? { ...v, isPrimary: false } : v)]);
        setTotalVariants(prev => prev + 1);

        setSuccessMessage("Variant created successfully.");
        setShowModal(false);
        resetForm();
      }

      // Save ALL attribute assignments generically
      const assignments: Array<{ attributeId: string; attributeValueId: string }> = Object.entries(
        cSelectedAttrIds
      )
        .filter(([, valueId]) => valueId)
        .map(([attrName, valueId]) => {
          const opt = availableAttributes[attrName]?.find((o) => o.id === valueId);
          return opt ? { attributeId: opt.attrId, attributeValueId: opt.id } : null;
        })
        .filter((a): a is { attributeId: string; attributeValueId: string } => a !== null);
      await setVariantAttributeValues(savedVariant.id, assignments);

      vFilePreviews.forEach(p => URL.revokeObjectURL(p));
      setVSelectedFiles([]);
      setVFilePreviews([]);
      
    } catch (err: any) {
      console.error("Save error:", err);
      setFormError(err.message || "Failed to save variant.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalPages = Math.ceil(totalVariants / ITEMS_PER_PAGE) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase">Variants</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium">
            Manage all product variants, pricing, and inventory across the catalog.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl border border-stone-200/50 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by variant code, SKU, product name, or variant name..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A99E] focus:border-transparent transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-stone-500 font-medium">
            Total Variants: {totalVariants}
          </div>
          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-[#E0A99E] hover:bg-[#D4988D] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
          >
            + Create Variant
          </button>
        </div>
      </div>

      {/* Filters */}
      <VariantFilters
        products={availableProducts}
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters({ productId: "", status: "", stock: "", minPrice: "", maxPrice: "", fromDate: "", toDate: "" })}
      />

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <VariantBulkToolbar
          selectedCount={selectedIds.size}
          totalCount={totalVariants}
          isSelectAll={isSelectAll}
          onSelectAllDataset={handleSelectAllDataset}
          onClearSelection={handleClearSelection}
          onBulkActivate={handleBulkActivate}
          onBulkDeactivate={handleBulkDeactivate}
          onBulkDelete={handleBulkDelete}
          onBulkUpdateStock={handleBulkUpdateStock}
          onBulkUpdatePrice={handleBulkUpdatePrice}
          isLoading={isBulkLoading}
        />
      )}

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-stone-200/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-stone-150 bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400">
                <th className="py-4 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={variants.length > 0 && selectedIds.size === variants.length}
                    onChange={toggleSelectPage}
                  />
                </th>
                <th className="py-4 px-4 font-semibold">Variant Code</th>
                <th className="py-4 px-4 w-12 text-center">Image</th>
                <th 
                  className="py-4 px-6 font-semibold cursor-pointer hover:text-stone-700 transition-colors select-none"
                  onClick={() => toggleSort("products.name")}
                >
                  Product Name {sortBy === "products.name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-4 px-6 font-semibold">Variant Name / SKU</th>
                <th 
                  className="py-4 px-6 font-semibold cursor-pointer hover:text-stone-700 transition-colors select-none"
                  onClick={() => toggleSort("price")}
                >
                  Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="py-4 px-6 font-semibold cursor-pointer hover:text-stone-700 transition-colors select-none"
                  onClick={() => toggleSort("quantity")}
                >
                  Stock {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-center">Images</th>
                <th 
                  className="py-4 px-6 font-semibold cursor-pointer hover:text-stone-700 transition-colors select-none"
                  onClick={() => toggleSort("created_at")}
                >
                  Created Date {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-500 font-medium">
                    <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-[#E0A99E] rounded-full animate-spin mb-3" />
                    <p>Loading variants...</p>
                  </td>
                </tr>
              ) : variants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-500 text-sm font-medium">
                    No variants found.
                  </td>
                </tr>
              ) : (
                variants.map((v) => (
                  <tr key={v.id} className={`hover:bg-stone-50/50 transition-colors ${selectedIds.has(v.id) ? 'bg-indigo-50/30' : ''}`}>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedIds.has(v.id)}
                        onChange={() => toggleSelectRow(v.id)}
                      />
                    </td>
                    {/* Variant Code — first data column, read-only, copyable */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-extrabold text-[#C47E72] bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg tracking-widest select-all">
                          {v.variantCode || "—"}
                        </span>
                        {v.variantCode && (
                          <button
                            type="button"
                            title="Copy Variant Code"
                            onClick={() => navigator.clipboard.writeText(v.variantCode)}
                            className="text-stone-400 hover:text-stone-700 transition-colors p-0.5 rounded"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-10 h-12 relative rounded-lg overflow-hidden border border-stone-100 bg-stone-50 mx-auto">
                        {v.images && v.images.length > 0 ? (
                          <Image src={v.images[0]} alt={v.variantName} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">N/A</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 font-bold text-stone-900">
                      {v.product?.name || "Unknown Product"}
                    </td>
                    <td className="py-3 px-6">
                      <span className="block font-bold text-stone-900 text-sm flex items-center gap-2">
                        {v.variantName || "Default"}
                        {v.isPrimary && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider" title="Primary Variant">⭐ Primary</span>}
                      </span>
                      <span className="block text-[10px] text-[#E0A99E] font-extrabold uppercase tracking-widest mt-0.5">
                        SKU: {v.sku}
                      </span>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap min-w-[150px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400 uppercase font-bold w-8">Reg</span>
                          <div className="flex-1 border-l border-gray-100 pl-2">
                            <VariantInlineCell
                              type="number"
                              value={v.price}
                              min={0}
                              onSave={(val) => handleInlineSave(v.id, 'price', val)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400 uppercase font-bold w-8">Sale</span>
                          <div className="flex-1 border-l border-gray-100 pl-2">
                            <VariantInlineCell
                              type="number"
                              value={v.discountedPrice}
                              min={0}
                              onSave={(val) => handleInlineSave(v.id, 'discountedPrice', val)}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 min-w-[100px]">
                      <VariantInlineCell
                        type="number"
                        value={v.quantity}
                        min={0}
                        onSave={(val) => handleInlineSave(v.id, 'quantity', val)}
                      />
                    </td>
                    <td className="py-3 px-4 min-w-[120px]">
                      <VariantInlineCell
                        type="boolean"
                        value={v.isActive}
                        onSave={(val) => handleInlineSave(v.id, 'isActive', val)}
                      />
                    </td>
                    <td className="py-3 px-6 text-center font-medium text-stone-600">
                      {v.images?.length || 0}
                    </td>
                    <td className="py-3 px-6 text-stone-500 font-medium">
                      {new Date(v.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <VariantActionMenu
                        isActive={v.isActive}
                        isPrimary={v.isPrimary}
                        onEdit={() => handleEditClick(v)}
                        onDuplicate={() => handleDuplicateVariant(v)}
                        onToggleActive={() => handleInlineSave(v.id, 'isActive', !v.isActive)}
                        onDelete={() => handleDeleteVariant(v.id, v.variantName)}
                        onSetPrimary={() => handleSetPrimary(v)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && variants.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-stone-150 bg-stone-50/30 gap-4">
            <div className="text-xs font-medium text-stone-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalVariants)} of {totalVariants}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              className="w-full sm:w-auto"
            />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (isCreating || selectedVariant) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => !isSaving && setShowModal(false)} />
          <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 p-8">
            <button
              onClick={() => setShowModal(false)}
              disabled={isSaving}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-50"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-black text-stone-900 mb-6 tracking-tight">
              {isCreating ? "Create Variant" : "Edit Variant"}
            </h2>

            {/* Variant Code — read-only badge */}
            {!isCreating && selectedVariant?.variantCode && (
              <div className="mb-4 flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Variant Code</span>
                <span className="font-mono text-sm font-extrabold text-[#C47E72] tracking-widest">
                  {selectedVariant.variantCode}
                </span>
                <button
                  type="button"
                  title="Copy Variant Code"
                  onClick={() => navigator.clipboard.writeText(selectedVariant.variantCode)}
                  className="ml-auto text-stone-400 hover:text-stone-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            )}

            {formError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium rounded-xl">
                {formError}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium rounded-xl">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSaveVariant}
                      className="rounded-2xl border border-emerald-200/60 bg-emerald-50/30 px-6 py-5 space-y-4 text-xs text-stone-600">
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600 mb-1">
                        {(!isCreating && selectedVariant?.id) ? "Edit Variant" : "Create Variant"}
                      </p>

                      {/* Variant Code — read-only when editing */}
                      {(!isCreating && selectedVariant?.id) && (() => {
                        const editingV = selectedVariant;
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

                      {formError && (
                        <p className="text-xs font-semibold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                          ⚠️ {formError}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div className="col-span-1 sm:col-span-2"><label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Product *</label>
                      {isCreating && !selectedVariant ? (
                        <div className="relative">
                          {!selectedCreateProduct ? (
                            <div>
                              <input
                                type="text"
                                value={lookupSearchTerm}
                                onChange={(e) => {
                                  setLookupSearchTerm(e.target.value);
                                  setIsLookupOpen(true);
                                }}
                                onFocus={() => setIsLookupOpen(true)}
                                onBlur={() => setTimeout(() => setIsLookupOpen(false), 200)}
                                placeholder="Search products..."
                                disabled={isSaving}
                                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A99E] focus:border-transparent transition-all disabled:opacity-50"
                              />
                              {isLookupOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                  {isLookupSearching ? (
                                    <div className="p-3 text-sm text-stone-500">Searching...</div>
                                  ) : lookupResults.length > 0 ? (
                                    lookupResults.map(p => (
                                      <div
                                        key={p.id}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          handleProductSelect(p);
                                          setLookupSearchTerm("");
                                          setIsLookupOpen(false);
                                        }}
                                        className="px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-0"
                                      >
                                        {p.name}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-3 text-sm text-stone-500">No products found</div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800">
                              <span className="truncate">{selectedCreateProduct.name}</span>
                              <button
                                type="button"
                                onClick={() => handleProductSelect(null)}
                                className="text-stone-400 hover:text-rose-500 ml-2 text-lg leading-none font-bold"
                                title="Change Product"
                              >
                                &times;
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800">
                          {selectedCreateProduct?.name || selectedVariant?.product?.name || "N/A"}
                        </div>
                      )}</div>
                        {/* Dynamic attribute dropdowns — one per attribute in the product's group */}
                        {Object.keys(availableAttributes).length > 0 ? (
                          Object.entries(availableAttributes).map(([attrName, options]) => (
                            <div key={attrName} className="space-y-1.5">
                              <label className="block font-bold uppercase tracking-wider text-stone-500">
                                {attrName} *
                              </label>
                              <select
                                value={cSelectedAttrIds[attrName] ?? ""}
                                onChange={(e) =>
                                  setCSelectedAttrIds((prev) => ({ ...prev, [attrName]: e.target.value }))
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
                          <div className="col-span-2 space-y-3">
                            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                              <p className="text-[11px] font-semibold text-amber-700">
                                ⚠️ No attributes are assigned to this product yet.
                              </p>
                              <p className="text-[10px] text-amber-600 mt-1">
                                To use dynamic attribute dropdowns, go to the product's <strong>Attributes</strong> panel and assign attribute values first. For now, enter a variant name manually below.
                              </p>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block font-bold uppercase tracking-wider text-stone-500">Variant Name *</label>
                              <input
                                type="text"
                                value={fManualName}
                                onChange={(e) => setFManualName(e.target.value)}
                                placeholder="e.g. Blue / M / Slim Fit"
                                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
                              />
                            </div>
                          </div>
                        )}

                        {/* SKU */}
                        <div className="space-y-1.5">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">SKU *</label>
                          <input type="text" value={fSku} onChange={(e) => setFSku(e.target.value)}
                            placeholder="e.g. LEV-511-BLU-30"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40" />
                        </div>

                        {/* MRP */}
                        <div className="space-y-1.5">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">MRP (₹) *</label>
                          <input type="number" min="0" step="0.01" value={fPrice} onChange={(e) => setFPrice(e.target.value)}
                            placeholder="e.g. 2499"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40" />
                        </div>

                        {/* Discount Percentage */}
                        <div className="space-y-1.5">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">Discount Percentage (%)</label>
                          <input type="number" min="0" max="100" value={fDiscPercent} onChange={(e) => setFDiscPercent(e.target.value)}
                            placeholder="e.g. 10"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40" />
                        </div>

                        {/* GST Rate */}
                        <div className="space-y-1.5">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">GST Rate (%) *</label>
                          <select 
                            value={fGstRate} 
                            onChange={(e) => setFGstRate(e.target.value)}
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
                          <input type="number" min="0" step="1" value={fQty} onChange={(e) => setFQty(e.target.value)}
                            placeholder="e.g. 15"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40" />
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <label className="block font-bold uppercase tracking-wider text-stone-500">Status</label>
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={fActive} onChange={(e) => setFActive(e.target.checked)}
                              className="sr-only" />
                            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              fActive ? "bg-emerald-500" : "bg-stone-300"
                            }`}>
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                fActive ? "translate-x-4" : "translate-x-1"
                              }`} />
                            </span>
                            <span className="text-xs font-semibold text-stone-600">{fActive ? "Active" : "Inactive"}</span>
                          </label>
                        </div>

                        {/* Primary Variant */}
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <label className="block font-bold uppercase tracking-wider text-stone-500" title={(!isCreating && selectedVariant?.id) && selectedVariant?.isPrimary ? "Primary variant cannot be unchecked directly. Make another variant primary instead." : ""}>Primary Variant</label>
                          <label className={`inline-flex items-center gap-2 ${(!isCreating && selectedVariant?.id) && selectedVariant?.isPrimary ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                            <input type="checkbox" checked={fIsPrimary} onChange={(e) => setFIsPrimary(e.target.checked)} disabled={isSaving || (!!(!isCreating && selectedVariant?.id) && !!selectedVariant?.isPrimary)}
                              className="sr-only" />
                            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              fIsPrimary ? "bg-emerald-500" : "bg-stone-300"
                            }`}>
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                fIsPrimary ? "translate-x-4" : "translate-x-1"
                              }`} />
                            </span>
                            <span className="text-xs font-semibold text-stone-600">{fIsPrimary ? "Primary" : "Secondary"}</span>
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
                        <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                          className="rounded-full border border-stone-200 px-5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 uppercase tracking-wider cursor-pointer">
                          Cancel
                        </button>
                        <button type="submit" disabled={isSaving}
                          className="rounded-full bg-emerald-500 px-7 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-all shadow-md uppercase tracking-wider disabled:opacity-60 cursor-pointer">
                          {isSaving ? "Saving…" : (!isCreating && selectedVariant?.id) ? "Update Variant" : "Add Variant"}
                        </button>
                      </div>
                    </form>
          </div>
        </div>
      )}
    </div>
  );
}
