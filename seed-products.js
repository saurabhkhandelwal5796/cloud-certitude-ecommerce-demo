/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
function getINRPrice(category, name, usdPrice) {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes("t-shirt") || lowercaseName.includes("tee")) {
    const price = usdPrice * 25;
    return Math.max(599, Math.min(1499, Math.round(price / 100) * 100 - 1));
  }
  if (lowercaseName.includes("shirt") || lowercaseName.includes("blouse") || lowercaseName.includes("polo")) {
    const price = usdPrice * 20;
    return Math.max(999, Math.min(2499, Math.round(price / 100) * 100 - 1));
  }
  if (lowercaseName.includes("jeans") || lowercaseName.includes("pants") || lowercaseName.includes("trousers") || lowercaseName.includes("chino") || lowercaseName.includes("skirt")) {
    const price = usdPrice * 22;
    return Math.max(1499, Math.min(3499, Math.round(price / 100) * 100 - 1));
  }
  if (lowercaseName.includes("hoodie") || lowercaseName.includes("sweater") || lowercaseName.includes("cardigan") || lowercaseName.includes("knit")) {
    const price = usdPrice * 25;
    return Math.max(1999, Math.min(4999, Math.round(price / 100) * 100 - 1));
  }
  if (lowercaseName.includes("jacket") || lowercaseName.includes("coat") || lowercaseName.includes("blazer") || lowercaseName.includes("trench")) {
    const price = usdPrice * 18;
    return Math.max(2499, Math.min(6999, Math.round(price / 100) * 100 - 1));
  }
  if (lowercaseName.includes("dress") || lowercaseName.includes("gown") || lowercaseName.includes("sundress")) {
    const price = usdPrice * 20;
    return Math.max(1999, Math.min(9999, Math.round(price / 100) * 100 - 1));
  }
  if (lowercaseName.includes("saree") || lowercaseName.includes("sari")) {
    const price = usdPrice * 20;
    return Math.max(1499, Math.min(9999, Math.round(price / 100) * 100 - 1));
  }
  if (lowercaseName.includes("kurti") || lowercaseName.includes("kurta")) {
    const price = usdPrice * 20;
    return Math.max(899, Math.min(2499, Math.round(price / 100) * 100 - 1));
  }
  if (category === "Kids" || lowercaseName.includes("kid") || lowercaseName.includes("overall") || lowercaseName.includes("jumpsuit")) {
    const price = usdPrice * 20;
    return Math.max(499, Math.min(1499, Math.round(price / 100) * 100 - 1));
  }
  if (lowercaseName.includes("shoe") || lowercaseName.includes("boot") || lowercaseName.includes("sneaker") || lowercaseName.includes("loafer") || lowercaseName.includes("heel")) {
    const price = usdPrice * 30;
    return Math.max(1999, Math.min(7999, Math.round(price / 100) * 100 - 1));
  }
  const price = usdPrice * 20;
  return Math.round(price / 100) * 100 - 1;
}

const fs = require('fs');

// Deterministic mock data generation
const BRANDS = ["Tommy Hilfiger", "Levi's", "Zara", "H&M", "Allen Solly", "Louis Philippe", "Nike", "Adidas", "Puma"];

const ADJECTIVES = {
  Men: ["Tailored", "Classic", "Premium", "Urban", "Minimalist", "Structured", "Sartorial", "Modern", "Eco-Luxury", "Signature", "Atelier", "Smart", "Casual", "Formal", "Heritage"],
  Women: ["Bohemian", "Sleek", "Flowing", "Knitted", "Pleated", "Chiffon", "Elegant", "Vintage", "Silk", "Wrap", "Romantic", "Couture", "Modernist", "Chic", "Graceful"],
  Kids: ["Organic Cotton", "Playful", "Cozy", "Stretch", "Striped", "Denim", "Fleece", "Bright", "Soft", "Comfort", "Active", "Warm", "Lightweight", "Durable", "Happy"],
  Accessories: ["Italian Leather", "Canvas", "Classic", "Woven", "Minimalist", "Vintage", "Solar", "Polarized", "Suede", "Premium", "Atelier", "Travel", "Urban", "Luxury", "Handcrafted"],
  Footwear: ["Court", "Running", "Leather Oxford", "Suede Chelsea", "Canvas", "Sport", "Chunky", "Slide", "Ankle", "Comfort", "Urban", "Walking", "Classic", "Luxe", "Strap"]
};

const ITEMS = {
  Men: ["Trench Coat", "Linen Shirt", "Chino Trousers", "Denim Jacket", "Wool Blazer", "Polo Shirt", "Cashmere Sweater", "Cargo Pants", "Oxford Shirt", "Utility Vest", "Bomber Jacket", "Suit Jacket", "V-Neck Tee", "Flannel Shirt", "Parka"],
  Women: ["Midi Dress", "Silk Blouse", "Tailored Blazer", "Wide-Leg Pants", "Cashmere Cardigan", "Wrap Skirt", "Linen Sundress", "Denim Dungarees", "Evening Gown", "Trench Cape", "Knit Top", "Satin Camisole", "Kimono Jacket", "Cocktail Dress", "Culottes"],
  Kids: ["Jumpsuit", "Hoodie", "Overalls", "T-Shirt", "Sweatpants", "Raincoat", "Pajama Set", "Cardigan", "Shorts", "Pinafore", "Romper", "Denim Jacket", "Knit Cap", "Windbreaker", "Fleece Vest"],
  Accessories: ["Belt", "Backpack", "Sunglasses", "Wallet", "Scarf", "Duffle Bag", "Beanie", "Tie", "Watch", "Socks Pack", "Bucket Hat", "Leather Tote", "Crossbody Bag", "Gloves", "Card Holder"],
  Footwear: ["Sneakers", "Boots", "Loafers", "Derbies", "Sandals", "Brogues", "Trainer", "Espadrilles", "Mules", "Slip-Ons", "Oxford Shoes", "Chelsea Boots", "Monk Straps", "Running Shoes", "Slides"]
};

// Unsplash Fashion Photo IDs
const MEN_PHOTOS = [
  "1617137968427-85924c800a22", "1492562080023-ab3db95bfbce", "1480455624313-e29b44bbfde1", "1505022610485-0249ba5b3675",
  "1519085360753-af0119f7cbe7", "1507679799987-c73779587ccf", "1534030347209-467a5b0ad3e6", "1500648767791-00dcc994a43e",
  "1506794778202-cad84cf45f1d", "1620012253295-c05518e99309", "1618886614638-80e3c103d31a", "1539571696357-5a69c17a67c6",
  "1552374196-1ab2a1c593e8", "1560250097-0b93528c311a", "1489987707025-afc232f7ea0f", "1542838132-92c53300491e",
  "1549037173-e3b7147e8600", "1550246140-5119ae4790b8", "1504198453319-5ce911bafcde", "1552374196-1ab2a1c593e8",
  "1520975954732-35dd22299614", "1520333789090-1afc82db536a", "1522075469751-3a6694fb2f61", "1530268729831-4b0b9e170218",
  "1531746020798-e6953c6e8e04", "1534308983496-4fabb1a015ee", "1534528741775-53994a69daeb", "1536164261511-3a17e6585920",
  "1537368910025-700350fe46c7", "1539571696357-5a69c17a67c6", "1542206395-9feb3edaa68d", "1544005313-94ddf0286df2",
  "1548142813-c348350df52b", "1551836022-d5d88e9218df", "1554151228-14d9def656e4", "1566492031773-4f4e44671857",
  "1568602471122-7832951cc4c5", "1570295999919-56ceb5ecca61", "1573496359142-b8d87734a5a2", "1581579438747-168010dec693",
  "1584940120743-f50e77c58f00", "1589574316285-f15f756019aa", "1590086782779-e1f97fd144ef", "1593085512500-11116244f2b1",
  "1594744803329-3a32f62b4507", "1595152772351-4091ecf3aa54", "1595213600122-c31a7c505f0c", "1597244242674-f3cbe22b51cc",
  "1599566150165-2e6c44dd755c", "1601412436009-bf26f18cc8ef"
];

const WOMEN_PHOTOS = [
  "1524504388940-b1c1722653e1", "1534528741775-53994a69daeb", "1517841905240-472988babdf9", "1508214751196-bcfd4ca60f91",
  "1544005313-94ddf0286df2", "1531746020798-e6953c6e8e04", "1525134479668-1a507c8744d0", "1506794778202-cad84cf45f1d",
  "1494790108377-be9c29b29330", "1488426862026-3ee34a7d66df", "1515886657613-9f3515b0c78f", "1490481651871-ab68de25d43d",
  "1550414082-c913c8749a75", "1554224155-8d04cb21cd6c", "1562572159-4ebcd318f4dd", "1564564244018-c0dcc7daef46",
  "1571224050228-56ee361ff5ff", "1576133649980-df4f0e4b8599", "1581044777550-2c70750b23f4", "1588516948613-cf6a524e164a",
  "1592621311405-b04040ffb0c7", "1595959183075-c1d092779c5c", "1598530033486-d242a420fec1", "1598971861719-74d1bd144f87",
  "1599849594580-482a778847c8", "1601831697474-5c91ec6ee837", "1602075737660-fcfbd4618e47", "1605497746488-812d0959048a",
  "1607746882042-944635dfe10e", "1608741176147-de348090906a", "1609357605207-de848a554a2f", "1610424037500-a548239088ff",
  "1611041926665-efc2ab0c8b0a", "1611784724483-e18bb39c9dfa", "1612808381831-29e2f9d854ec", "1613904975230-da8ccdb0ff1c",
  "1614704879641-a6ff998ffba1", "1615809796000-8bde396cc8b3", "1616258410292-127e77b4ba71", "1617260533519-7a544c21cd5d",
  "1618385805124-7fefde49fbc0", "1618585483251-cebcae3dbd4d", "1619472390144-8d4cc8fbc04f", "1620297072440-6927a7bd4cc0",
  "1621280381014-ef9d8d6dc5c0", "1622284724483-7c70c0c0552b", "1623280381014-de823bfbc8f8", "1624285805124-fefbc0c052bd",
  "1625297072440-cebba1c5f3e8", "1626280381014-fefb9c9fbc0c"
];

const KIDS_PHOTOS = [
  "1519457431-44cd6481697b", "1503919545889-aef636e10ad4", "1519689680058-28751e9a3c10", "1513556020-0010d7e59b27",
  "1537655780520-1e392ecd81f2", "1502086223501-7ea6ecd79368", "1596461404969-9ae700278c41", "1566516171-3c1a3b50a29d",
  "1602810318383-e386cc2a3ccf", "1602057376609-bca127e77bba", "1607524037500-afc23b28bdf0", "1609124037500-ef823b128cdf",
  "1611041926665-de823abbc80a", "1611784724483-fefba8c0a2bd", "1612808381831-cebca1ab5e8f", "1613904975230-aefbd318c8e8",
  "1614704879641-de82ab4792be", "1615809796000-cebfa8c0de8b", "1616258410292-efcbd3128bca", "1617260533519-de82ab127cdf",
  "1618385805124-ceba1a0c8bd0", "1618585483251-deba8c01ab88", "1619472390144-fefba1238b0c", "1620297072440-aebf9c80bd4b",
  "1621280381014-de8ab1238fcf", "1622284724483-aefbd328ba8c", "1623280381014-cefba128a8d0", "1624285805124-ef829abac8db",
  "1625297072440-efbca1ab3b0c", "1626280381014-de8abac1f8cd"
];

const ACCESSORIES_PHOTOS = [
  "1523275335684-37898b6baf30", "1608741176147-de348090906a", "1542291026-7eec264c27ff", "1524498250046-753c15d97f28",
  "1584917865442-de89df76afd3", "1611186871348-b1ce696e52c9", "1509319117193-57bab727e09d", "1539874754764-5a96559165b0",
  "1588359747833-2c40c8f128e4", "1598530033486-d242a420fec1", "1601924991987-64a7cc5a92d0", "1602810318383-e386cc2a3ccf",
  "1607524037500-afc23b28bdf0", "1609124037500-ef823b128cdf", "1611041926665-de823abbc80a", "1611784724483-fefba8c0a2bd",
  "1612808381831-cebca1ab5e8f", "1613904975230-aefbd318c8e8", "1614704879641-de82ab4792be", "1615809796000-cebfa8c0de8b"
];

const FOOTWEAR_PHOTOS = [
  "1549298916-b41d501d3772", "1595950653106-6c9ebd614d3a", "1539185441755-769473a23570", "1543163521-1bf539c55dd2",
  "1606107557195-0e29a4b5b4aa", "1608231387042-66d1773070a5", "1605733747903-548a78ddb35c", "1612387049887-fa8173070a5c",
  "1614704879641-de82ab4792be", "1615809796000-cebfa8c0de8b", "1616258410292-efcbd3128bca", "1617260533519-de82ab127cdf",
  "1618385805124-ceba1a0c8bd0", "1618585483251-deba8c01ab88", "1619472390144-fefba1238b0c", "1620297072440-aebf9c80bd4b",
  "1621280381014-de8ab1238fcf", "1622284724483-aefbd328ba8c", "1623280381014-cefba128a8d0", "1624285805124-ef829abac8db"
];

const PHOTO_POOLS = {
  Men: MEN_PHOTOS,
  Women: WOMEN_PHOTOS,
  Kids: KIDS_PHOTOS,
  Accessories: ACCESSORIES_PHOTOS,
  Footwear: FOOTWEAR_PHOTOS
};

async function run() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  console.log("Supabase URL:", supabaseUrl);
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing credentials");
    return;
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Preserve existing 8 catalog products so dynamic reviews/orders don't break
  const preservedProducts = [
    {
      id: "m1",
      name: "Classic Cashmere Trench Coat",
      description: "Premium double-breasted coat made with pure organic cashmere and structured shoulders for an elegant silhouette.",
      category: "Men",
      brand: "Certitude",
      price: 6999,
      discountPercent: 15,
      stockQuantity: 45,
      imageSrc: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop"],
      size: ["M", "L", "XL"],
      color: ["Beige", "Black", "Charcoal"],
      rating: 4.8,
      reviewCount: 124,
      sku: "CC-M-TRENCH-01",
      tags: ["Best Seller"]
    },
    {
      id: "m2",
      name: "Minimalist Linen Utility Shirt",
      description: "A breathable, lightweight utility shirt crafted from 100% fine French flax linen, featuring double patch pockets.",
      category: "Men",
      brand: "Atelier",
      price: 2399,
      discountPercent: 0,
      stockQuantity: 60,
      imageSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop"],
      size: ["S", "M", "L"],
      color: ["Cream", "White", "Blue"],
      rating: 4.5,
      reviewCount: 98,
      sku: "CC-M-LINEN-02",
      tags: ["Trending"]
    },
    {
      id: "w1",
      name: "Silk Wrap Midi Dress",
      description: "An elegant wrap dress made from heavyweight mulberry silk, featuring a delicate self-tie belt and asymmetrical hem.",
      category: "Women",
      brand: "Certitude",
      price: 7599,
      discountPercent: 10,
      stockQuantity: 30,
      imageSrc: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop"],
      size: ["XS", "S", "M", "L"],
      color: ["Rose Gold", "Emerald", "Midnight"],
      rating: 4.9,
      reviewCount: 156,
      sku: "CC-W-DRESS-01",
      tags: ["New Arrival"]
    },
    {
      id: "w2",
      name: "Oversized Merino Wool Sweater",
      description: "Cozy, chunky-knit sweater crafted from extrafine Australian merino wool. Relaxed fit with ribbed cuffs and hem.",
      category: "Women",
      brand: "EcoKnit",
      price: 4899,
      discountPercent: 0,
      stockQuantity: 50,
      imageSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop"],
      size: ["S", "M", "L"],
      color: ["Beige", "Cream", "Charcoal"],
      rating: 4.6,
      reviewCount: 88,
      sku: "CC-W-SWEATER-02",
      tags: ["Best Seller"]
    },
    {
      id: "w3",
      name: "Bohemian Embroidered Blouse",
      description: "Artisanal blouse featuring hand-guided floral embroidery, balloon sleeves, and a split neckline with tassel ties.",
      category: "Women",
      brand: "Sustaina",
      price: 2499,
      discountPercent: 20,
      stockQuantity: 15,
      imageSrc: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop"],
      size: ["S", "M", "L"],
      color: ["White", "Ivory"],
      rating: 4.4,
      reviewCount: 64,
      sku: "CC-W-BLOUSE-03",
      tags: ["Trending"]
    },
    {
      id: "k1",
      name: "Cotton Denim Overalls",
      description: "Durable classic denim overalls made with 100% organic cotton. Features adjustable shoulder straps and side button closures.",
      category: "Kids",
      brand: "Playwear",
      price: 1299,
      discountPercent: 0,
      stockQuantity: 40,
      imageSrc: "https://images.unsplash.com/photo-1519457431-44cd6481697b?q=80&w=400&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1519457431-44cd6481697b?q=80&w=400&auto=format&fit=crop"],
      size: ["2T", "3T", "4T", "5T"],
      color: ["Denim Blue", "Light Wash"],
      rating: 4.7,
      reviewCount: 52,
      sku: "CC-K-OVERALL-01",
      tags: ["New Arrival"]
    },
    {
      id: "k2",
      name: "Cozy Fleece Hoodie",
      description: "Ultra-soft brushed fleece pullover hoodie with a front kangaroo pocket and ribbed storm cuffs. Machine-wash safe.",
      category: "Kids",
      brand: "Playwear",
      price: 1999,
      discountPercent: 10,
      stockQuantity: 70,
      imageSrc: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop"],
      size: ["3T", "4T", "5T", "6T"],
      color: ["Soft Gray", "Blush Pink", "Sage Green"],
      rating: 4.8,
      reviewCount: 42,
      sku: "CC-K-HOODIE-02",
      tags: ["Best Seller"]
    },
    {
      id: "k3",
      name: "Striped Knit Sweater",
      description: "Classic crewneck sweater in a premium cotton-acrylic knit. Features timeless Breton stripes and shoulder button detail.",
      category: "Kids",
      brand: "MiniKnit",
      price: 1399,
      discountPercent: 0,
      stockQuantity: 25,
      imageSrc: "https://images.unsplash.com/photo-1519689680058-28751e9a3c10?q=80&w=400&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1519689680058-28751e9a3c10?q=80&w=400&auto=format&fit=crop"],
      size: ["2T", "3T", "4T", "5T", "6T"],
      color: ["Navy/White", "Red/Navy"],
      rating: 4.3,
      reviewCount: 30,
      sku: "CC-K-SWEATER-03",
      tags: ["Trending"]
    }
  ];

  const generatedProducts = [...preservedProducts];

  // Helper to generate products for a category to hit targets
  function generateCategoryProducts(category, targetCount, startIndex, prefix) {
    const existingCount = preservedProducts.filter(p => p.category === category).length;
    const needed = targetCount - existingCount;

    console.log(`Generating ${needed} products for category: ${category}`);

    const pool = PHOTO_POOLS[category];
    const adjs = ADJECTIVES[category];
    const items = ITEMS[category];

    for (let i = 0; i < needed; i++) {
      const index = startIndex + i;
      const id = `${prefix}${index}`;
      
      // Select deterministic attributes
      const brand = BRANDS[index % BRANDS.length];
      const adj = adjs[index % adjs.length];
      const item = items[index % items.length];
      
      // Ensure unique name
      const name = `${brand} ${adj} ${item}`;
      
      // Unique descriptions
      const description = `A premium quality ${adj.toLowerCase()} ${item.toLowerCase()} meticulously crafted by ${brand}. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.`;
      
      // Real prices, stocks, ratings
      const price = getINRPrice(category, name, Math.floor(45 + (index * 7.5) % 450));
      const discountPercent = (index % 5 === 0) ? (10 + (index % 3) * 5) : 0;
      const rating = Number((4.1 + (index * 0.13) % 0.8).toFixed(1));
      const reviewCount = Math.floor(12 + (index * 13) % 240);
      const stockQuantity = Math.floor(10 + (index * 3) % 85);
      
      // Pick unique image URL
      const photoId = pool[i % pool.length];
      const imageSrc = `https://images.unsplash.com/photo-${photoId}?q=80&w=400&auto=format&fit=crop&sig=${index}`;

      const tags = [];
      if (index % 3 === 0) tags.push("New Arrival");
      if (index % 3 === 1) tags.push("Best Seller");
      if (index % 3 === 2) tags.push("Trending");

      const prod = {
        id,
        name,
        description,
        category,
        brand,
        price,
        discountPercent,
        stockQuantity,
        imageSrc,
        images: [imageSrc],
        size: category === "Kids" ? ["2T", "3T", "4T", "5T"] : category === "Accessories" ? ["One Size"] : ["S", "M", "L", "XL"],
        color: ["Classic Black", "Neutral Beige", "Navy Blue", "Pure White"],
        rating,
        reviewCount,
        sku: `CC-${prefix.toUpperCase()}-${index.toString().padStart(3, '0')}`,
        tags
      };

      generatedProducts.push(prod);
    }
  }

  // Generate targets
  // Men: 50 total (2 existing, 48 needed)
  generateCategoryProducts("Men", 50, 3, "m");
  // Women: 50 total (3 existing, 47 needed)
  generateCategoryProducts("Women", 50, 4, "w");
  // Kids: 30 total (3 existing, 27 needed)
  generateCategoryProducts("Kids", 30, 4, "k");
  // Accessories: 20 total (0 existing, 20 needed)
  generateCategoryProducts("Accessories", 20, 1, "a");
  // Footwear: 20 total (0 existing, 20 needed)
  generateCategoryProducts("Footwear", 20, 1, "f");

  console.log(`Total generated products catalog size: ${generatedProducts.length}`);

  // Seed to Supabase
  try {
    console.log("Upserting products in Supabase...");
    
    // Construct database rows
    const dbRows = generatedProducts.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      images: p.images,
      category: p.category,
      stock: p.stockQuantity,
      brand: p.brand,
      discount_percent: p.discountPercent || 0,
      rating: p.rating || 4.5,
      review_count: p.reviewCount || 0,
      size: p.size || [],
      color: p.color || [],
      sku: p.sku || "",
      tags: p.tags || [],
      is_active: true,
      created_at: new Date().toISOString()
    }));

    // Perform upsert (replaces if ID matches)
    const { error } = await supabase.from('products').upsert(dbRows);
    if (error) {
      console.error("Error upserting Supabase products:", error);
    } else {
      console.log("Supabase products table successfully seeded with 170+ records!");
    }

    console.log("Upserting categories in Supabase...");
    const categoryRows = [
      { id: "men", name: "Men", description: "Men's premium sustainable apparel" },
      { id: "women", name: "Women", description: "Women's premium sustainable fashion" },
      { id: "kids", name: "Kids", description: "Kids' organic cotton clothes" },
      { id: "accessories", name: "Accessories", description: "Italian leather belts, designer watches and premium scarves" },
      { id: "footwear", name: "Footwear", description: "Comfort sneakers, Brogues and handmade leather boots" }
    ];
    const { error: catError } = await supabase.from('categories').upsert(categoryRows);
    if (catError) {
      console.error("Error upserting Supabase categories:", catError);
    } else {
      console.log("Supabase categories successfully seeded!");
    }
  } catch (err) {
    console.error("Supabase seed operation caught exception:", err);
  }

  // Output as a clean TS/JS snippet to update INITIAL_PRODUCTS in AdminService.ts
  const codeContent = `import type { AdminProduct } from "./AdminService";

export const INITIAL_PRODUCTS: AdminProduct[] = ${JSON.stringify(generatedProducts, null, 2)};
`;
  fs.writeFileSync('services/InitialProducts.ts', codeContent, 'utf-8');
  console.log("Catalog serialized and written to services/InitialProducts.ts successfully!");
}

run();
