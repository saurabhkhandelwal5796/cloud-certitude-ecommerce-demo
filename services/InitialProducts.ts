import type { AdminProduct } from "./AdminService";

export const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    "id": "m1",
    "name": "Classic Cashmere Trench Coat",
    "description": "Premium double-breasted coat made with pure organic cashmere and structured shoulders for an elegant silhouette.",
    "category": "Men",
    "brand": "Certitude",
    "price": 499,
    "discountPercent": 15,
    "stockQuantity": 45,
    "imageSrc": "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop",
    "images": [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop"
    ],
    "size": [
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Beige",
      "Black",
      "Charcoal"
    ],
    "rating": 4.8,
    "reviewCount": 124,
    "sku": "CC-M-TRENCH-01",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m2",
    "name": "Minimalist Linen Utility Shirt",
    "description": "A breathable, lightweight utility shirt crafted from 100% fine French flax linen, featuring double patch pockets.",
    "category": "Men",
    "brand": "Atelier",
    "price": 120,
    "discountPercent": 0,
    "stockQuantity": 60,
    "imageSrc": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop",
    "images": [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop"
    ],
    "size": [
      "S",
      "M",
      "L"
    ],
    "color": [
      "Cream",
      "White",
      "Blue"
    ],
    "rating": 4.5,
    "reviewCount": 98,
    "sku": "CC-M-LINEN-02",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w1",
    "name": "Silk Wrap Midi Dress",
    "description": "An elegant wrap dress made from heavyweight mulberry silk, featuring a delicate self-tie belt and asymmetrical hem.",
    "category": "Women",
    "brand": "Certitude",
    "price": 380,
    "discountPercent": 10,
    "stockQuantity": 30,
    "imageSrc": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop",
    "images": [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop"
    ],
    "size": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "color": [
      "Rose Gold",
      "Emerald",
      "Midnight"
    ],
    "rating": 4.9,
    "reviewCount": 156,
    "sku": "CC-W-DRESS-01",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w2",
    "name": "Oversized Merino Wool Sweater",
    "description": "Cozy, chunky-knit sweater crafted from extrafine Australian merino wool. Relaxed fit with ribbed cuffs and hem.",
    "category": "Women",
    "brand": "EcoKnit",
    "price": 195,
    "discountPercent": 0,
    "stockQuantity": 50,
    "imageSrc": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
    "images": [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop"
    ],
    "size": [
      "S",
      "M",
      "L"
    ],
    "color": [
      "Beige",
      "Cream",
      "Charcoal"
    ],
    "rating": 4.6,
    "reviewCount": 88,
    "sku": "CC-W-SWEATER-02",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w3",
    "name": "Bohemian Embroidered Blouse",
    "description": "Artisanal blouse featuring hand-guided floral embroidery, balloon sleeves, and a split neckline with tassel ties.",
    "category": "Women",
    "brand": "Sustaina",
    "price": 245,
    "discountPercent": 20,
    "stockQuantity": 15,
    "imageSrc": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop",
    "images": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop"
    ],
    "size": [
      "S",
      "M",
      "L"
    ],
    "color": [
      "White",
      "Ivory"
    ],
    "rating": 4.4,
    "reviewCount": 64,
    "sku": "CC-W-BLOUSE-03",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "k1",
    "name": "Cotton Denim Overalls",
    "description": "Durable classic denim overalls made with 100% organic cotton. Features adjustable shoulder straps and side button closures.",
    "category": "Kids",
    "brand": "Playwear",
    "price": 65,
    "discountPercent": 0,
    "stockQuantity": 40,
    "imageSrc": "https://images.unsplash.com/photo-1519457431-44cd6481697b?q=80&w=400&auto=format&fit=crop",
    "images": [
      "https://images.unsplash.com/photo-1519457431-44cd6481697b?q=80&w=400&auto=format&fit=crop"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Denim Blue",
      "Light Wash"
    ],
    "rating": 4.7,
    "reviewCount": 52,
    "sku": "CC-K-OVERALL-01",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "k2",
    "name": "Cozy Fleece Hoodie",
    "description": "Ultra-soft brushed fleece pullover hoodie with a front kangaroo pocket and ribbed storm cuffs. Machine-wash safe.",
    "category": "Kids",
    "brand": "Playwear",
    "price": 45,
    "discountPercent": 10,
    "stockQuantity": 70,
    "imageSrc": "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop",
    "images": [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop"
    ],
    "size": [
      "3T",
      "4T",
      "5T",
      "6T"
    ],
    "color": [
      "Soft Gray",
      "Blush Pink",
      "Sage Green"
    ],
    "rating": 4.8,
    "reviewCount": 42,
    "sku": "CC-K-HOODIE-02",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "k3",
    "name": "Striped Knit Sweater",
    "description": "Classic crewneck sweater in a premium cotton-acrylic knit. Features timeless Breton stripes and shoulder button detail.",
    "category": "Kids",
    "brand": "MiniKnit",
    "price": 55,
    "discountPercent": 0,
    "stockQuantity": 25,
    "imageSrc": "https://images.unsplash.com/photo-1519689680058-28751e9a3c10?q=80&w=400&auto=format&fit=crop",
    "images": [
      "https://images.unsplash.com/photo-1519689680058-28751e9a3c10?q=80&w=400&auto=format&fit=crop"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T",
      "6T"
    ],
    "color": [
      "Navy/White",
      "Red/Navy"
    ],
    "rating": 4.3,
    "reviewCount": 30,
    "sku": "CC-K-SWEATER-03",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m3",
    "name": "H&M Urban Denim Jacket",
    "description": "A premium quality urban denim jacket meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "H&M",
    "price": 67,
    "discountPercent": 0,
    "stockQuantity": 19,
    "imageSrc": "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=3",
    "images": [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=3"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 51,
    "sku": "CC-M-003",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m4",
    "name": "Allen Solly Minimalist Wool Blazer",
    "description": "A premium quality minimalist wool blazer meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Allen Solly",
    "price": 75,
    "discountPercent": 0,
    "stockQuantity": 22,
    "imageSrc": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=4",
    "images": [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=4"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 64,
    "sku": "CC-M-004",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m5",
    "name": "Louis Philippe Structured Polo Shirt",
    "description": "A premium quality structured polo shirt meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Louis Philippe",
    "price": 82,
    "discountPercent": 20,
    "stockQuantity": 25,
    "imageSrc": "https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=400&auto=format&fit=crop&sig=5",
    "images": [
      "https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=400&auto=format&fit=crop&sig=5"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 77,
    "sku": "CC-M-005",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m6",
    "name": "Nike Sartorial Cashmere Sweater",
    "description": "A premium quality sartorial cashmere sweater meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Nike",
    "price": 90,
    "discountPercent": 0,
    "stockQuantity": 28,
    "imageSrc": "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?q=80&w=400&auto=format&fit=crop&sig=6",
    "images": [
      "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?q=80&w=400&auto=format&fit=crop&sig=6"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 90,
    "sku": "CC-M-006",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m7",
    "name": "Adidas Modern Cargo Pants",
    "description": "A premium quality modern cargo pants meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Adidas",
    "price": 97,
    "discountPercent": 0,
    "stockQuantity": 31,
    "imageSrc": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=7",
    "images": [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=7"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 103,
    "sku": "CC-M-007",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m8",
    "name": "Puma Eco-Luxury Oxford Shirt",
    "description": "A premium quality eco-luxury oxford shirt meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Puma",
    "price": 105,
    "discountPercent": 0,
    "stockQuantity": 34,
    "imageSrc": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=8",
    "images": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=8"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 116,
    "sku": "CC-M-008",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m9",
    "name": "Tommy Hilfiger Signature Utility Vest",
    "description": "A premium quality signature utility vest meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Tommy Hilfiger",
    "price": 112,
    "discountPercent": 0,
    "stockQuantity": 37,
    "imageSrc": "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?q=80&w=400&auto=format&fit=crop&sig=9",
    "images": [
      "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?q=80&w=400&auto=format&fit=crop&sig=9"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 129,
    "sku": "CC-M-009",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m10",
    "name": "Levi's Atelier Bomber Jacket",
    "description": "A premium quality atelier bomber jacket meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Levi's",
    "price": 120,
    "discountPercent": 15,
    "stockQuantity": 40,
    "imageSrc": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=10",
    "images": [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=10"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 142,
    "sku": "CC-M-010",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m11",
    "name": "Zara Smart Suit Jacket",
    "description": "A premium quality smart suit jacket meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Zara",
    "price": 127,
    "discountPercent": 0,
    "stockQuantity": 43,
    "imageSrc": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop&sig=11",
    "images": [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop&sig=11"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 155,
    "sku": "CC-M-011",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m12",
    "name": "H&M Casual V-Neck Tee",
    "description": "A premium quality casual v-neck tee meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "H&M",
    "price": 135,
    "discountPercent": 0,
    "stockQuantity": 46,
    "imageSrc": "https://images.unsplash.com/photo-1620012253295-c05518e99309?q=80&w=400&auto=format&fit=crop&sig=12",
    "images": [
      "https://images.unsplash.com/photo-1620012253295-c05518e99309?q=80&w=400&auto=format&fit=crop&sig=12"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 168,
    "sku": "CC-M-012",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m13",
    "name": "Allen Solly Formal Flannel Shirt",
    "description": "A premium quality formal flannel shirt meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Allen Solly",
    "price": 142,
    "discountPercent": 0,
    "stockQuantity": 49,
    "imageSrc": "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?q=80&w=400&auto=format&fit=crop&sig=13",
    "images": [
      "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?q=80&w=400&auto=format&fit=crop&sig=13"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 181,
    "sku": "CC-M-013",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m14",
    "name": "Louis Philippe Heritage Parka",
    "description": "A premium quality heritage parka meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Louis Philippe",
    "price": 150,
    "discountPercent": 0,
    "stockQuantity": 52,
    "imageSrc": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=14",
    "images": [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=14"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 194,
    "sku": "CC-M-014",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m15",
    "name": "Nike Tailored Trench Coat",
    "description": "A premium quality tailored trench coat meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Nike",
    "price": 157,
    "discountPercent": 10,
    "stockQuantity": 55,
    "imageSrc": "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=400&auto=format&fit=crop&sig=15",
    "images": [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=400&auto=format&fit=crop&sig=15"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 207,
    "sku": "CC-M-015",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m16",
    "name": "Adidas Classic Linen Shirt",
    "description": "A premium quality classic linen shirt meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Adidas",
    "price": 165,
    "discountPercent": 0,
    "stockQuantity": 58,
    "imageSrc": "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop&sig=16",
    "images": [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop&sig=16"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 220,
    "sku": "CC-M-016",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m17",
    "name": "Puma Premium Chino Trousers",
    "description": "A premium quality premium chino trousers meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Puma",
    "price": 172,
    "discountPercent": 0,
    "stockQuantity": 61,
    "imageSrc": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=400&auto=format&fit=crop&sig=17",
    "images": [
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=400&auto=format&fit=crop&sig=17"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 233,
    "sku": "CC-M-017",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m18",
    "name": "Tommy Hilfiger Urban Denim Jacket",
    "description": "A premium quality urban denim jacket meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Tommy Hilfiger",
    "price": 180,
    "discountPercent": 0,
    "stockQuantity": 64,
    "imageSrc": "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop&sig=18",
    "images": [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop&sig=18"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 246,
    "sku": "CC-M-018",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m19",
    "name": "Levi's Minimalist Wool Blazer",
    "description": "A premium quality minimalist wool blazer meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Levi's",
    "price": 187,
    "discountPercent": 0,
    "stockQuantity": 67,
    "imageSrc": "https://images.unsplash.com/photo-1549037173-e3b7147e8600?q=80&w=400&auto=format&fit=crop&sig=19",
    "images": [
      "https://images.unsplash.com/photo-1549037173-e3b7147e8600?q=80&w=400&auto=format&fit=crop&sig=19"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 19,
    "sku": "CC-M-019",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m20",
    "name": "Zara Structured Polo Shirt",
    "description": "A premium quality structured polo shirt meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Zara",
    "price": 195,
    "discountPercent": 20,
    "stockQuantity": 70,
    "imageSrc": "https://images.unsplash.com/photo-1550246140-5119ae4790b8?q=80&w=400&auto=format&fit=crop&sig=20",
    "images": [
      "https://images.unsplash.com/photo-1550246140-5119ae4790b8?q=80&w=400&auto=format&fit=crop&sig=20"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 32,
    "sku": "CC-M-020",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m21",
    "name": "H&M Sartorial Cashmere Sweater",
    "description": "A premium quality sartorial cashmere sweater meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "H&M",
    "price": 202,
    "discountPercent": 0,
    "stockQuantity": 73,
    "imageSrc": "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=400&auto=format&fit=crop&sig=21",
    "images": [
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=400&auto=format&fit=crop&sig=21"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 45,
    "sku": "CC-M-021",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m22",
    "name": "Allen Solly Modern Cargo Pants",
    "description": "A premium quality modern cargo pants meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Allen Solly",
    "price": 210,
    "discountPercent": 0,
    "stockQuantity": 76,
    "imageSrc": "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=400&auto=format&fit=crop&sig=22",
    "images": [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=400&auto=format&fit=crop&sig=22"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 58,
    "sku": "CC-M-022",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m23",
    "name": "Louis Philippe Eco-Luxury Oxford Shirt",
    "description": "A premium quality eco-luxury oxford shirt meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Louis Philippe",
    "price": 217,
    "discountPercent": 0,
    "stockQuantity": 79,
    "imageSrc": "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=400&auto=format&fit=crop&sig=23",
    "images": [
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=400&auto=format&fit=crop&sig=23"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 71,
    "sku": "CC-M-023",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m24",
    "name": "Nike Signature Utility Vest",
    "description": "A premium quality signature utility vest meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Nike",
    "price": 225,
    "discountPercent": 0,
    "stockQuantity": 82,
    "imageSrc": "https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=400&auto=format&fit=crop&sig=24",
    "images": [
      "https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=400&auto=format&fit=crop&sig=24"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 84,
    "sku": "CC-M-024",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m25",
    "name": "Adidas Atelier Bomber Jacket",
    "description": "A premium quality atelier bomber jacket meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Adidas",
    "price": 232,
    "discountPercent": 15,
    "stockQuantity": 85,
    "imageSrc": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop&sig=25",
    "images": [
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop&sig=25"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.1,
    "reviewCount": 97,
    "sku": "CC-M-025",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m26",
    "name": "Puma Smart Suit Jacket",
    "description": "A premium quality smart suit jacket meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Puma",
    "price": 240,
    "discountPercent": 0,
    "stockQuantity": 88,
    "imageSrc": "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?q=80&w=400&auto=format&fit=crop&sig=26",
    "images": [
      "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?q=80&w=400&auto=format&fit=crop&sig=26"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 110,
    "sku": "CC-M-026",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m27",
    "name": "Tommy Hilfiger Casual V-Neck Tee",
    "description": "A premium quality casual v-neck tee meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Tommy Hilfiger",
    "price": 247,
    "discountPercent": 0,
    "stockQuantity": 91,
    "imageSrc": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop&sig=27",
    "images": [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop&sig=27"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 123,
    "sku": "CC-M-027",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m28",
    "name": "Levi's Formal Flannel Shirt",
    "description": "A premium quality formal flannel shirt meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Levi's",
    "price": 255,
    "discountPercent": 0,
    "stockQuantity": 94,
    "imageSrc": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=400&auto=format&fit=crop&sig=28",
    "images": [
      "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=400&auto=format&fit=crop&sig=28"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 136,
    "sku": "CC-M-028",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m29",
    "name": "Zara Heritage Parka",
    "description": "A premium quality heritage parka meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Zara",
    "price": 262,
    "discountPercent": 0,
    "stockQuantity": 12,
    "imageSrc": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop&sig=29",
    "images": [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop&sig=29"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 149,
    "sku": "CC-M-029",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m30",
    "name": "H&M Tailored Trench Coat",
    "description": "A premium quality tailored trench coat meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "H&M",
    "price": 270,
    "discountPercent": 10,
    "stockQuantity": 15,
    "imageSrc": "https://images.unsplash.com/photo-1536164261511-3a17e6585920?q=80&w=400&auto=format&fit=crop&sig=30",
    "images": [
      "https://images.unsplash.com/photo-1536164261511-3a17e6585920?q=80&w=400&auto=format&fit=crop&sig=30"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 162,
    "sku": "CC-M-030",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m31",
    "name": "Allen Solly Classic Linen Shirt",
    "description": "A premium quality classic linen shirt meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Allen Solly",
    "price": 277,
    "discountPercent": 0,
    "stockQuantity": 18,
    "imageSrc": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop&sig=31",
    "images": [
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop&sig=31"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.1,
    "reviewCount": 175,
    "sku": "CC-M-031",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m32",
    "name": "Louis Philippe Premium Chino Trousers",
    "description": "A premium quality premium chino trousers meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Louis Philippe",
    "price": 285,
    "discountPercent": 0,
    "stockQuantity": 21,
    "imageSrc": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=32",
    "images": [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=32"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 188,
    "sku": "CC-M-032",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m33",
    "name": "Nike Urban Denim Jacket",
    "description": "A premium quality urban denim jacket meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Nike",
    "price": 292,
    "discountPercent": 0,
    "stockQuantity": 24,
    "imageSrc": "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=400&auto=format&fit=crop&sig=33",
    "images": [
      "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=400&auto=format&fit=crop&sig=33"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 201,
    "sku": "CC-M-033",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m34",
    "name": "Adidas Minimalist Wool Blazer",
    "description": "A premium quality minimalist wool blazer meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Adidas",
    "price": 300,
    "discountPercent": 0,
    "stockQuantity": 27,
    "imageSrc": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop&sig=34",
    "images": [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop&sig=34"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 214,
    "sku": "CC-M-034",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m35",
    "name": "Puma Structured Polo Shirt",
    "description": "A premium quality structured polo shirt meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Puma",
    "price": 307,
    "discountPercent": 20,
    "stockQuantity": 30,
    "imageSrc": "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=400&auto=format&fit=crop&sig=35",
    "images": [
      "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=400&auto=format&fit=crop&sig=35"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 227,
    "sku": "CC-M-035",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m36",
    "name": "Tommy Hilfiger Sartorial Cashmere Sweater",
    "description": "A premium quality sartorial cashmere sweater meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Tommy Hilfiger",
    "price": 315,
    "discountPercent": 0,
    "stockQuantity": 33,
    "imageSrc": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=400&auto=format&fit=crop&sig=36",
    "images": [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=400&auto=format&fit=crop&sig=36"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 240,
    "sku": "CC-M-036",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m37",
    "name": "Levi's Modern Cargo Pants",
    "description": "A premium quality modern cargo pants meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Levi's",
    "price": 322,
    "discountPercent": 0,
    "stockQuantity": 36,
    "imageSrc": "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=400&auto=format&fit=crop&sig=37",
    "images": [
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=400&auto=format&fit=crop&sig=37"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.1,
    "reviewCount": 13,
    "sku": "CC-M-037",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m38",
    "name": "Zara Eco-Luxury Oxford Shirt",
    "description": "A premium quality eco-luxury oxford shirt meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Zara",
    "price": 330,
    "discountPercent": 0,
    "stockQuantity": 39,
    "imageSrc": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop&sig=38",
    "images": [
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop&sig=38"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 26,
    "sku": "CC-M-038",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m39",
    "name": "H&M Signature Utility Vest",
    "description": "A premium quality signature utility vest meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "H&M",
    "price": 337,
    "discountPercent": 0,
    "stockQuantity": 42,
    "imageSrc": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop&sig=39",
    "images": [
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop&sig=39"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 39,
    "sku": "CC-M-039",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m40",
    "name": "Allen Solly Atelier Bomber Jacket",
    "description": "A premium quality atelier bomber jacket meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Allen Solly",
    "price": 345,
    "discountPercent": 15,
    "stockQuantity": 45,
    "imageSrc": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop&sig=40",
    "images": [
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop&sig=40"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 52,
    "sku": "CC-M-040",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m41",
    "name": "Louis Philippe Smart Suit Jacket",
    "description": "A premium quality smart suit jacket meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Louis Philippe",
    "price": 352,
    "discountPercent": 0,
    "stockQuantity": 48,
    "imageSrc": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop&sig=41",
    "images": [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop&sig=41"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 65,
    "sku": "CC-M-041",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m42",
    "name": "Nike Casual V-Neck Tee",
    "description": "A premium quality casual v-neck tee meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Nike",
    "price": 360,
    "discountPercent": 0,
    "stockQuantity": 51,
    "imageSrc": "https://images.unsplash.com/photo-1581579438747-168010dec693?q=80&w=400&auto=format&fit=crop&sig=42",
    "images": [
      "https://images.unsplash.com/photo-1581579438747-168010dec693?q=80&w=400&auto=format&fit=crop&sig=42"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 78,
    "sku": "CC-M-042",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m43",
    "name": "Adidas Formal Flannel Shirt",
    "description": "A premium quality formal flannel shirt meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Adidas",
    "price": 367,
    "discountPercent": 0,
    "stockQuantity": 54,
    "imageSrc": "https://images.unsplash.com/photo-1584940120743-f50e77c58f00?q=80&w=400&auto=format&fit=crop&sig=43",
    "images": [
      "https://images.unsplash.com/photo-1584940120743-f50e77c58f00?q=80&w=400&auto=format&fit=crop&sig=43"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 91,
    "sku": "CC-M-043",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m44",
    "name": "Puma Heritage Parka",
    "description": "A premium quality heritage parka meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Puma",
    "price": 375,
    "discountPercent": 0,
    "stockQuantity": 57,
    "imageSrc": "https://images.unsplash.com/photo-1589574316285-f15f756019aa?q=80&w=400&auto=format&fit=crop&sig=44",
    "images": [
      "https://images.unsplash.com/photo-1589574316285-f15f756019aa?q=80&w=400&auto=format&fit=crop&sig=44"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 104,
    "sku": "CC-M-044",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m45",
    "name": "Tommy Hilfiger Tailored Trench Coat",
    "description": "A premium quality tailored trench coat meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Tommy Hilfiger",
    "price": 382,
    "discountPercent": 10,
    "stockQuantity": 60,
    "imageSrc": "https://images.unsplash.com/photo-1590086782779-e1f97fd144ef?q=80&w=400&auto=format&fit=crop&sig=45",
    "images": [
      "https://images.unsplash.com/photo-1590086782779-e1f97fd144ef?q=80&w=400&auto=format&fit=crop&sig=45"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 117,
    "sku": "CC-M-045",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m46",
    "name": "Levi's Classic Linen Shirt",
    "description": "A premium quality classic linen shirt meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Levi's",
    "price": 390,
    "discountPercent": 0,
    "stockQuantity": 63,
    "imageSrc": "https://images.unsplash.com/photo-1593085512500-11116244f2b1?q=80&w=400&auto=format&fit=crop&sig=46",
    "images": [
      "https://images.unsplash.com/photo-1593085512500-11116244f2b1?q=80&w=400&auto=format&fit=crop&sig=46"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 130,
    "sku": "CC-M-046",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m47",
    "name": "Zara Premium Chino Trousers",
    "description": "A premium quality premium chino trousers meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Zara",
    "price": 397,
    "discountPercent": 0,
    "stockQuantity": 66,
    "imageSrc": "https://images.unsplash.com/photo-1594744803329-3a32f62b4507?q=80&w=400&auto=format&fit=crop&sig=47",
    "images": [
      "https://images.unsplash.com/photo-1594744803329-3a32f62b4507?q=80&w=400&auto=format&fit=crop&sig=47"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 143,
    "sku": "CC-M-047",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "m48",
    "name": "H&M Urban Denim Jacket",
    "description": "A premium quality urban denim jacket meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "H&M",
    "price": 405,
    "discountPercent": 0,
    "stockQuantity": 69,
    "imageSrc": "https://images.unsplash.com/photo-1595152772351-4091ecf3aa54?q=80&w=400&auto=format&fit=crop&sig=48",
    "images": [
      "https://images.unsplash.com/photo-1595152772351-4091ecf3aa54?q=80&w=400&auto=format&fit=crop&sig=48"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 156,
    "sku": "CC-M-048",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "m49",
    "name": "Allen Solly Minimalist Wool Blazer",
    "description": "A premium quality minimalist wool blazer meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Allen Solly",
    "price": 412,
    "discountPercent": 0,
    "stockQuantity": 72,
    "imageSrc": "https://images.unsplash.com/photo-1595213600122-c31a7c505f0c?q=80&w=400&auto=format&fit=crop&sig=49",
    "images": [
      "https://images.unsplash.com/photo-1595213600122-c31a7c505f0c?q=80&w=400&auto=format&fit=crop&sig=49"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 169,
    "sku": "CC-M-049",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "m50",
    "name": "Louis Philippe Structured Polo Shirt",
    "description": "A premium quality structured polo shirt meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Men",
    "brand": "Louis Philippe",
    "price": 420,
    "discountPercent": 20,
    "stockQuantity": 75,
    "imageSrc": "https://images.unsplash.com/photo-1597244242674-f3cbe22b51cc?q=80&w=400&auto=format&fit=crop&sig=50",
    "images": [
      "https://images.unsplash.com/photo-1597244242674-f3cbe22b51cc?q=80&w=400&auto=format&fit=crop&sig=50"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 182,
    "sku": "CC-M-050",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w4",
    "name": "Allen Solly Pleated Cashmere Cardigan",
    "description": "A premium quality pleated cashmere cardigan meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Allen Solly",
    "price": 75,
    "discountPercent": 0,
    "stockQuantity": 22,
    "imageSrc": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop&sig=4",
    "images": [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop&sig=4"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 64,
    "sku": "CC-W-004",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w5",
    "name": "Louis Philippe Chiffon Wrap Skirt",
    "description": "A premium quality chiffon wrap skirt meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Louis Philippe",
    "price": 82,
    "discountPercent": 20,
    "stockQuantity": 25,
    "imageSrc": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop&sig=5",
    "images": [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop&sig=5"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 77,
    "sku": "CC-W-005",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w6",
    "name": "Nike Elegant Linen Sundress",
    "description": "A premium quality elegant linen sundress meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Nike",
    "price": 90,
    "discountPercent": 0,
    "stockQuantity": 28,
    "imageSrc": "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop&sig=6",
    "images": [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop&sig=6"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 90,
    "sku": "CC-W-006",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w7",
    "name": "Adidas Vintage Denim Dungarees",
    "description": "A premium quality vintage denim dungarees meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Adidas",
    "price": 97,
    "discountPercent": 0,
    "stockQuantity": 31,
    "imageSrc": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop&sig=7",
    "images": [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop&sig=7"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 103,
    "sku": "CC-W-007",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w8",
    "name": "Puma Silk Evening Gown",
    "description": "A premium quality silk evening gown meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Puma",
    "price": 105,
    "discountPercent": 0,
    "stockQuantity": 34,
    "imageSrc": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop&sig=8",
    "images": [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop&sig=8"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 116,
    "sku": "CC-W-008",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w9",
    "name": "Tommy Hilfiger Wrap Trench Cape",
    "description": "A premium quality wrap trench cape meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Tommy Hilfiger",
    "price": 112,
    "discountPercent": 0,
    "stockQuantity": 37,
    "imageSrc": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop&sig=9",
    "images": [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop&sig=9"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 129,
    "sku": "CC-W-009",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w10",
    "name": "Levi's Romantic Knit Top",
    "description": "A premium quality romantic knit top meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Levi's",
    "price": 120,
    "discountPercent": 15,
    "stockQuantity": 40,
    "imageSrc": "https://images.unsplash.com/photo-1525134479668-1a507c8744d0?q=80&w=400&auto=format&fit=crop&sig=10",
    "images": [
      "https://images.unsplash.com/photo-1525134479668-1a507c8744d0?q=80&w=400&auto=format&fit=crop&sig=10"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 142,
    "sku": "CC-W-010",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w11",
    "name": "Zara Couture Satin Camisole",
    "description": "A premium quality couture satin camisole meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Zara",
    "price": 127,
    "discountPercent": 0,
    "stockQuantity": 43,
    "imageSrc": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop&sig=11",
    "images": [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop&sig=11"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 155,
    "sku": "CC-W-011",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w12",
    "name": "H&M Modernist Kimono Jacket",
    "description": "A premium quality modernist kimono jacket meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "H&M",
    "price": 135,
    "discountPercent": 0,
    "stockQuantity": 46,
    "imageSrc": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop&sig=12",
    "images": [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop&sig=12"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 168,
    "sku": "CC-W-012",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w13",
    "name": "Allen Solly Chic Cocktail Dress",
    "description": "A premium quality chic cocktail dress meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Allen Solly",
    "price": 142,
    "discountPercent": 0,
    "stockQuantity": 49,
    "imageSrc": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=400&auto=format&fit=crop&sig=13",
    "images": [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=400&auto=format&fit=crop&sig=13"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 181,
    "sku": "CC-W-013",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w14",
    "name": "Louis Philippe Graceful Culottes",
    "description": "A premium quality graceful culottes meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Louis Philippe",
    "price": 150,
    "discountPercent": 0,
    "stockQuantity": 52,
    "imageSrc": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=14",
    "images": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=14"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 194,
    "sku": "CC-W-014",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w15",
    "name": "Nike Bohemian Midi Dress",
    "description": "A premium quality bohemian midi dress meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Nike",
    "price": 157,
    "discountPercent": 10,
    "stockQuantity": 55,
    "imageSrc": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop&sig=15",
    "images": [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop&sig=15"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 207,
    "sku": "CC-W-015",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w16",
    "name": "Adidas Sleek Silk Blouse",
    "description": "A premium quality sleek silk blouse meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Adidas",
    "price": 165,
    "discountPercent": 0,
    "stockQuantity": 58,
    "imageSrc": "https://images.unsplash.com/photo-1550414082-c913c8749a75?q=80&w=400&auto=format&fit=crop&sig=16",
    "images": [
      "https://images.unsplash.com/photo-1550414082-c913c8749a75?q=80&w=400&auto=format&fit=crop&sig=16"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 220,
    "sku": "CC-W-016",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w17",
    "name": "Puma Flowing Tailored Blazer",
    "description": "A premium quality flowing tailored blazer meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Puma",
    "price": 172,
    "discountPercent": 0,
    "stockQuantity": 61,
    "imageSrc": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop&sig=17",
    "images": [
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop&sig=17"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 233,
    "sku": "CC-W-017",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w18",
    "name": "Tommy Hilfiger Knitted Wide-Leg Pants",
    "description": "A premium quality knitted wide-leg pants meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Tommy Hilfiger",
    "price": 180,
    "discountPercent": 0,
    "stockQuantity": 64,
    "imageSrc": "https://images.unsplash.com/photo-1562572159-4ebcd318f4dd?q=80&w=400&auto=format&fit=crop&sig=18",
    "images": [
      "https://images.unsplash.com/photo-1562572159-4ebcd318f4dd?q=80&w=400&auto=format&fit=crop&sig=18"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 246,
    "sku": "CC-W-018",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w19",
    "name": "Levi's Pleated Cashmere Cardigan",
    "description": "A premium quality pleated cashmere cardigan meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Levi's",
    "price": 187,
    "discountPercent": 0,
    "stockQuantity": 67,
    "imageSrc": "https://images.unsplash.com/photo-1564564244018-c0dcc7daef46?q=80&w=400&auto=format&fit=crop&sig=19",
    "images": [
      "https://images.unsplash.com/photo-1564564244018-c0dcc7daef46?q=80&w=400&auto=format&fit=crop&sig=19"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 19,
    "sku": "CC-W-019",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w20",
    "name": "Zara Chiffon Wrap Skirt",
    "description": "A premium quality chiffon wrap skirt meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Zara",
    "price": 195,
    "discountPercent": 20,
    "stockQuantity": 70,
    "imageSrc": "https://images.unsplash.com/photo-1571224050228-56ee361ff5ff?q=80&w=400&auto=format&fit=crop&sig=20",
    "images": [
      "https://images.unsplash.com/photo-1571224050228-56ee361ff5ff?q=80&w=400&auto=format&fit=crop&sig=20"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 32,
    "sku": "CC-W-020",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w21",
    "name": "H&M Elegant Linen Sundress",
    "description": "A premium quality elegant linen sundress meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "H&M",
    "price": 202,
    "discountPercent": 0,
    "stockQuantity": 73,
    "imageSrc": "https://images.unsplash.com/photo-1576133649980-df4f0e4b8599?q=80&w=400&auto=format&fit=crop&sig=21",
    "images": [
      "https://images.unsplash.com/photo-1576133649980-df4f0e4b8599?q=80&w=400&auto=format&fit=crop&sig=21"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 45,
    "sku": "CC-W-021",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w22",
    "name": "Allen Solly Vintage Denim Dungarees",
    "description": "A premium quality vintage denim dungarees meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Allen Solly",
    "price": 210,
    "discountPercent": 0,
    "stockQuantity": 76,
    "imageSrc": "https://images.unsplash.com/photo-1581044777550-2c70750b23f4?q=80&w=400&auto=format&fit=crop&sig=22",
    "images": [
      "https://images.unsplash.com/photo-1581044777550-2c70750b23f4?q=80&w=400&auto=format&fit=crop&sig=22"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 58,
    "sku": "CC-W-022",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w23",
    "name": "Louis Philippe Silk Evening Gown",
    "description": "A premium quality silk evening gown meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Louis Philippe",
    "price": 217,
    "discountPercent": 0,
    "stockQuantity": 79,
    "imageSrc": "https://images.unsplash.com/photo-1588516948613-cf6a524e164a?q=80&w=400&auto=format&fit=crop&sig=23",
    "images": [
      "https://images.unsplash.com/photo-1588516948613-cf6a524e164a?q=80&w=400&auto=format&fit=crop&sig=23"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 71,
    "sku": "CC-W-023",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w24",
    "name": "Nike Wrap Trench Cape",
    "description": "A premium quality wrap trench cape meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Nike",
    "price": 225,
    "discountPercent": 0,
    "stockQuantity": 82,
    "imageSrc": "https://images.unsplash.com/photo-1592621311405-b04040ffb0c7?q=80&w=400&auto=format&fit=crop&sig=24",
    "images": [
      "https://images.unsplash.com/photo-1592621311405-b04040ffb0c7?q=80&w=400&auto=format&fit=crop&sig=24"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 84,
    "sku": "CC-W-024",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w25",
    "name": "Adidas Romantic Knit Top",
    "description": "A premium quality romantic knit top meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Adidas",
    "price": 232,
    "discountPercent": 15,
    "stockQuantity": 85,
    "imageSrc": "https://images.unsplash.com/photo-1595959183075-c1d092779c5c?q=80&w=400&auto=format&fit=crop&sig=25",
    "images": [
      "https://images.unsplash.com/photo-1595959183075-c1d092779c5c?q=80&w=400&auto=format&fit=crop&sig=25"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.1,
    "reviewCount": 97,
    "sku": "CC-W-025",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w26",
    "name": "Puma Couture Satin Camisole",
    "description": "A premium quality couture satin camisole meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Puma",
    "price": 240,
    "discountPercent": 0,
    "stockQuantity": 88,
    "imageSrc": "https://images.unsplash.com/photo-1598530033486-d242a420fec1?q=80&w=400&auto=format&fit=crop&sig=26",
    "images": [
      "https://images.unsplash.com/photo-1598530033486-d242a420fec1?q=80&w=400&auto=format&fit=crop&sig=26"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 110,
    "sku": "CC-W-026",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w27",
    "name": "Tommy Hilfiger Modernist Kimono Jacket",
    "description": "A premium quality modernist kimono jacket meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Tommy Hilfiger",
    "price": 247,
    "discountPercent": 0,
    "stockQuantity": 91,
    "imageSrc": "https://images.unsplash.com/photo-1598971861719-74d1bd144f87?q=80&w=400&auto=format&fit=crop&sig=27",
    "images": [
      "https://images.unsplash.com/photo-1598971861719-74d1bd144f87?q=80&w=400&auto=format&fit=crop&sig=27"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 123,
    "sku": "CC-W-027",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w28",
    "name": "Levi's Chic Cocktail Dress",
    "description": "A premium quality chic cocktail dress meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Levi's",
    "price": 255,
    "discountPercent": 0,
    "stockQuantity": 94,
    "imageSrc": "https://images.unsplash.com/photo-1599849594580-482a778847c8?q=80&w=400&auto=format&fit=crop&sig=28",
    "images": [
      "https://images.unsplash.com/photo-1599849594580-482a778847c8?q=80&w=400&auto=format&fit=crop&sig=28"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 136,
    "sku": "CC-W-028",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w29",
    "name": "Zara Graceful Culottes",
    "description": "A premium quality graceful culottes meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Zara",
    "price": 262,
    "discountPercent": 0,
    "stockQuantity": 12,
    "imageSrc": "https://images.unsplash.com/photo-1601831697474-5c91ec6ee837?q=80&w=400&auto=format&fit=crop&sig=29",
    "images": [
      "https://images.unsplash.com/photo-1601831697474-5c91ec6ee837?q=80&w=400&auto=format&fit=crop&sig=29"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 149,
    "sku": "CC-W-029",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w30",
    "name": "H&M Bohemian Midi Dress",
    "description": "A premium quality bohemian midi dress meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "H&M",
    "price": 270,
    "discountPercent": 10,
    "stockQuantity": 15,
    "imageSrc": "https://images.unsplash.com/photo-1602075737660-fcfbd4618e47?q=80&w=400&auto=format&fit=crop&sig=30",
    "images": [
      "https://images.unsplash.com/photo-1602075737660-fcfbd4618e47?q=80&w=400&auto=format&fit=crop&sig=30"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 162,
    "sku": "CC-W-030",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w31",
    "name": "Allen Solly Sleek Silk Blouse",
    "description": "A premium quality sleek silk blouse meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Allen Solly",
    "price": 277,
    "discountPercent": 0,
    "stockQuantity": 18,
    "imageSrc": "https://images.unsplash.com/photo-1605497746488-812d0959048a?q=80&w=400&auto=format&fit=crop&sig=31",
    "images": [
      "https://images.unsplash.com/photo-1605497746488-812d0959048a?q=80&w=400&auto=format&fit=crop&sig=31"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.1,
    "reviewCount": 175,
    "sku": "CC-W-031",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w32",
    "name": "Louis Philippe Flowing Tailored Blazer",
    "description": "A premium quality flowing tailored blazer meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Louis Philippe",
    "price": 285,
    "discountPercent": 0,
    "stockQuantity": 21,
    "imageSrc": "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=400&auto=format&fit=crop&sig=32",
    "images": [
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=400&auto=format&fit=crop&sig=32"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 188,
    "sku": "CC-W-032",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w33",
    "name": "Nike Knitted Wide-Leg Pants",
    "description": "A premium quality knitted wide-leg pants meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Nike",
    "price": 292,
    "discountPercent": 0,
    "stockQuantity": 24,
    "imageSrc": "https://images.unsplash.com/photo-1608741176147-de348090906a?q=80&w=400&auto=format&fit=crop&sig=33",
    "images": [
      "https://images.unsplash.com/photo-1608741176147-de348090906a?q=80&w=400&auto=format&fit=crop&sig=33"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 201,
    "sku": "CC-W-033",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w34",
    "name": "Adidas Pleated Cashmere Cardigan",
    "description": "A premium quality pleated cashmere cardigan meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Adidas",
    "price": 300,
    "discountPercent": 0,
    "stockQuantity": 27,
    "imageSrc": "https://images.unsplash.com/photo-1609357605207-de848a554a2f?q=80&w=400&auto=format&fit=crop&sig=34",
    "images": [
      "https://images.unsplash.com/photo-1609357605207-de848a554a2f?q=80&w=400&auto=format&fit=crop&sig=34"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 214,
    "sku": "CC-W-034",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w35",
    "name": "Puma Chiffon Wrap Skirt",
    "description": "A premium quality chiffon wrap skirt meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Puma",
    "price": 307,
    "discountPercent": 20,
    "stockQuantity": 30,
    "imageSrc": "https://images.unsplash.com/photo-1610424037500-a548239088ff?q=80&w=400&auto=format&fit=crop&sig=35",
    "images": [
      "https://images.unsplash.com/photo-1610424037500-a548239088ff?q=80&w=400&auto=format&fit=crop&sig=35"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 227,
    "sku": "CC-W-035",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w36",
    "name": "Tommy Hilfiger Elegant Linen Sundress",
    "description": "A premium quality elegant linen sundress meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Tommy Hilfiger",
    "price": 315,
    "discountPercent": 0,
    "stockQuantity": 33,
    "imageSrc": "https://images.unsplash.com/photo-1611041926665-efc2ab0c8b0a?q=80&w=400&auto=format&fit=crop&sig=36",
    "images": [
      "https://images.unsplash.com/photo-1611041926665-efc2ab0c8b0a?q=80&w=400&auto=format&fit=crop&sig=36"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 240,
    "sku": "CC-W-036",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w37",
    "name": "Levi's Vintage Denim Dungarees",
    "description": "A premium quality vintage denim dungarees meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Levi's",
    "price": 322,
    "discountPercent": 0,
    "stockQuantity": 36,
    "imageSrc": "https://images.unsplash.com/photo-1611784724483-e18bb39c9dfa?q=80&w=400&auto=format&fit=crop&sig=37",
    "images": [
      "https://images.unsplash.com/photo-1611784724483-e18bb39c9dfa?q=80&w=400&auto=format&fit=crop&sig=37"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.1,
    "reviewCount": 13,
    "sku": "CC-W-037",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w38",
    "name": "Zara Silk Evening Gown",
    "description": "A premium quality silk evening gown meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Zara",
    "price": 330,
    "discountPercent": 0,
    "stockQuantity": 39,
    "imageSrc": "https://images.unsplash.com/photo-1612808381831-29e2f9d854ec?q=80&w=400&auto=format&fit=crop&sig=38",
    "images": [
      "https://images.unsplash.com/photo-1612808381831-29e2f9d854ec?q=80&w=400&auto=format&fit=crop&sig=38"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 26,
    "sku": "CC-W-038",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w39",
    "name": "H&M Wrap Trench Cape",
    "description": "A premium quality wrap trench cape meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "H&M",
    "price": 337,
    "discountPercent": 0,
    "stockQuantity": 42,
    "imageSrc": "https://images.unsplash.com/photo-1613904975230-da8ccdb0ff1c?q=80&w=400&auto=format&fit=crop&sig=39",
    "images": [
      "https://images.unsplash.com/photo-1613904975230-da8ccdb0ff1c?q=80&w=400&auto=format&fit=crop&sig=39"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 39,
    "sku": "CC-W-039",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w40",
    "name": "Allen Solly Romantic Knit Top",
    "description": "A premium quality romantic knit top meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Allen Solly",
    "price": 345,
    "discountPercent": 15,
    "stockQuantity": 45,
    "imageSrc": "https://images.unsplash.com/photo-1614704879641-a6ff998ffba1?q=80&w=400&auto=format&fit=crop&sig=40",
    "images": [
      "https://images.unsplash.com/photo-1614704879641-a6ff998ffba1?q=80&w=400&auto=format&fit=crop&sig=40"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 52,
    "sku": "CC-W-040",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w41",
    "name": "Louis Philippe Couture Satin Camisole",
    "description": "A premium quality couture satin camisole meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Louis Philippe",
    "price": 352,
    "discountPercent": 0,
    "stockQuantity": 48,
    "imageSrc": "https://images.unsplash.com/photo-1615809796000-8bde396cc8b3?q=80&w=400&auto=format&fit=crop&sig=41",
    "images": [
      "https://images.unsplash.com/photo-1615809796000-8bde396cc8b3?q=80&w=400&auto=format&fit=crop&sig=41"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 65,
    "sku": "CC-W-041",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w42",
    "name": "Nike Modernist Kimono Jacket",
    "description": "A premium quality modernist kimono jacket meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Nike",
    "price": 360,
    "discountPercent": 0,
    "stockQuantity": 51,
    "imageSrc": "https://images.unsplash.com/photo-1616258410292-127e77b4ba71?q=80&w=400&auto=format&fit=crop&sig=42",
    "images": [
      "https://images.unsplash.com/photo-1616258410292-127e77b4ba71?q=80&w=400&auto=format&fit=crop&sig=42"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 78,
    "sku": "CC-W-042",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w43",
    "name": "Adidas Chic Cocktail Dress",
    "description": "A premium quality chic cocktail dress meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Adidas",
    "price": 367,
    "discountPercent": 0,
    "stockQuantity": 54,
    "imageSrc": "https://images.unsplash.com/photo-1617260533519-7a544c21cd5d?q=80&w=400&auto=format&fit=crop&sig=43",
    "images": [
      "https://images.unsplash.com/photo-1617260533519-7a544c21cd5d?q=80&w=400&auto=format&fit=crop&sig=43"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 91,
    "sku": "CC-W-043",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w44",
    "name": "Puma Graceful Culottes",
    "description": "A premium quality graceful culottes meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Puma",
    "price": 375,
    "discountPercent": 0,
    "stockQuantity": 57,
    "imageSrc": "https://images.unsplash.com/photo-1618385805124-7fefde49fbc0?q=80&w=400&auto=format&fit=crop&sig=44",
    "images": [
      "https://images.unsplash.com/photo-1618385805124-7fefde49fbc0?q=80&w=400&auto=format&fit=crop&sig=44"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 104,
    "sku": "CC-W-044",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w45",
    "name": "Tommy Hilfiger Bohemian Midi Dress",
    "description": "A premium quality bohemian midi dress meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Tommy Hilfiger",
    "price": 382,
    "discountPercent": 10,
    "stockQuantity": 60,
    "imageSrc": "https://images.unsplash.com/photo-1618585483251-cebcae3dbd4d?q=80&w=400&auto=format&fit=crop&sig=45",
    "images": [
      "https://images.unsplash.com/photo-1618585483251-cebcae3dbd4d?q=80&w=400&auto=format&fit=crop&sig=45"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 117,
    "sku": "CC-W-045",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w46",
    "name": "Levi's Sleek Silk Blouse",
    "description": "A premium quality sleek silk blouse meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Levi's",
    "price": 390,
    "discountPercent": 0,
    "stockQuantity": 63,
    "imageSrc": "https://images.unsplash.com/photo-1619472390144-8d4cc8fbc04f?q=80&w=400&auto=format&fit=crop&sig=46",
    "images": [
      "https://images.unsplash.com/photo-1619472390144-8d4cc8fbc04f?q=80&w=400&auto=format&fit=crop&sig=46"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 130,
    "sku": "CC-W-046",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w47",
    "name": "Zara Flowing Tailored Blazer",
    "description": "A premium quality flowing tailored blazer meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Zara",
    "price": 397,
    "discountPercent": 0,
    "stockQuantity": 66,
    "imageSrc": "https://images.unsplash.com/photo-1620297072440-6927a7bd4cc0?q=80&w=400&auto=format&fit=crop&sig=47",
    "images": [
      "https://images.unsplash.com/photo-1620297072440-6927a7bd4cc0?q=80&w=400&auto=format&fit=crop&sig=47"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 143,
    "sku": "CC-W-047",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "w48",
    "name": "H&M Knitted Wide-Leg Pants",
    "description": "A premium quality knitted wide-leg pants meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "H&M",
    "price": 405,
    "discountPercent": 0,
    "stockQuantity": 69,
    "imageSrc": "https://images.unsplash.com/photo-1621280381014-ef9d8d6dc5c0?q=80&w=400&auto=format&fit=crop&sig=48",
    "images": [
      "https://images.unsplash.com/photo-1621280381014-ef9d8d6dc5c0?q=80&w=400&auto=format&fit=crop&sig=48"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 156,
    "sku": "CC-W-048",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "w49",
    "name": "Allen Solly Pleated Cashmere Cardigan",
    "description": "A premium quality pleated cashmere cardigan meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Allen Solly",
    "price": 412,
    "discountPercent": 0,
    "stockQuantity": 72,
    "imageSrc": "https://images.unsplash.com/photo-1622284724483-7c70c0c0552b?q=80&w=400&auto=format&fit=crop&sig=49",
    "images": [
      "https://images.unsplash.com/photo-1622284724483-7c70c0c0552b?q=80&w=400&auto=format&fit=crop&sig=49"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 169,
    "sku": "CC-W-049",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "w50",
    "name": "Louis Philippe Chiffon Wrap Skirt",
    "description": "A premium quality chiffon wrap skirt meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Women",
    "brand": "Louis Philippe",
    "price": 420,
    "discountPercent": 20,
    "stockQuantity": 75,
    "imageSrc": "https://images.unsplash.com/photo-1623280381014-de823bfbc8f8?q=80&w=400&auto=format&fit=crop&sig=50",
    "images": [
      "https://images.unsplash.com/photo-1623280381014-de823bfbc8f8?q=80&w=400&auto=format&fit=crop&sig=50"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 182,
    "sku": "CC-W-050",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "k4",
    "name": "Allen Solly Striped Sweatpants",
    "description": "A premium quality striped sweatpants meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Allen Solly",
    "price": 75,
    "discountPercent": 0,
    "stockQuantity": 22,
    "imageSrc": "https://images.unsplash.com/photo-1519457431-44cd6481697b?q=80&w=400&auto=format&fit=crop&sig=4",
    "images": [
      "https://images.unsplash.com/photo-1519457431-44cd6481697b?q=80&w=400&auto=format&fit=crop&sig=4"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 64,
    "sku": "CC-K-004",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "k5",
    "name": "Louis Philippe Denim Raincoat",
    "description": "A premium quality denim raincoat meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Louis Philippe",
    "price": 82,
    "discountPercent": 20,
    "stockQuantity": 25,
    "imageSrc": "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=5",
    "images": [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=5"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 77,
    "sku": "CC-K-005",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "k6",
    "name": "Nike Fleece Pajama Set",
    "description": "A premium quality fleece pajama set meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Nike",
    "price": 90,
    "discountPercent": 0,
    "stockQuantity": 28,
    "imageSrc": "https://images.unsplash.com/photo-1519689680058-28751e9a3c10?q=80&w=400&auto=format&fit=crop&sig=6",
    "images": [
      "https://images.unsplash.com/photo-1519689680058-28751e9a3c10?q=80&w=400&auto=format&fit=crop&sig=6"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 90,
    "sku": "CC-K-006",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "k7",
    "name": "Adidas Bright Cardigan",
    "description": "A premium quality bright cardigan meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Adidas",
    "price": 97,
    "discountPercent": 0,
    "stockQuantity": 31,
    "imageSrc": "https://images.unsplash.com/photo-1513556020-0010d7e59b27?q=80&w=400&auto=format&fit=crop&sig=7",
    "images": [
      "https://images.unsplash.com/photo-1513556020-0010d7e59b27?q=80&w=400&auto=format&fit=crop&sig=7"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 103,
    "sku": "CC-K-007",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "k8",
    "name": "Puma Soft Shorts",
    "description": "A premium quality soft shorts meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Puma",
    "price": 105,
    "discountPercent": 0,
    "stockQuantity": 34,
    "imageSrc": "https://images.unsplash.com/photo-1537655780520-1e392ecd81f2?q=80&w=400&auto=format&fit=crop&sig=8",
    "images": [
      "https://images.unsplash.com/photo-1537655780520-1e392ecd81f2?q=80&w=400&auto=format&fit=crop&sig=8"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 116,
    "sku": "CC-K-008",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "k9",
    "name": "Tommy Hilfiger Comfort Pinafore",
    "description": "A premium quality comfort pinafore meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Tommy Hilfiger",
    "price": 112,
    "discountPercent": 0,
    "stockQuantity": 37,
    "imageSrc": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=400&auto=format&fit=crop&sig=9",
    "images": [
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=400&auto=format&fit=crop&sig=9"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 129,
    "sku": "CC-K-009",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "k10",
    "name": "Levi's Active Romper",
    "description": "A premium quality active romper meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Levi's",
    "price": 120,
    "discountPercent": 15,
    "stockQuantity": 40,
    "imageSrc": "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=10",
    "images": [
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=10"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 142,
    "sku": "CC-K-010",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "k11",
    "name": "Zara Warm Denim Jacket",
    "description": "A premium quality warm denim jacket meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Zara",
    "price": 127,
    "discountPercent": 0,
    "stockQuantity": 43,
    "imageSrc": "https://images.unsplash.com/photo-1566516171-3c1a3b50a29d?q=80&w=400&auto=format&fit=crop&sig=11",
    "images": [
      "https://images.unsplash.com/photo-1566516171-3c1a3b50a29d?q=80&w=400&auto=format&fit=crop&sig=11"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 155,
    "sku": "CC-K-011",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "k12",
    "name": "H&M Lightweight Knit Cap",
    "description": "A premium quality lightweight knit cap meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "H&M",
    "price": 135,
    "discountPercent": 0,
    "stockQuantity": 46,
    "imageSrc": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=12",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=12"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 168,
    "sku": "CC-K-012",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "k13",
    "name": "Allen Solly Durable Windbreaker",
    "description": "A premium quality durable windbreaker meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Allen Solly",
    "price": 142,
    "discountPercent": 0,
    "stockQuantity": 49,
    "imageSrc": "https://images.unsplash.com/photo-1602057376609-bca127e77bba?q=80&w=400&auto=format&fit=crop&sig=13",
    "images": [
      "https://images.unsplash.com/photo-1602057376609-bca127e77bba?q=80&w=400&auto=format&fit=crop&sig=13"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 181,
    "sku": "CC-K-013",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "k14",
    "name": "Louis Philippe Happy Fleece Vest",
    "description": "A premium quality happy fleece vest meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Louis Philippe",
    "price": 150,
    "discountPercent": 0,
    "stockQuantity": 52,
    "imageSrc": "https://images.unsplash.com/photo-1607524037500-afc23b28bdf0?q=80&w=400&auto=format&fit=crop&sig=14",
    "images": [
      "https://images.unsplash.com/photo-1607524037500-afc23b28bdf0?q=80&w=400&auto=format&fit=crop&sig=14"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 194,
    "sku": "CC-K-014",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "k15",
    "name": "Nike Organic Cotton Jumpsuit",
    "description": "A premium quality organic cotton jumpsuit meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Nike",
    "price": 157,
    "discountPercent": 10,
    "stockQuantity": 55,
    "imageSrc": "https://images.unsplash.com/photo-1609124037500-ef823b128cdf?q=80&w=400&auto=format&fit=crop&sig=15",
    "images": [
      "https://images.unsplash.com/photo-1609124037500-ef823b128cdf?q=80&w=400&auto=format&fit=crop&sig=15"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 207,
    "sku": "CC-K-015",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "k16",
    "name": "Adidas Playful Hoodie",
    "description": "A premium quality playful hoodie meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Adidas",
    "price": 165,
    "discountPercent": 0,
    "stockQuantity": 58,
    "imageSrc": "https://images.unsplash.com/photo-1611041926665-de823abbc80a?q=80&w=400&auto=format&fit=crop&sig=16",
    "images": [
      "https://images.unsplash.com/photo-1611041926665-de823abbc80a?q=80&w=400&auto=format&fit=crop&sig=16"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 220,
    "sku": "CC-K-016",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "k17",
    "name": "Puma Cozy Overalls",
    "description": "A premium quality cozy overalls meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Puma",
    "price": 172,
    "discountPercent": 0,
    "stockQuantity": 61,
    "imageSrc": "https://images.unsplash.com/photo-1611784724483-fefba8c0a2bd?q=80&w=400&auto=format&fit=crop&sig=17",
    "images": [
      "https://images.unsplash.com/photo-1611784724483-fefba8c0a2bd?q=80&w=400&auto=format&fit=crop&sig=17"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 233,
    "sku": "CC-K-017",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "k18",
    "name": "Tommy Hilfiger Stretch T-Shirt",
    "description": "A premium quality stretch t-shirt meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Tommy Hilfiger",
    "price": 180,
    "discountPercent": 0,
    "stockQuantity": 64,
    "imageSrc": "https://images.unsplash.com/photo-1612808381831-cebca1ab5e8f?q=80&w=400&auto=format&fit=crop&sig=18",
    "images": [
      "https://images.unsplash.com/photo-1612808381831-cebca1ab5e8f?q=80&w=400&auto=format&fit=crop&sig=18"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 246,
    "sku": "CC-K-018",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "k19",
    "name": "Levi's Striped Sweatpants",
    "description": "A premium quality striped sweatpants meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Levi's",
    "price": 187,
    "discountPercent": 0,
    "stockQuantity": 67,
    "imageSrc": "https://images.unsplash.com/photo-1613904975230-aefbd318c8e8?q=80&w=400&auto=format&fit=crop&sig=19",
    "images": [
      "https://images.unsplash.com/photo-1613904975230-aefbd318c8e8?q=80&w=400&auto=format&fit=crop&sig=19"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 19,
    "sku": "CC-K-019",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "k20",
    "name": "Zara Denim Raincoat",
    "description": "A premium quality denim raincoat meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Zara",
    "price": 195,
    "discountPercent": 20,
    "stockQuantity": 70,
    "imageSrc": "https://images.unsplash.com/photo-1614704879641-de82ab4792be?q=80&w=400&auto=format&fit=crop&sig=20",
    "images": [
      "https://images.unsplash.com/photo-1614704879641-de82ab4792be?q=80&w=400&auto=format&fit=crop&sig=20"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 32,
    "sku": "CC-K-020",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "k21",
    "name": "H&M Fleece Pajama Set",
    "description": "A premium quality fleece pajama set meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "H&M",
    "price": 202,
    "discountPercent": 0,
    "stockQuantity": 73,
    "imageSrc": "https://images.unsplash.com/photo-1615809796000-cebfa8c0de8b?q=80&w=400&auto=format&fit=crop&sig=21",
    "images": [
      "https://images.unsplash.com/photo-1615809796000-cebfa8c0de8b?q=80&w=400&auto=format&fit=crop&sig=21"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 45,
    "sku": "CC-K-021",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "k22",
    "name": "Allen Solly Bright Cardigan",
    "description": "A premium quality bright cardigan meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Allen Solly",
    "price": 210,
    "discountPercent": 0,
    "stockQuantity": 76,
    "imageSrc": "https://images.unsplash.com/photo-1616258410292-efcbd3128bca?q=80&w=400&auto=format&fit=crop&sig=22",
    "images": [
      "https://images.unsplash.com/photo-1616258410292-efcbd3128bca?q=80&w=400&auto=format&fit=crop&sig=22"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 58,
    "sku": "CC-K-022",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "k23",
    "name": "Louis Philippe Soft Shorts",
    "description": "A premium quality soft shorts meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Louis Philippe",
    "price": 217,
    "discountPercent": 0,
    "stockQuantity": 79,
    "imageSrc": "https://images.unsplash.com/photo-1617260533519-de82ab127cdf?q=80&w=400&auto=format&fit=crop&sig=23",
    "images": [
      "https://images.unsplash.com/photo-1617260533519-de82ab127cdf?q=80&w=400&auto=format&fit=crop&sig=23"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 71,
    "sku": "CC-K-023",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "k24",
    "name": "Nike Comfort Pinafore",
    "description": "A premium quality comfort pinafore meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Nike",
    "price": 225,
    "discountPercent": 0,
    "stockQuantity": 82,
    "imageSrc": "https://images.unsplash.com/photo-1618385805124-ceba1a0c8bd0?q=80&w=400&auto=format&fit=crop&sig=24",
    "images": [
      "https://images.unsplash.com/photo-1618385805124-ceba1a0c8bd0?q=80&w=400&auto=format&fit=crop&sig=24"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 84,
    "sku": "CC-K-024",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "k25",
    "name": "Adidas Active Romper",
    "description": "A premium quality active romper meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Adidas",
    "price": 232,
    "discountPercent": 15,
    "stockQuantity": 85,
    "imageSrc": "https://images.unsplash.com/photo-1618585483251-deba8c01ab88?q=80&w=400&auto=format&fit=crop&sig=25",
    "images": [
      "https://images.unsplash.com/photo-1618585483251-deba8c01ab88?q=80&w=400&auto=format&fit=crop&sig=25"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.1,
    "reviewCount": 97,
    "sku": "CC-K-025",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "k26",
    "name": "Puma Warm Denim Jacket",
    "description": "A premium quality warm denim jacket meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Puma",
    "price": 240,
    "discountPercent": 0,
    "stockQuantity": 88,
    "imageSrc": "https://images.unsplash.com/photo-1619472390144-fefba1238b0c?q=80&w=400&auto=format&fit=crop&sig=26",
    "images": [
      "https://images.unsplash.com/photo-1619472390144-fefba1238b0c?q=80&w=400&auto=format&fit=crop&sig=26"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 110,
    "sku": "CC-K-026",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "k27",
    "name": "Tommy Hilfiger Lightweight Knit Cap",
    "description": "A premium quality lightweight knit cap meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Tommy Hilfiger",
    "price": 247,
    "discountPercent": 0,
    "stockQuantity": 91,
    "imageSrc": "https://images.unsplash.com/photo-1620297072440-aebf9c80bd4b?q=80&w=400&auto=format&fit=crop&sig=27",
    "images": [
      "https://images.unsplash.com/photo-1620297072440-aebf9c80bd4b?q=80&w=400&auto=format&fit=crop&sig=27"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 123,
    "sku": "CC-K-027",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "k28",
    "name": "Levi's Durable Windbreaker",
    "description": "A premium quality durable windbreaker meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Levi's",
    "price": 255,
    "discountPercent": 0,
    "stockQuantity": 94,
    "imageSrc": "https://images.unsplash.com/photo-1621280381014-de8ab1238fcf?q=80&w=400&auto=format&fit=crop&sig=28",
    "images": [
      "https://images.unsplash.com/photo-1621280381014-de8ab1238fcf?q=80&w=400&auto=format&fit=crop&sig=28"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 136,
    "sku": "CC-K-028",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "k29",
    "name": "Zara Happy Fleece Vest",
    "description": "A premium quality happy fleece vest meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "Zara",
    "price": 262,
    "discountPercent": 0,
    "stockQuantity": 12,
    "imageSrc": "https://images.unsplash.com/photo-1622284724483-aefbd328ba8c?q=80&w=400&auto=format&fit=crop&sig=29",
    "images": [
      "https://images.unsplash.com/photo-1622284724483-aefbd328ba8c?q=80&w=400&auto=format&fit=crop&sig=29"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 149,
    "sku": "CC-K-029",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "k30",
    "name": "H&M Organic Cotton Jumpsuit",
    "description": "A premium quality organic cotton jumpsuit meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Kids",
    "brand": "H&M",
    "price": 270,
    "discountPercent": 10,
    "stockQuantity": 15,
    "imageSrc": "https://images.unsplash.com/photo-1623280381014-cefba128a8d0?q=80&w=400&auto=format&fit=crop&sig=30",
    "images": [
      "https://images.unsplash.com/photo-1623280381014-cefba128a8d0?q=80&w=400&auto=format&fit=crop&sig=30"
    ],
    "size": [
      "2T",
      "3T",
      "4T",
      "5T"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 162,
    "sku": "CC-K-030",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "a1",
    "name": "Levi's Canvas Backpack",
    "description": "A premium quality canvas backpack meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Levi's",
    "price": 52,
    "discountPercent": 0,
    "stockQuantity": 13,
    "imageSrc": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop&sig=1",
    "images": [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop&sig=1"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 25,
    "sku": "CC-A-001",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "a2",
    "name": "Zara Classic Sunglasses",
    "description": "A premium quality classic sunglasses meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Zara",
    "price": 60,
    "discountPercent": 0,
    "stockQuantity": 16,
    "imageSrc": "https://images.unsplash.com/photo-1608741176147-de348090906a?q=80&w=400&auto=format&fit=crop&sig=2",
    "images": [
      "https://images.unsplash.com/photo-1608741176147-de348090906a?q=80&w=400&auto=format&fit=crop&sig=2"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 38,
    "sku": "CC-A-002",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "a3",
    "name": "H&M Woven Wallet",
    "description": "A premium quality woven wallet meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "H&M",
    "price": 67,
    "discountPercent": 0,
    "stockQuantity": 19,
    "imageSrc": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop&sig=3",
    "images": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop&sig=3"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 51,
    "sku": "CC-A-003",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "a4",
    "name": "Allen Solly Minimalist Scarf",
    "description": "A premium quality minimalist scarf meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Allen Solly",
    "price": 75,
    "discountPercent": 0,
    "stockQuantity": 22,
    "imageSrc": "https://images.unsplash.com/photo-1524498250046-753c15d97f28?q=80&w=400&auto=format&fit=crop&sig=4",
    "images": [
      "https://images.unsplash.com/photo-1524498250046-753c15d97f28?q=80&w=400&auto=format&fit=crop&sig=4"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 64,
    "sku": "CC-A-004",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "a5",
    "name": "Louis Philippe Vintage Duffle Bag",
    "description": "A premium quality vintage duffle bag meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Louis Philippe",
    "price": 82,
    "discountPercent": 20,
    "stockQuantity": 25,
    "imageSrc": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=5",
    "images": [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=5"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 77,
    "sku": "CC-A-005",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "a6",
    "name": "Nike Solar Beanie",
    "description": "A premium quality solar beanie meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Nike",
    "price": 90,
    "discountPercent": 0,
    "stockQuantity": 28,
    "imageSrc": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=400&auto=format&fit=crop&sig=6",
    "images": [
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=400&auto=format&fit=crop&sig=6"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 90,
    "sku": "CC-A-006",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "a7",
    "name": "Adidas Polarized Tie",
    "description": "A premium quality polarized tie meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Adidas",
    "price": 97,
    "discountPercent": 0,
    "stockQuantity": 31,
    "imageSrc": "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=7",
    "images": [
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=7"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 103,
    "sku": "CC-A-007",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "a8",
    "name": "Puma Suede Watch",
    "description": "A premium quality suede watch meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Puma",
    "price": 105,
    "discountPercent": 0,
    "stockQuantity": 34,
    "imageSrc": "https://images.unsplash.com/photo-1539874754764-5a96559165b0?q=80&w=400&auto=format&fit=crop&sig=8",
    "images": [
      "https://images.unsplash.com/photo-1539874754764-5a96559165b0?q=80&w=400&auto=format&fit=crop&sig=8"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 116,
    "sku": "CC-A-008",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "a9",
    "name": "Tommy Hilfiger Premium Socks Pack",
    "description": "A premium quality premium socks pack meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Tommy Hilfiger",
    "price": 112,
    "discountPercent": 0,
    "stockQuantity": 37,
    "imageSrc": "https://images.unsplash.com/photo-1588359747833-2c40c8f128e4?q=80&w=400&auto=format&fit=crop&sig=9",
    "images": [
      "https://images.unsplash.com/photo-1588359747833-2c40c8f128e4?q=80&w=400&auto=format&fit=crop&sig=9"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 129,
    "sku": "CC-A-009",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "a10",
    "name": "Levi's Atelier Bucket Hat",
    "description": "A premium quality atelier bucket hat meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Levi's",
    "price": 120,
    "discountPercent": 15,
    "stockQuantity": 40,
    "imageSrc": "https://images.unsplash.com/photo-1598530033486-d242a420fec1?q=80&w=400&auto=format&fit=crop&sig=10",
    "images": [
      "https://images.unsplash.com/photo-1598530033486-d242a420fec1?q=80&w=400&auto=format&fit=crop&sig=10"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 142,
    "sku": "CC-A-010",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "a11",
    "name": "Zara Travel Leather Tote",
    "description": "A premium quality travel leather tote meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Zara",
    "price": 127,
    "discountPercent": 0,
    "stockQuantity": 43,
    "imageSrc": "https://images.unsplash.com/photo-1601924991987-64a7cc5a92d0?q=80&w=400&auto=format&fit=crop&sig=11",
    "images": [
      "https://images.unsplash.com/photo-1601924991987-64a7cc5a92d0?q=80&w=400&auto=format&fit=crop&sig=11"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 155,
    "sku": "CC-A-011",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "a12",
    "name": "H&M Urban Crossbody Bag",
    "description": "A premium quality urban crossbody bag meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "H&M",
    "price": 135,
    "discountPercent": 0,
    "stockQuantity": 46,
    "imageSrc": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=12",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=12"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 168,
    "sku": "CC-A-012",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "a13",
    "name": "Allen Solly Luxury Gloves",
    "description": "A premium quality luxury gloves meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Allen Solly",
    "price": 142,
    "discountPercent": 0,
    "stockQuantity": 49,
    "imageSrc": "https://images.unsplash.com/photo-1607524037500-afc23b28bdf0?q=80&w=400&auto=format&fit=crop&sig=13",
    "images": [
      "https://images.unsplash.com/photo-1607524037500-afc23b28bdf0?q=80&w=400&auto=format&fit=crop&sig=13"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 181,
    "sku": "CC-A-013",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "a14",
    "name": "Louis Philippe Handcrafted Card Holder",
    "description": "A premium quality handcrafted card holder meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Louis Philippe",
    "price": 150,
    "discountPercent": 0,
    "stockQuantity": 52,
    "imageSrc": "https://images.unsplash.com/photo-1609124037500-ef823b128cdf?q=80&w=400&auto=format&fit=crop&sig=14",
    "images": [
      "https://images.unsplash.com/photo-1609124037500-ef823b128cdf?q=80&w=400&auto=format&fit=crop&sig=14"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 194,
    "sku": "CC-A-014",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "a15",
    "name": "Nike Italian Leather Belt",
    "description": "A premium quality italian leather belt meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Nike",
    "price": 157,
    "discountPercent": 10,
    "stockQuantity": 55,
    "imageSrc": "https://images.unsplash.com/photo-1611041926665-de823abbc80a?q=80&w=400&auto=format&fit=crop&sig=15",
    "images": [
      "https://images.unsplash.com/photo-1611041926665-de823abbc80a?q=80&w=400&auto=format&fit=crop&sig=15"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 207,
    "sku": "CC-A-015",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "a16",
    "name": "Adidas Canvas Backpack",
    "description": "A premium quality canvas backpack meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Adidas",
    "price": 165,
    "discountPercent": 0,
    "stockQuantity": 58,
    "imageSrc": "https://images.unsplash.com/photo-1611784724483-fefba8c0a2bd?q=80&w=400&auto=format&fit=crop&sig=16",
    "images": [
      "https://images.unsplash.com/photo-1611784724483-fefba8c0a2bd?q=80&w=400&auto=format&fit=crop&sig=16"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 220,
    "sku": "CC-A-016",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "a17",
    "name": "Puma Classic Sunglasses",
    "description": "A premium quality classic sunglasses meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Puma",
    "price": 172,
    "discountPercent": 0,
    "stockQuantity": 61,
    "imageSrc": "https://images.unsplash.com/photo-1612808381831-cebca1ab5e8f?q=80&w=400&auto=format&fit=crop&sig=17",
    "images": [
      "https://images.unsplash.com/photo-1612808381831-cebca1ab5e8f?q=80&w=400&auto=format&fit=crop&sig=17"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 233,
    "sku": "CC-A-017",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "a18",
    "name": "Tommy Hilfiger Woven Wallet",
    "description": "A premium quality woven wallet meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Tommy Hilfiger",
    "price": 180,
    "discountPercent": 0,
    "stockQuantity": 64,
    "imageSrc": "https://images.unsplash.com/photo-1613904975230-aefbd318c8e8?q=80&w=400&auto=format&fit=crop&sig=18",
    "images": [
      "https://images.unsplash.com/photo-1613904975230-aefbd318c8e8?q=80&w=400&auto=format&fit=crop&sig=18"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 246,
    "sku": "CC-A-018",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "a19",
    "name": "Levi's Minimalist Scarf",
    "description": "A premium quality minimalist scarf meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Levi's",
    "price": 187,
    "discountPercent": 0,
    "stockQuantity": 67,
    "imageSrc": "https://images.unsplash.com/photo-1614704879641-de82ab4792be?q=80&w=400&auto=format&fit=crop&sig=19",
    "images": [
      "https://images.unsplash.com/photo-1614704879641-de82ab4792be?q=80&w=400&auto=format&fit=crop&sig=19"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 19,
    "sku": "CC-A-019",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "a20",
    "name": "Zara Vintage Duffle Bag",
    "description": "A premium quality vintage duffle bag meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Accessories",
    "brand": "Zara",
    "price": 195,
    "discountPercent": 20,
    "stockQuantity": 70,
    "imageSrc": "https://images.unsplash.com/photo-1615809796000-cebfa8c0de8b?q=80&w=400&auto=format&fit=crop&sig=20",
    "images": [
      "https://images.unsplash.com/photo-1615809796000-cebfa8c0de8b?q=80&w=400&auto=format&fit=crop&sig=20"
    ],
    "size": [
      "One Size"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 32,
    "sku": "CC-A-020",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "f1",
    "name": "Levi's Running Boots",
    "description": "A premium quality running boots meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Levi's",
    "price": 52,
    "discountPercent": 0,
    "stockQuantity": 13,
    "imageSrc": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop&sig=1",
    "images": [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop&sig=1"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 25,
    "sku": "CC-F-001",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "f2",
    "name": "Zara Leather Oxford Loafers",
    "description": "A premium quality leather oxford loafers meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Zara",
    "price": 60,
    "discountPercent": 0,
    "stockQuantity": 16,
    "imageSrc": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=400&auto=format&fit=crop&sig=2",
    "images": [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=400&auto=format&fit=crop&sig=2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 38,
    "sku": "CC-F-002",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "f3",
    "name": "H&M Suede Chelsea Derbies",
    "description": "A premium quality suede chelsea derbies meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "H&M",
    "price": 67,
    "discountPercent": 0,
    "stockQuantity": 19,
    "imageSrc": "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=400&auto=format&fit=crop&sig=3",
    "images": [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=400&auto=format&fit=crop&sig=3"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 51,
    "sku": "CC-F-003",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "f4",
    "name": "Allen Solly Canvas Sandals",
    "description": "A premium quality canvas sandals meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Allen Solly",
    "price": 75,
    "discountPercent": 0,
    "stockQuantity": 22,
    "imageSrc": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop&sig=4",
    "images": [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop&sig=4"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 64,
    "sku": "CC-F-004",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "f5",
    "name": "Louis Philippe Sport Brogues",
    "description": "A premium quality sport brogues meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Louis Philippe",
    "price": 82,
    "discountPercent": 20,
    "stockQuantity": 25,
    "imageSrc": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop&sig=5",
    "images": [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop&sig=5"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 77,
    "sku": "CC-F-005",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "f6",
    "name": "Nike Chunky Trainer",
    "description": "A premium quality chunky trainer meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Nike",
    "price": 90,
    "discountPercent": 0,
    "stockQuantity": 28,
    "imageSrc": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400&auto=format&fit=crop&sig=6",
    "images": [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400&auto=format&fit=crop&sig=6"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 90,
    "sku": "CC-F-006",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "f7",
    "name": "Adidas Slide Espadrilles",
    "description": "A premium quality slide espadrilles meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Adidas",
    "price": 97,
    "discountPercent": 0,
    "stockQuantity": 31,
    "imageSrc": "https://images.unsplash.com/photo-1605733747903-548a78ddb35c?q=80&w=400&auto=format&fit=crop&sig=7",
    "images": [
      "https://images.unsplash.com/photo-1605733747903-548a78ddb35c?q=80&w=400&auto=format&fit=crop&sig=7"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 103,
    "sku": "CC-F-007",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "f8",
    "name": "Puma Ankle Mules",
    "description": "A premium quality ankle mules meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Puma",
    "price": 105,
    "discountPercent": 0,
    "stockQuantity": 34,
    "imageSrc": "https://images.unsplash.com/photo-1612387049887-fa8173070a5c?q=80&w=400&auto=format&fit=crop&sig=8",
    "images": [
      "https://images.unsplash.com/photo-1612387049887-fa8173070a5c?q=80&w=400&auto=format&fit=crop&sig=8"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 116,
    "sku": "CC-F-008",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "f9",
    "name": "Tommy Hilfiger Comfort Slip-Ons",
    "description": "A premium quality comfort slip-ons meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Tommy Hilfiger",
    "price": 112,
    "discountPercent": 0,
    "stockQuantity": 37,
    "imageSrc": "https://images.unsplash.com/photo-1614704879641-de82ab4792be?q=80&w=400&auto=format&fit=crop&sig=9",
    "images": [
      "https://images.unsplash.com/photo-1614704879641-de82ab4792be?q=80&w=400&auto=format&fit=crop&sig=9"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.5,
    "reviewCount": 129,
    "sku": "CC-F-009",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "f10",
    "name": "Levi's Urban Oxford Shoes",
    "description": "A premium quality urban oxford shoes meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Levi's",
    "price": 120,
    "discountPercent": 15,
    "stockQuantity": 40,
    "imageSrc": "https://images.unsplash.com/photo-1615809796000-cebfa8c0de8b?q=80&w=400&auto=format&fit=crop&sig=10",
    "images": [
      "https://images.unsplash.com/photo-1615809796000-cebfa8c0de8b?q=80&w=400&auto=format&fit=crop&sig=10"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 142,
    "sku": "CC-F-010",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "f11",
    "name": "Zara Walking Chelsea Boots",
    "description": "A premium quality walking chelsea boots meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Zara",
    "price": 127,
    "discountPercent": 0,
    "stockQuantity": 43,
    "imageSrc": "https://images.unsplash.com/photo-1616258410292-efcbd3128bca?q=80&w=400&auto=format&fit=crop&sig=11",
    "images": [
      "https://images.unsplash.com/photo-1616258410292-efcbd3128bca?q=80&w=400&auto=format&fit=crop&sig=11"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 155,
    "sku": "CC-F-011",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "f12",
    "name": "H&M Classic Monk Straps",
    "description": "A premium quality classic monk straps meticulously crafted by H&M. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "H&M",
    "price": 135,
    "discountPercent": 0,
    "stockQuantity": 46,
    "imageSrc": "https://images.unsplash.com/photo-1617260533519-de82ab127cdf?q=80&w=400&auto=format&fit=crop&sig=12",
    "images": [
      "https://images.unsplash.com/photo-1617260533519-de82ab127cdf?q=80&w=400&auto=format&fit=crop&sig=12"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.9,
    "reviewCount": 168,
    "sku": "CC-F-012",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "f13",
    "name": "Allen Solly Luxe Running Shoes",
    "description": "A premium quality luxe running shoes meticulously crafted by Allen Solly. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Allen Solly",
    "price": 142,
    "discountPercent": 0,
    "stockQuantity": 49,
    "imageSrc": "https://images.unsplash.com/photo-1618385805124-ceba1a0c8bd0?q=80&w=400&auto=format&fit=crop&sig=13",
    "images": [
      "https://images.unsplash.com/photo-1618385805124-ceba1a0c8bd0?q=80&w=400&auto=format&fit=crop&sig=13"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 181,
    "sku": "CC-F-013",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "f14",
    "name": "Louis Philippe Strap Slides",
    "description": "A premium quality strap slides meticulously crafted by Louis Philippe. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Louis Philippe",
    "price": 150,
    "discountPercent": 0,
    "stockQuantity": 52,
    "imageSrc": "https://images.unsplash.com/photo-1618585483251-deba8c01ab88?q=80&w=400&auto=format&fit=crop&sig=14",
    "images": [
      "https://images.unsplash.com/photo-1618585483251-deba8c01ab88?q=80&w=400&auto=format&fit=crop&sig=14"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 194,
    "sku": "CC-F-014",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "f15",
    "name": "Nike Court Sneakers",
    "description": "A premium quality court sneakers meticulously crafted by Nike. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Nike",
    "price": 157,
    "discountPercent": 10,
    "stockQuantity": 55,
    "imageSrc": "https://images.unsplash.com/photo-1619472390144-fefba1238b0c?q=80&w=400&auto=format&fit=crop&sig=15",
    "images": [
      "https://images.unsplash.com/photo-1619472390144-fefba1238b0c?q=80&w=400&auto=format&fit=crop&sig=15"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.4,
    "reviewCount": 207,
    "sku": "CC-F-015",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "f16",
    "name": "Adidas Running Boots",
    "description": "A premium quality running boots meticulously crafted by Adidas. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Adidas",
    "price": 165,
    "discountPercent": 0,
    "stockQuantity": 58,
    "imageSrc": "https://images.unsplash.com/photo-1620297072440-aebf9c80bd4b?q=80&w=400&auto=format&fit=crop&sig=16",
    "images": [
      "https://images.unsplash.com/photo-1620297072440-aebf9c80bd4b?q=80&w=400&auto=format&fit=crop&sig=16"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.6,
    "reviewCount": 220,
    "sku": "CC-F-016",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "f17",
    "name": "Puma Leather Oxford Loafers",
    "description": "A premium quality leather oxford loafers meticulously crafted by Puma. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Puma",
    "price": 172,
    "discountPercent": 0,
    "stockQuantity": 61,
    "imageSrc": "https://images.unsplash.com/photo-1621280381014-de8ab1238fcf?q=80&w=400&auto=format&fit=crop&sig=17",
    "images": [
      "https://images.unsplash.com/photo-1621280381014-de8ab1238fcf?q=80&w=400&auto=format&fit=crop&sig=17"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.7,
    "reviewCount": 233,
    "sku": "CC-F-017",
    "tags": [
      "Trending"
    ]
  },
  {
    "id": "f18",
    "name": "Tommy Hilfiger Suede Chelsea Derbies",
    "description": "A premium quality suede chelsea derbies meticulously crafted by Tommy Hilfiger. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Tommy Hilfiger",
    "price": 180,
    "discountPercent": 0,
    "stockQuantity": 64,
    "imageSrc": "https://images.unsplash.com/photo-1622284724483-aefbd328ba8c?q=80&w=400&auto=format&fit=crop&sig=18",
    "images": [
      "https://images.unsplash.com/photo-1622284724483-aefbd328ba8c?q=80&w=400&auto=format&fit=crop&sig=18"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.8,
    "reviewCount": 246,
    "sku": "CC-F-018",
    "tags": [
      "New Arrival"
    ]
  },
  {
    "id": "f19",
    "name": "Levi's Canvas Sandals",
    "description": "A premium quality canvas sandals meticulously crafted by Levi's. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Levi's",
    "price": 187,
    "discountPercent": 0,
    "stockQuantity": 67,
    "imageSrc": "https://images.unsplash.com/photo-1623280381014-cefba128a8d0?q=80&w=400&auto=format&fit=crop&sig=19",
    "images": [
      "https://images.unsplash.com/photo-1623280381014-cefba128a8d0?q=80&w=400&auto=format&fit=crop&sig=19"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.2,
    "reviewCount": 19,
    "sku": "CC-F-019",
    "tags": [
      "Best Seller"
    ]
  },
  {
    "id": "f20",
    "name": "Zara Sport Brogues",
    "description": "A premium quality sport brogues meticulously crafted by Zara. Features high-durability fabrics, luxury finish, and tailored sizing options. Perfect for seasonal style.",
    "category": "Footwear",
    "brand": "Zara",
    "price": 195,
    "discountPercent": 20,
    "stockQuantity": 70,
    "imageSrc": "https://images.unsplash.com/photo-1624285805124-ef829abac8db?q=80&w=400&auto=format&fit=crop&sig=20",
    "images": [
      "https://images.unsplash.com/photo-1624285805124-ef829abac8db?q=80&w=400&auto=format&fit=crop&sig=20"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": [
      "Classic Black",
      "Neutral Beige",
      "Navy Blue",
      "Pure White"
    ],
    "rating": 4.3,
    "reviewCount": 32,
    "sku": "CC-F-020",
    "tags": [
      "Trending"
    ]
  }
];
