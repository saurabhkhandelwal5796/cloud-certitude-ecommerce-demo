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
  const [availableAttributes, setAvailableAttributes] = useState<Record<string, { id: string; value: string }[]>>({});
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
  const [fGstRate, setFGstRate] = useState("5");

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
    setFGstRate(variant.gstRate?.toString() || "5");
    setVImages([...variant.images]);

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
      
      const attrMap: Record<string, { id: string; value: string }[]> = {};
      for (const group of attributeGroups) {
        for (const attr of group.attributes) {
          const selectedValues = attr.values.filter((v: any) => valIds.includes(v.id));
          if (selectedValues.length > 0) {
            attrMap[attr.name] = selectedValues;
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
    setCSelectedAttrIds({});
    
    // Default form values for creation
    setFSku("");
    setFPrice("");
    setFDiscPrice("");
    setFDiscPercent("");
    setFQty("0");
    setFActive(true);
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

  const handleCreateProductChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    if (!pid) {
      setSelectedCreateProduct(null);
      setAvailableAttributes({});
      setCSelectedAttrIds({});
      return;
    }
    
    const product = availableProducts.find(p => p.id === pid);
    if (product) {
      setSelectedCreateProduct(product);
      setIsLoadingAttributes(true);
      try {
        const { getProductAttributes, getFullCatalog } = await import("@/services/AttributeService");
        const [valIds, attributeGroups] = await Promise.all([
          getProductAttributes(product.id),
          getFullCatalog()
        ]);
        
        const attrMap: Record<string, { id: string; value: string }[]> = {};
        for (const group of attributeGroups) {
          for (const attr of group.attributes) {
            const selectedValues = attr.values.filter((v: any) => valIds.includes(v.id));
            if (selectedValues.length > 0) {
              attrMap[attr.name] = selectedValues;
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
      
      const attrMap: Record<string, { id: string; value: string }[]> = {};
      for (const group of attributeGroups) {
        for (const attr of group.attributes) {
          const selectedValues = attr.values.filter((v: any) => valIds.includes(v.id));
          if (selectedValues.length > 0) {
            attrMap[attr.name] = selectedValues;
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
    generatedName = generateVariantName(selectedValues);

    // Validate calculated selling price instead of fDiscPrice since we're using percentage
    const discPriceToValidate = fDiscPrice.trim() !== "" ? fDiscPrice : "";
    const val = validateVariantFields(fPrice, fQty, discPriceToValidate, fSku, generatedName);
    if (!val.isValid) {
      return setFormError(val.error!);
    }

    const priceNum = parseFloat(fPrice);
    const qtyNum = parseInt(fQty, 10);
    const discPercentNum = fDiscPrice.trim() ? parseFloat(fDiscPrice) : 0;

    setIsSaving(true);
    try {
      let finalImages = [...vImages];

      // 1. Compute Signature
      const selectedValueIds = Object.values(cSelectedAttrIds).filter(Boolean) as string[];
      const { generateVariantSignature, createVariant, isSkuUnique } = await import("@/services/VariantService");
      const variantSignature = generateVariantSignature(selectedValueIds);

      // SKU Uniqueness Validation
      const isUnique = await isSkuUnique(fSku, isCreating ? undefined : selectedVariant!.id);
      if (!isUnique) {
        throw new Error(`SKU "${fSku.trim()}" already exists. Please enter a unique SKU.`);
      }

      // Duplicate Combination Validation
      const targetProductId = isCreating ? selectedCreateProduct!.id : selectedVariant!.product!.id;
      const { getProductVariants } = await import("@/services/VariantService");
      const existingVariants = await getProductVariants(targetProductId);
      
      const conflict = existingVariants.find((va) => {
        if (!isCreating && va.id === selectedVariant!.id) return false;
        return va.variantSignature === variantSignature;
      });

      if (conflict) {
        throw new Error(`A variant with this combination already exists (SKU: ${conflict.sku}). Each combination must be unique.`);
      }

      if (isCreating) {

        // Create Variant initially without new files (since we need its ID for storage)
        let savedVariant = await createVariant({
          productId: selectedCreateProduct!.id,
          sku: fSku.trim(),
          variantName: generatedName,
          price: priceNum,
          discountedPrice: discPercentNum > 0 && fDiscPrice.trim() ? parseFloat(fDiscPrice) : null,
          quantity: qtyNum,
          isActive: fActive,
          images: vImages, // keep existing images if duplicating
          variantSignature,
          gstRate: parseInt(fGstRate, 10) || 5
        });

        // Now upload files using the real variant ID
        if (vSelectedFiles.length > 0) {
          const { uploadVariantImages, updateVariant } = await import("@/services/VariantService");
          const uploadedUrls = await uploadVariantImages(selectedCreateProduct!.id, savedVariant.id, vSelectedFiles);
          const finalUploads = [...vImages, ...uploadedUrls];
          savedVariant = await updateVariant(savedVariant.id, { images: finalUploads });
          setVImages(finalUploads);
        }

        // Add optimistic insert
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
          gstRate: savedVariant.gstRate || parseInt(fGstRate, 10) || 5,
          createdAt: savedVariant.createdAt,
          updatedAt: savedVariant.updatedAt || new Date().toISOString(),
          isPrimary: prev.length === 0, // Auto-promoted on backend if first variant
          product: { id: selectedCreateProduct!.id, name: selectedCreateProduct!.name }
        }, ...prev]);
        setTotalVariants(prev => prev + 1);

        setSuccessMessage("Variant created successfully.");
        // We stay in modal to allow closing or creating more? Better just close or show success.
        setShowModal(false);
        resetForm();

      } else {
        if (!selectedVariant) throw new Error("Missing variant for update");
        const { getSupabaseClient } = await import("@/lib/supabase/client");
        const supabase = getSupabaseClient();
        const { data: currentData, error: fetchErr } = await supabase
          .from("product_variants")
          .select("updated_at")
          .eq("id", selectedVariant.id)
          .single();
          
        if (fetchErr) throw fetchErr;
        if (currentData.updated_at !== selectedVariant.updatedAt) {
          throw new Error("This variant was recently updated by another administrator. Please refresh the page to see the latest changes before saving.");
        }

        if (vSelectedFiles.length > 0) {
          const { uploadVariantImages } = await import("@/services/VariantService");
          const uploadedUrls = await uploadVariantImages(selectedVariant.product!.id, selectedVariant.id, vSelectedFiles);
          finalImages = [...finalImages, ...uploadedUrls];
        }

        // Check if anything actually changed
        const updatePayload: any = {};
        if (fSku.trim() !== selectedVariant.sku) updatePayload.sku = fSku.trim();
        if (priceNum !== selectedVariant.price) updatePayload.price = priceNum;
        
        const newDiscPrice = discPercentNum > 0 && fDiscPrice.trim() ? parseFloat(fDiscPrice) : null;
        if (newDiscPrice !== selectedVariant.discountedPrice) updatePayload.discountedPrice = newDiscPrice;
        
        if (qtyNum !== selectedVariant.quantity) updatePayload.quantity = qtyNum;
        if (fActive !== selectedVariant.isActive) updatePayload.isActive = fActive;
        const newGstRate = parseInt(fGstRate, 10) || 5;
        if (newGstRate !== selectedVariant.gstRate) updatePayload.gstRate = newGstRate;

        if (finalImages.length !== selectedVariant.images.length || !finalImages.every((img, i) => img === selectedVariant.images[i])) {
          updatePayload.images = finalImages;
        }

        if (generatedName !== selectedVariant.variantName) {
          updatePayload.variantName = generatedName;
        }
        
        if (variantSignature !== selectedVariant.variantSignature) {
          updatePayload.variantSignature = variantSignature;
        }

        // If nothing changed, we still proceed to update attributes just in case

        const { updateVariant } = await import("@/services/VariantService");
        let savedVariant = selectedVariant as any;
        if (Object.keys(updatePayload).length > 0) {
          savedVariant = await updateVariant(selectedVariant.id, updatePayload);
        } else {
          // If no fields changed but images did (updatePayload for images is set only if different, wait, finalImages is updated above)
          // Oh wait, if updatePayload is empty, savedVariant remains selectedVariant but with old images?
          // We already mutated finalImages. If updatePayload is empty, nothing changed. So we can just use selectedVariant.
        }
        
        const newVariant: AdminVariantListItem = {
          ...savedVariant,
          images: finalImages, // Ensure finalImages is always applied in case it was skipped in updatePayload but we want the UI updated if it was an empty upload? Actually if finalImages changed it would be in updatePayload.
          product: selectedVariant.product
        };
        
        // Synchronize ALL frontend state from the saved variant
        setVariants(prev => prev.map(v => v.id === newVariant.id ? newVariant : v));
        setSelectedVariant(newVariant);
        
        setFSku(newVariant.sku);
        setFPrice(newVariant.price.toString());
        setFQty(newVariant.quantity.toString());
        setFActive(newVariant.isActive);
        setFGstRate(newVariant.gstRate?.toString() || "5");
        setVImages([...newVariant.images]);
        
        if (newVariant.discountedPrice != null && newVariant.price > 0) {
          const diff = newVariant.price - newVariant.discountedPrice;
          const pct = Math.round((diff / newVariant.price) * 100);
          setFDiscPercent(pct.toString());
          setFDiscPrice(newVariant.discountedPrice.toString());
        } else {
          setFDiscPercent("");
          setFDiscPrice("");
        }

        // Update Attributes in DB
        const assignments: Array<{ attributeId: string; attributeValueId: string }> = Object.entries(cSelectedAttrIds)
          .filter(([, valueId]) => valueId)
          .map(([attrName, valueId]) => {
            const opt = availableAttributes[attrName]?.find((o) => o.id === valueId);
            return opt ? { attributeId: opt.id.split('_')[0] || "", attributeValueId: opt.id } : null; // wait, do we have attributeId in availableAttributes?
          })
          .filter((a): a is { attributeId: string; attributeValueId: string } => a !== null);
          
        // Let's use the safer approach to find attributeId
        const { setVariantAttributeValues } = await import("@/services/VariantService");
        
        const finalAssignments: Array<{ attributeId: string; attributeValueId: string }> = [];
        for (const [attrName, valueId] of Object.entries(cSelectedAttrIds)) {
          if (!valueId) continue;
          const { getFullCatalog } = await import("@/services/AttributeService");
          const groups = await getFullCatalog();
          for (const group of groups) {
            for (const attr of group.attributes) {
              if (attr.name === attrName) {
                finalAssignments.push({ attributeId: attr.id, attributeValueId: valueId });
              }
            }
          }
        }
        await setVariantAttributeValues(selectedVariant.id, finalAssignments);

        setSuccessMessage("Variant updated successfully.");
      }
      
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-stone-150 bg-stone-50/30">
            <div className="text-xs font-medium text-stone-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalVariants)} of {totalVariants}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && selectedVariant && (
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

            <form onSubmit={handleSaveVariant} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Editable Fields */}
                <div className="space-y-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 border-b border-stone-200 pb-2">Editable Details</h3>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">SKU *</label>
                    <input 
                      type="text" 
                      value={fSku} 
                      onChange={e => setFSku(e.target.value)}
                      required
                      disabled={isSaving}
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A99E] focus:border-transparent transition-all"
                    />
                  </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Price *</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={fPrice} 
                        onChange={e => {
                          const newPrice = e.target.value;
                          setFPrice(newPrice);
                          const p = parseFloat(newPrice);
                          const dp = parseFloat(fDiscPercent);
                          if (!isNaN(p) && p > 0 && !isNaN(dp) && dp > 0) {
                            setFDiscPrice(Number((p - (p * dp / 100)).toFixed(2)).toString());
                          }
                        }}
                        required
                        disabled={isSaving}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A99E] focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Discount (%)</label>
                        <input 
                          type="number" 
                          step="1"
                          min="0"
                          max="100"
                          value={fDiscPercent} 
                          onChange={e => {
                            const newPct = e.target.value;
                            setFDiscPercent(newPct);
                            const dp = parseFloat(newPct);
                            const p = parseFloat(fPrice);
                            if (!isNaN(p) && p > 0 && !isNaN(dp)) {
                              setFDiscPrice(Number((p - (p * dp / 100)).toFixed(2)).toString());
                            } else if (newPct === "") {
                              setFDiscPrice("");
                            }
                          }}
                          disabled={isSaving}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A99E] focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Discounted Price</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={fDiscPrice} 
                          onChange={e => {
                            const newDisc = e.target.value;
                            setFDiscPrice(newDisc);
                            const dp = parseFloat(newDisc);
                            const p = parseFloat(fPrice);
                            if (!isNaN(dp) && dp > 0 && !isNaN(p) && p > 0 && dp <= p) {
                              setFDiscPercent(Math.round(((p - dp) / p) * 100).toString());
                            } else if (newDisc === "") {
                              setFDiscPercent("");
                            }
                          }}
                          disabled={isSaving}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A99E] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Stock Quantity *</label>
                      <input 
                        type="number" 
                        value={fQty} 
                        onChange={e => setFQty(e.target.value)}
                        required
                        disabled={isSaving}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A99E] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">GST Rate *</label>
                      <select
                        value={fGstRate}
                        onChange={e => setFGstRate(e.target.value)}
                        disabled={isSaving}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A99E] focus:border-transparent transition-all"
                      >
                        {["0", "5", "12", "18", "28"].map(rate => (
                          <option key={rate} value={rate}>{rate}%</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl border border-stone-200 bg-white">
                        <input 
                          type="checkbox" 
                          checked={fActive}
                          onChange={e => setFActive(e.target.checked)}
                          disabled={isSaving}
                          className="w-4 h-4 text-[#E0A99E] rounded focus:ring-[#E0A99E]"
                        />
                        <span className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Active</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Read-Only Info / Create Selections & Images */}
                <div className="space-y-6">
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 border-b border-stone-200 pb-2">Product & Attributes</h3>
                    
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Product *</label>
                      {isCreating && !selectedVariant ? (
                        <>
                          <select
                            value={selectedCreateProduct?.id || ""}
                            onChange={handleCreateProductChange}
                            disabled={isSaving}
                            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A99E] focus:border-transparent transition-all disabled:opacity-50"
                          >
                            <option value="">-- Choose a product --</option>
                            {availableProducts.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          {availableProducts.length === 0 && (
                            <p className="text-[10px] text-stone-500 mt-1 italic">No products with attributes assigned.</p>
                          )}
                        </>
                      ) : (
                        <div className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800">
                          {selectedCreateProduct?.name || selectedVariant?.product?.name || "N/A"}
                        </div>
                      )}
                    </div>

                    {(selectedCreateProduct || selectedVariant) && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Select Attributes *</label>
                        {isLoadingAttributes ? (
                          <div className="text-sm text-stone-500">Loading attributes...</div>
                        ) : Object.keys(availableAttributes).length > 0 ? (
                          <div className="space-y-3">
                            {Object.entries(availableAttributes).map(([attrName, options]) => (
                              <div key={attrName}>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">{attrName}</label>
                                <select
                                  value={cSelectedAttrIds[attrName] || ""}
                                  onChange={(e) => setCSelectedAttrIds(prev => ({ ...prev, [attrName]: e.target.value }))}
                                  required
                                  disabled={isSaving}
                                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A99E]"
                                >
                                  <option value="">-- Select {attrName} --</option>
                                  {options.map(o => (
                                    <option key={o.id} value={o.id}>{o.value}</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-stone-500 italic">No attributes assigned to this product.</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 border-b border-stone-200 pb-2 flex items-center justify-between">
                      <span>Images ({vImages.length + vSelectedFiles.length}/{MAX_VARIANT_IMAGES})</span>
                      {(vImages.length + vSelectedFiles.length) < MAX_VARIANT_IMAGES && (
                        <label className="cursor-pointer text-xs text-[#E0A99E] hover:text-[#C68B7D] font-bold tracking-wider uppercase">
                          + Add Image
                          <input 
                            type="file" 
                            accept={ALLOWED_MIME_TYPES.join(",")}
                            multiple 
                            className="hidden" 
                            onChange={handleFileChange}
                            disabled={isSaving}
                          />
                        </label>
                      )}
                    </h3>
                    
                    {vFileError && (
                      <p className="text-xs text-rose-500 font-medium">{vFileError}</p>
                    )}

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                      {/* Existing Images */}
                      {vImages.map((imgUrl, idx) => (
                        <div key={`exist-${idx}`} className="group relative aspect-[3/4] bg-stone-50 rounded-xl overflow-hidden border border-stone-200">
                          <Image src={imgUrl} alt="Variant image" fill className="object-cover" />
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleRemoveExistingImage(idx)}
                            className="absolute top-1 right-1 w-6 h-6 bg-white/90 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold shadow-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {/* New Files Pending Upload */}
                      {vFilePreviews.map((previewUrl, idx) => (
                        <div key={`new-${idx}`} className="group relative aspect-[3/4] bg-emerald-50 rounded-xl overflow-hidden border border-emerald-200">
                          <Image src={previewUrl} alt="New variant image" fill className="object-cover opacity-80" />
                          <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-white/80">New</span>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleRemoveNewFile(idx)}
                            className="absolute top-1 right-1 w-6 h-6 bg-white/90 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold shadow-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-stone-200">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-stone-200 text-sm font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#E0A99E] hover:bg-[#D4988D] text-white text-sm font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
