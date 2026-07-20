import type { AdminProduct } from "./AdminService";

export const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    "id": "m1",
    "name": "H&M Men m-1",
    "price": 241,
    "discountPercent": 0,
    "rating": 3.8,
    "reviewCount": 187,
    "category": "Men",
    "brand": "H&M",
    "description": "Luxurious premium travel bag.",
    "imageSrc": "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-1",
    "images": [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-1",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-1-detail-1",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-1-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-M-001",
    "tags": [],
    "stockQuantity": 59
  },
  {
    "id": "m2",
    "name": "Louis Philippe Men m-2",
    "price": 315,
    "discountPercent": 0,
    "rating": 4.1,
    "reviewCount": 39,
    "category": "Men",
    "brand": "Louis Philippe",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-2",
    "images": [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-2",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-2-detail-1",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-2-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-002",
    "tags": [],
    "stockQuantity": 98
  },
  {
    "id": "m3",
    "name": "Zara Men m-3",
    "price": 373,
    "discountPercent": 30,
    "rating": 4,
    "reviewCount": 141,
    "category": "Men",
    "brand": "Zara",
    "description": "Elegant evening dress.",
    "imageSrc": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-3",
    "images": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-3",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-3-detail-1",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-3-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-M-003",
    "tags": [],
    "stockQuantity": 129
  },
  {
    "id": "m4",
    "name": "Adidas Men m-4",
    "price": 244,
    "discountPercent": 40,
    "rating": 3.7,
    "reviewCount": 45,
    "category": "Men",
    "brand": "Adidas",
    "description": "Soft knit organic hoodie.",
    "imageSrc": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-4",
    "images": [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-4",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-4-detail-1",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-4-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-M-004",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 23
  },
  {
    "id": "m5",
    "name": "Levi's Men m-5",
    "price": 196,
    "discountPercent": 40,
    "rating": 4.4,
    "reviewCount": 187,
    "category": "Men",
    "brand": "Levi's",
    "description": "Lightweight running shoes.",
    "imageSrc": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-5",
    "images": [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-5",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-5-detail-1",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-5-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-005",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 152
  },
  {
    "id": "m6",
    "name": "Zara Men m-6",
    "price": 372,
    "discountPercent": 40,
    "rating": 3.9,
    "reviewCount": 17,
    "category": "Men",
    "brand": "Zara",
    "description": "Premium cotton casual shirt.",
    "imageSrc": "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-6",
    "images": [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-6",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-6-detail-1",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-6-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-M-006",
    "tags": [],
    "stockQuantity": 15
  },
  {
    "id": "m7",
    "name": "Adidas Men m-7",
    "price": 325,
    "discountPercent": 0,
    "rating": 3.8,
    "reviewCount": 49,
    "category": "Men",
    "brand": "Adidas",
    "description": "Eco-friendly warm sports socks.",
    "imageSrc": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-7",
    "images": [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-7",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-7-detail-1",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-7-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-007",
    "tags": [],
    "stockQuantity": 109
  },
  {
    "id": "m8",
    "name": "Louis Philippe Men m-8",
    "price": 261,
    "discountPercent": 20,
    "rating": 4.3,
    "reviewCount": 161,
    "category": "Men",
    "brand": "Louis Philippe",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-8",
    "images": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-8",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-8-detail-1",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-8-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-008",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 151
  },
  {
    "id": "m9",
    "name": "Levi's Men m-9",
    "price": 250,
    "discountPercent": 30,
    "rating": 3.6,
    "reviewCount": 120,
    "category": "Men",
    "brand": "Levi's",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-9",
    "images": [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-9",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-9-detail-1",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-9-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-009",
    "tags": [],
    "stockQuantity": 68
  },
  {
    "id": "m10",
    "name": "Puma Men m-10",
    "price": 347,
    "discountPercent": 0,
    "rating": 4.1,
    "reviewCount": 183,
    "category": "Men",
    "brand": "Puma",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-10",
    "images": [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-10",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-10-detail-1",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-10-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-M-010",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 98
  },
  {
    "id": "m11",
    "name": "Tommy Hilfiger Men m-11",
    "price": 370,
    "discountPercent": 0,
    "rating": 4.7,
    "reviewCount": 183,
    "category": "Men",
    "brand": "Tommy Hilfiger",
    "description": "Elegant evening dress.",
    "imageSrc": "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-11",
    "images": [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-11",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-11-detail-1",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-11-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-011",
    "tags": [],
    "stockQuantity": 56
  },
  {
    "id": "m12",
    "name": "Allen Solly Men m-12",
    "price": 297,
    "discountPercent": 10,
    "rating": 3.8,
    "reviewCount": 124,
    "category": "Men",
    "brand": "Allen Solly",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-12",
    "images": [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-12",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-12-detail-1",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-12-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-M-012",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 118
  },
  {
    "id": "m13",
    "name": "Nike Men m-13",
    "price": 101,
    "discountPercent": 0,
    "rating": 4.1,
    "reviewCount": 53,
    "category": "Men",
    "brand": "Nike",
    "description": "Premium cotton casual shirt.",
    "imageSrc": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-13",
    "images": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-13",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-13-detail-1",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-13-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-M-013",
    "tags": [],
    "stockQuantity": 157
  },
  {
    "id": "m14",
    "name": "Nike Men m-14",
    "price": 70,
    "discountPercent": 0,
    "rating": 3.6,
    "reviewCount": 23,
    "category": "Men",
    "brand": "Nike",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-14",
    "images": [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-14",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-14-detail-1",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-14-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-014",
    "tags": [],
    "stockQuantity": 102
  },
  {
    "id": "m15",
    "name": "Adidas Men m-15",
    "price": 142,
    "discountPercent": 20,
    "rating": 3.8,
    "reviewCount": 204,
    "category": "Men",
    "brand": "Adidas",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-15",
    "images": [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-15",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-15-detail-1",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-15-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-M-015",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 138
  },
  {
    "id": "m16",
    "name": "Nike Men m-16",
    "price": 130,
    "discountPercent": 0,
    "rating": 4.1,
    "reviewCount": 114,
    "category": "Men",
    "brand": "Nike",
    "description": "Eco-friendly warm sports socks.",
    "imageSrc": "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-16",
    "images": [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-16",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-16-detail-1",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-16-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-016",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 27
  },
  {
    "id": "m17",
    "name": "Adidas Men m-17",
    "price": 243,
    "discountPercent": 0,
    "rating": 4.3,
    "reviewCount": 56,
    "category": "Men",
    "brand": "Adidas",
    "description": "Soft knit organic hoodie.",
    "imageSrc": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-17",
    "images": [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-17",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-17-detail-1",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-17-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-M-017",
    "tags": [],
    "stockQuantity": 101
  },
  {
    "id": "m18",
    "name": "H&M Men m-18",
    "price": 226,
    "discountPercent": 40,
    "rating": 4.8,
    "reviewCount": 192,
    "category": "Men",
    "brand": "H&M",
    "description": "Comfortable daily wear.",
    "imageSrc": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-18",
    "images": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-18",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-18-detail-1",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-18-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-018",
    "tags": [],
    "stockQuantity": 38
  },
  {
    "id": "m19",
    "name": "Zara Men m-19",
    "price": 380,
    "discountPercent": 0,
    "rating": 4.1,
    "reviewCount": 85,
    "category": "Men",
    "brand": "Zara",
    "description": "Eco-friendly warm sports socks.",
    "imageSrc": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-19",
    "images": [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-19",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-19-detail-1",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-19-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-019",
    "tags": [],
    "stockQuantity": 125
  },
  {
    "id": "m20",
    "name": "Tommy Hilfiger Men m-20",
    "price": 247,
    "discountPercent": 10,
    "rating": 4.2,
    "reviewCount": 140,
    "category": "Men",
    "brand": "Tommy Hilfiger",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-20",
    "images": [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-20",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-20-detail-1",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-20-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-020",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 58
  },
  {
    "id": "m21",
    "name": "Tommy Hilfiger Men m-21",
    "price": 227,
    "discountPercent": 20,
    "rating": 4.4,
    "reviewCount": 19,
    "category": "Men",
    "brand": "Tommy Hilfiger",
    "description": "Soft knit organic hoodie.",
    "imageSrc": "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-21",
    "images": [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-21",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-21-detail-1",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop&sig=m-21-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-M-021",
    "tags": [],
    "stockQuantity": 96
  },
  {
    "id": "m22",
    "name": "H&M Men m-22",
    "price": 172,
    "discountPercent": 0,
    "rating": 4.2,
    "reviewCount": 7,
    "category": "Men",
    "brand": "H&M",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-22",
    "images": [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-22",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-22-detail-1",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop&sig=m-22-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-M-022",
    "tags": [],
    "stockQuantity": 64
  },
  {
    "id": "m23",
    "name": "Nike Men m-23",
    "price": 147,
    "discountPercent": 0,
    "rating": 4.2,
    "reviewCount": 159,
    "category": "Men",
    "brand": "Nike",
    "description": "Elegant evening dress.",
    "imageSrc": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-23",
    "images": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-23",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-23-detail-1",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop&sig=m-23-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-M-023",
    "tags": [],
    "stockQuantity": 32
  },
  {
    "id": "m24",
    "name": "Zara Men m-24",
    "price": 158,
    "discountPercent": 30,
    "rating": 4.5,
    "reviewCount": 19,
    "category": "Men",
    "brand": "Zara",
    "description": "Lightweight running shoes.",
    "imageSrc": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-24",
    "images": [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-24",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-24-detail-1",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop&sig=m-24-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-M-024",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 107
  },
  {
    "id": "m25",
    "name": "Nike Men m-25",
    "price": 376,
    "discountPercent": 0,
    "rating": 3.9,
    "reviewCount": 52,
    "category": "Men",
    "brand": "Nike",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-25",
    "images": [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-25",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-25-detail-1",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop&sig=m-25-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-M-025",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 101
  },
  {
    "id": "w1",
    "name": "H&M Women w-1",
    "price": 266,
    "discountPercent": 20,
    "rating": 4.2,
    "reviewCount": 73,
    "category": "Women",
    "brand": "H&M",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-1",
    "images": [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-1",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-1-detail-1",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-1-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-001",
    "tags": [],
    "stockQuantity": 78
  },
  {
    "id": "w2",
    "name": "Louis Philippe Women w-2",
    "price": 165,
    "discountPercent": 0,
    "rating": 4,
    "reviewCount": 153,
    "category": "Women",
    "brand": "Louis Philippe",
    "description": "Luxurious premium travel bag.",
    "imageSrc": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-2",
    "images": [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-2",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-2-detail-1",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-2-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-W-002",
    "tags": [],
    "stockQuantity": 116
  },
  {
    "id": "w3",
    "name": "Nike Women w-3",
    "price": 188,
    "discountPercent": 10,
    "rating": 4.9,
    "reviewCount": 172,
    "category": "Women",
    "brand": "Nike",
    "description": "Luxurious premium travel bag.",
    "imageSrc": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-3",
    "images": [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-3",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-3-detail-1",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-3-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-W-003",
    "tags": [],
    "stockQuantity": 34
  },
  {
    "id": "w4",
    "name": "Louis Philippe Women w-4",
    "price": 266,
    "discountPercent": 10,
    "rating": 3.9,
    "reviewCount": 107,
    "category": "Women",
    "brand": "Louis Philippe",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-4",
    "images": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-4",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-4-detail-1",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-4-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-W-004",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 53
  },
  {
    "id": "w5",
    "name": "Tommy Hilfiger Women w-5",
    "price": 226,
    "discountPercent": 0,
    "rating": 3.9,
    "reviewCount": 199,
    "category": "Women",
    "brand": "Tommy Hilfiger",
    "description": "Luxurious premium travel bag.",
    "imageSrc": "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-5",
    "images": [
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-5",
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-5-detail-1",
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-5-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-005",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 63
  },
  {
    "id": "w6",
    "name": "Allen Solly Women w-6",
    "price": 250,
    "discountPercent": 0,
    "rating": 4.6,
    "reviewCount": 31,
    "category": "Women",
    "brand": "Allen Solly",
    "description": "Elegant evening dress.",
    "imageSrc": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-6",
    "images": [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-6",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-6-detail-1",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-6-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-W-006",
    "tags": [],
    "stockQuantity": 106
  },
  {
    "id": "w7",
    "name": "Zara Women w-7",
    "price": 223,
    "discountPercent": 40,
    "rating": 3.8,
    "reviewCount": 130,
    "category": "Women",
    "brand": "Zara",
    "description": "Lightweight running shoes.",
    "imageSrc": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-7",
    "images": [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-7",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-7-detail-1",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-7-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-007",
    "tags": [],
    "stockQuantity": 62
  },
  {
    "id": "w8",
    "name": "Levi's Women w-8",
    "price": 117,
    "discountPercent": 0,
    "rating": 4.3,
    "reviewCount": 28,
    "category": "Women",
    "brand": "Levi's",
    "description": "Elegant evening dress.",
    "imageSrc": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-8",
    "images": [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-8",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-8-detail-1",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-8-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-W-008",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 139
  },
  {
    "id": "w9",
    "name": "Allen Solly Women w-9",
    "price": 435,
    "discountPercent": 10,
    "rating": 4.7,
    "reviewCount": 39,
    "category": "Women",
    "brand": "Allen Solly",
    "description": "Luxurious premium travel bag.",
    "imageSrc": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-9",
    "images": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-9",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-9-detail-1",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-9-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-009",
    "tags": [],
    "stockQuantity": 47
  },
  {
    "id": "w10",
    "name": "Tommy Hilfiger Women w-10",
    "price": 287,
    "discountPercent": 0,
    "rating": 3.9,
    "reviewCount": 166,
    "category": "Women",
    "brand": "Tommy Hilfiger",
    "description": "Elegant evening dress.",
    "imageSrc": "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-10",
    "images": [
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-10",
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-10-detail-1",
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-10-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-010",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 65
  },
  {
    "id": "w11",
    "name": "Nike Women w-11",
    "price": 93,
    "discountPercent": 0,
    "rating": 4.1,
    "reviewCount": 147,
    "category": "Women",
    "brand": "Nike",
    "description": "Luxurious premium travel bag.",
    "imageSrc": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-11",
    "images": [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-11",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-11-detail-1",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-11-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-011",
    "tags": [],
    "stockQuantity": 81
  },
  {
    "id": "w12",
    "name": "Allen Solly Women w-12",
    "price": 330,
    "discountPercent": 0,
    "rating": 4.4,
    "reviewCount": 74,
    "category": "Women",
    "brand": "Allen Solly",
    "description": "Comfortable daily wear.",
    "imageSrc": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-12",
    "images": [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-12",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-12-detail-1",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-12-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-012",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 61
  },
  {
    "id": "w13",
    "name": "Allen Solly Women w-13",
    "price": 234,
    "discountPercent": 30,
    "rating": 4.4,
    "reviewCount": 7,
    "category": "Women",
    "brand": "Allen Solly",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-13",
    "images": [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-13",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-13-detail-1",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-13-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-W-013",
    "tags": [],
    "stockQuantity": 42
  },
  {
    "id": "w14",
    "name": "Adidas Women w-14",
    "price": 142,
    "discountPercent": 0,
    "rating": 3.6,
    "reviewCount": 72,
    "category": "Women",
    "brand": "Adidas",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-14",
    "images": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-14",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-14-detail-1",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-14-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-014",
    "tags": [],
    "stockQuantity": 108
  },
  {
    "id": "w15",
    "name": "Tommy Hilfiger Women w-15",
    "price": 262,
    "discountPercent": 10,
    "rating": 4.6,
    "reviewCount": 114,
    "category": "Women",
    "brand": "Tommy Hilfiger",
    "description": "Luxurious premium travel bag.",
    "imageSrc": "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-15",
    "images": [
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-15",
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-15-detail-1",
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-15-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-W-015",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 132
  },
  {
    "id": "w16",
    "name": "H&M Women w-16",
    "price": 333,
    "discountPercent": 0,
    "rating": 3.8,
    "reviewCount": 171,
    "category": "Women",
    "brand": "H&M",
    "description": "Comfortable daily wear.",
    "imageSrc": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-16",
    "images": [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-16",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-16-detail-1",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-16-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-W-016",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 78
  },
  {
    "id": "w17",
    "name": "Adidas Women w-17",
    "price": 125,
    "discountPercent": 0,
    "rating": 3.9,
    "reviewCount": 79,
    "category": "Women",
    "brand": "Adidas",
    "description": "Luxurious premium travel bag.",
    "imageSrc": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-17",
    "images": [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-17",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-17-detail-1",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-17-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-017",
    "tags": [],
    "stockQuantity": 123
  },
  {
    "id": "w18",
    "name": "Nike Women w-18",
    "price": 406,
    "discountPercent": 0,
    "rating": 3.9,
    "reviewCount": 130,
    "category": "Women",
    "brand": "Nike",
    "description": "Comfortable daily wear.",
    "imageSrc": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-18",
    "images": [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-18",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-18-detail-1",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-18-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-018",
    "tags": [],
    "stockQuantity": 39
  },
  {
    "id": "w19",
    "name": "Levi's Women w-19",
    "price": 274,
    "discountPercent": 0,
    "rating": 4.9,
    "reviewCount": 101,
    "category": "Women",
    "brand": "Levi's",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-19",
    "images": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-19",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-19-detail-1",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-19-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-W-019",
    "tags": [],
    "stockQuantity": 33
  },
  {
    "id": "w20",
    "name": "Allen Solly Women w-20",
    "price": 85,
    "discountPercent": 0,
    "rating": 4.8,
    "reviewCount": 89,
    "category": "Women",
    "brand": "Allen Solly",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-20",
    "images": [
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-20",
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-20-detail-1",
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-20-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-W-020",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 106
  },
  {
    "id": "w21",
    "name": "H&M Women w-21",
    "price": 256,
    "discountPercent": 0,
    "rating": 4.2,
    "reviewCount": 72,
    "category": "Women",
    "brand": "H&M",
    "description": "Lightweight running shoes.",
    "imageSrc": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-21",
    "images": [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-21",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-21-detail-1",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop&sig=w-21-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-W-021",
    "tags": [],
    "stockQuantity": 121
  },
  {
    "id": "w22",
    "name": "Tommy Hilfiger Women w-22",
    "price": 129,
    "discountPercent": 0,
    "rating": 4.7,
    "reviewCount": 91,
    "category": "Women",
    "brand": "Tommy Hilfiger",
    "description": "Premium cotton casual shirt.",
    "imageSrc": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-22",
    "images": [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-22",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-22-detail-1",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop&sig=w-22-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-022",
    "tags": [],
    "stockQuantity": 112
  },
  {
    "id": "w23",
    "name": "H&M Women w-23",
    "price": 176,
    "discountPercent": 0,
    "rating": 3.6,
    "reviewCount": 46,
    "category": "Women",
    "brand": "H&M",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-23",
    "images": [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-23",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-23-detail-1",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop&sig=w-23-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-023",
    "tags": [],
    "stockQuantity": 60
  },
  {
    "id": "w24",
    "name": "Nike Women w-24",
    "price": 167,
    "discountPercent": 0,
    "rating": 4.1,
    "reviewCount": 186,
    "category": "Women",
    "brand": "Nike",
    "description": "Comfortable daily wear.",
    "imageSrc": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-24",
    "images": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-24",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-24-detail-1",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop&sig=w-24-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-W-024",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 138
  },
  {
    "id": "w25",
    "name": "Zara Women w-25",
    "price": 103,
    "discountPercent": 0,
    "rating": 4.3,
    "reviewCount": 151,
    "category": "Women",
    "brand": "Zara",
    "description": "Comfortable daily wear.",
    "imageSrc": "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-25",
    "images": [
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-25",
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-25-detail-1",
      "https://images.unsplash.com/photo-1596461404969-9ae700278c41?q=80&w=400&auto=format&fit=crop&sig=w-25-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-W-025",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 120
  },
  {
    "id": "k1",
    "name": "Louis Philippe Kids k-1",
    "price": 208,
    "discountPercent": 10,
    "rating": 4.1,
    "reviewCount": 156,
    "category": "Kids",
    "brand": "Louis Philippe",
    "description": "Eco-friendly warm sports socks.",
    "imageSrc": "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-1",
    "images": [
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-1",
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-1-detail-1",
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-1-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Cream",
    "sku": "CC-K-001",
    "tags": [],
    "stockQuantity": 27
  },
  {
    "id": "k2",
    "name": "Louis Philippe Kids k-2",
    "price": 195,
    "discountPercent": 20,
    "rating": 4,
    "reviewCount": 192,
    "category": "Kids",
    "brand": "Louis Philippe",
    "description": "Soft knit organic hoodie.",
    "imageSrc": "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-2",
    "images": [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-2",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-2-detail-1",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-2-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Charcoal",
    "sku": "CC-K-002",
    "tags": [],
    "stockQuantity": 103
  },
  {
    "id": "k3",
    "name": "H&M Kids k-3",
    "price": 58,
    "discountPercent": 10,
    "rating": 4.7,
    "reviewCount": 17,
    "category": "Kids",
    "brand": "H&M",
    "description": "Lightweight running shoes.",
    "imageSrc": "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-3",
    "images": [
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-3",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-3-detail-1",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-3-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Charcoal",
    "sku": "CC-K-003",
    "tags": [],
    "stockQuantity": 101
  },
  {
    "id": "k4",
    "name": "Tommy Hilfiger Kids k-4",
    "price": 294,
    "discountPercent": 0,
    "rating": 4.6,
    "reviewCount": 143,
    "category": "Kids",
    "brand": "Tommy Hilfiger",
    "description": "Soft knit organic hoodie.",
    "imageSrc": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-4",
    "images": [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-4",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-4-detail-1",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-4-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Olive",
    "sku": "CC-K-004",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 30
  },
  {
    "id": "k5",
    "name": "Tommy Hilfiger Kids k-5",
    "price": 194,
    "discountPercent": 20,
    "rating": 3.9,
    "reviewCount": 83,
    "category": "Kids",
    "brand": "Tommy Hilfiger",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-5",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-5",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-5-detail-1",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-5-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Olive",
    "sku": "CC-K-005",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 78
  },
  {
    "id": "k6",
    "name": "H&M Kids k-6",
    "price": 362,
    "discountPercent": 40,
    "rating": 4.6,
    "reviewCount": 137,
    "category": "Kids",
    "brand": "H&M",
    "description": "Comfortable daily wear.",
    "imageSrc": "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-6",
    "images": [
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-6",
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-6-detail-1",
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-6-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Olive",
    "sku": "CC-K-006",
    "tags": [],
    "stockQuantity": 98
  },
  {
    "id": "k7",
    "name": "Nike Kids k-7",
    "price": 333,
    "discountPercent": 0,
    "rating": 4.4,
    "reviewCount": 82,
    "category": "Kids",
    "brand": "Nike",
    "description": "Premium cotton casual shirt.",
    "imageSrc": "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-7",
    "images": [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-7",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-7-detail-1",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-7-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Cream",
    "sku": "CC-K-007",
    "tags": [],
    "stockQuantity": 141
  },
  {
    "id": "k8",
    "name": "Zara Kids k-8",
    "price": 407,
    "discountPercent": 10,
    "rating": 3.8,
    "reviewCount": 204,
    "category": "Kids",
    "brand": "Zara",
    "description": "Eco-friendly warm sports socks.",
    "imageSrc": "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-8",
    "images": [
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-8",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-8-detail-1",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-8-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Cream",
    "sku": "CC-K-008",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 151
  },
  {
    "id": "k9",
    "name": "Louis Philippe Kids k-9",
    "price": 110,
    "discountPercent": 0,
    "rating": 4.3,
    "reviewCount": 58,
    "category": "Kids",
    "brand": "Louis Philippe",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-9",
    "images": [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-9",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-9-detail-1",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-9-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Cream",
    "sku": "CC-K-009",
    "tags": [],
    "stockQuantity": 42
  },
  {
    "id": "k10",
    "name": "Puma Kids k-10",
    "price": 349,
    "discountPercent": 0,
    "rating": 4.3,
    "reviewCount": 136,
    "category": "Kids",
    "brand": "Puma",
    "description": "Lightweight running shoes.",
    "imageSrc": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-10",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-10",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-10-detail-1",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-10-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Beige",
    "sku": "CC-K-010",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 53
  },
  {
    "id": "k11",
    "name": "Puma Kids k-11",
    "price": 293,
    "discountPercent": 0,
    "rating": 3.9,
    "reviewCount": 26,
    "category": "Kids",
    "brand": "Puma",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-11",
    "images": [
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-11",
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-11-detail-1",
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-11-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Charcoal",
    "sku": "CC-K-011",
    "tags": [],
    "stockQuantity": 156
  },
  {
    "id": "k12",
    "name": "Nike Kids k-12",
    "price": 90,
    "discountPercent": 0,
    "rating": 4,
    "reviewCount": 84,
    "category": "Kids",
    "brand": "Nike",
    "description": "Eco-friendly warm sports socks.",
    "imageSrc": "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-12",
    "images": [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-12",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-12-detail-1",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-12-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Beige",
    "sku": "CC-K-012",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 140
  },
  {
    "id": "k13",
    "name": "H&M Kids k-13",
    "price": 192,
    "discountPercent": 20,
    "rating": 4,
    "reviewCount": 151,
    "category": "Kids",
    "brand": "H&M",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-13",
    "images": [
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-13",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-13-detail-1",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-13-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Cream",
    "sku": "CC-K-013",
    "tags": [],
    "stockQuantity": 157
  },
  {
    "id": "k14",
    "name": "Levi's Kids k-14",
    "price": 198,
    "discountPercent": 0,
    "rating": 4.2,
    "reviewCount": 120,
    "category": "Kids",
    "brand": "Levi's",
    "description": "Luxurious premium travel bag.",
    "imageSrc": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-14",
    "images": [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-14",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-14-detail-1",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-14-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Olive",
    "sku": "CC-K-014",
    "tags": [],
    "stockQuantity": 54
  },
  {
    "id": "k15",
    "name": "Louis Philippe Kids k-15",
    "price": 144,
    "discountPercent": 0,
    "rating": 4.8,
    "reviewCount": 182,
    "category": "Kids",
    "brand": "Louis Philippe",
    "description": "Eco-friendly warm sports socks.",
    "imageSrc": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-15",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-15",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-15-detail-1",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-15-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Beige",
    "sku": "CC-K-015",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 93
  },
  {
    "id": "k16",
    "name": "Adidas Kids k-16",
    "price": 248,
    "discountPercent": 10,
    "rating": 4.1,
    "reviewCount": 185,
    "category": "Kids",
    "brand": "Adidas",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-16",
    "images": [
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-16",
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-16-detail-1",
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-16-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Charcoal",
    "sku": "CC-K-016",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 88
  },
  {
    "id": "k17",
    "name": "Nike Kids k-17",
    "price": 375,
    "discountPercent": 10,
    "rating": 4.7,
    "reviewCount": 67,
    "category": "Kids",
    "brand": "Nike",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-17",
    "images": [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-17",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-17-detail-1",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-17-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Olive",
    "sku": "CC-K-017",
    "tags": [],
    "stockQuantity": 93
  },
  {
    "id": "k18",
    "name": "Zara Kids k-18",
    "price": 413,
    "discountPercent": 0,
    "rating": 4.3,
    "reviewCount": 161,
    "category": "Kids",
    "brand": "Zara",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-18",
    "images": [
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-18",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-18-detail-1",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-18-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Olive",
    "sku": "CC-K-018",
    "tags": [],
    "stockQuantity": 88
  },
  {
    "id": "k19",
    "name": "H&M Kids k-19",
    "price": 363,
    "discountPercent": 0,
    "rating": 4.2,
    "reviewCount": 23,
    "category": "Kids",
    "brand": "H&M",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-19",
    "images": [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-19",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-19-detail-1",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-19-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Charcoal",
    "sku": "CC-K-019",
    "tags": [],
    "stockQuantity": 152
  },
  {
    "id": "k20",
    "name": "Zara Kids k-20",
    "price": 204,
    "discountPercent": 30,
    "rating": 4.6,
    "reviewCount": 141,
    "category": "Kids",
    "brand": "Zara",
    "description": "Premium cotton casual shirt.",
    "imageSrc": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-20",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-20",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-20-detail-1",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-20-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Charcoal",
    "sku": "CC-K-020",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 26
  },
  {
    "id": "k21",
    "name": "Levi's Kids k-21",
    "price": 75,
    "discountPercent": 0,
    "rating": 4.3,
    "reviewCount": 120,
    "category": "Kids",
    "brand": "Levi's",
    "description": "Comfortable daily wear.",
    "imageSrc": "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-21",
    "images": [
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-21",
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-21-detail-1",
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop&sig=k-21-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Charcoal",
    "sku": "CC-K-021",
    "tags": [],
    "stockQuantity": 40
  },
  {
    "id": "k22",
    "name": "Puma Kids k-22",
    "price": 377,
    "discountPercent": 20,
    "rating": 3.7,
    "reviewCount": 41,
    "category": "Kids",
    "brand": "Puma",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-22",
    "images": [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-22",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-22-detail-1",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop&sig=k-22-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Charcoal",
    "sku": "CC-K-022",
    "tags": [],
    "stockQuantity": 58
  },
  {
    "id": "k23",
    "name": "Levi's Kids k-23",
    "price": 256,
    "discountPercent": 10,
    "rating": 4.8,
    "reviewCount": 152,
    "category": "Kids",
    "brand": "Levi's",
    "description": "Premium cotton casual shirt.",
    "imageSrc": "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-23",
    "images": [
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-23",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-23-detail-1",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop&sig=k-23-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Charcoal",
    "sku": "CC-K-023",
    "tags": [],
    "stockQuantity": 146
  },
  {
    "id": "k24",
    "name": "Zara Kids k-24",
    "price": 415,
    "discountPercent": 10,
    "rating": 4.8,
    "reviewCount": 6,
    "category": "Kids",
    "brand": "Zara",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-24",
    "images": [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-24",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-24-detail-1",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop&sig=k-24-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Olive",
    "sku": "CC-K-024",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 46
  },
  {
    "id": "k25",
    "name": "Adidas Kids k-25",
    "price": 254,
    "discountPercent": 0,
    "rating": 4.5,
    "reviewCount": 50,
    "category": "Kids",
    "brand": "Adidas",
    "description": "Soft knit organic hoodie.",
    "imageSrc": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-25",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-25",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-25-detail-1",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop&sig=k-25-detail-2"
    ],
    "size": [
      "XS",
      "S",
      "M"
    ],
    "color": "Olive",
    "sku": "CC-K-025",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 130
  },
  {
    "id": "a1",
    "name": "Allen Solly Accessories a-1",
    "price": 361,
    "discountPercent": 0,
    "rating": 4.8,
    "reviewCount": 184,
    "category": "Accessories",
    "brand": "Allen Solly",
    "description": "Eco-friendly warm sports socks.",
    "imageSrc": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-1",
    "images": [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-1",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-1-detail-1",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-1-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-A-001",
    "tags": [],
    "stockQuantity": 36
  },
  {
    "id": "a2",
    "name": "Levi's Accessories a-2",
    "price": 417,
    "discountPercent": 30,
    "rating": 4.9,
    "reviewCount": 35,
    "category": "Accessories",
    "brand": "Levi's",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-2",
    "images": [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-2",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-2-detail-1",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-2-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-A-002",
    "tags": [],
    "stockQuantity": 124
  },
  {
    "id": "a3",
    "name": "Puma Accessories a-3",
    "price": 411,
    "discountPercent": 20,
    "rating": 3.8,
    "reviewCount": 119,
    "category": "Accessories",
    "brand": "Puma",
    "description": "Lightweight running shoes.",
    "imageSrc": "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-3",
    "images": [
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-3",
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-3-detail-1",
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-3-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-A-003",
    "tags": [],
    "stockQuantity": 112
  },
  {
    "id": "a4",
    "name": "Nike Accessories a-4",
    "price": 123,
    "discountPercent": 0,
    "rating": 4.7,
    "reviewCount": 197,
    "category": "Accessories",
    "brand": "Nike",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-4",
    "images": [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-4",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-4-detail-1",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-4-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-A-004",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 151
  },
  {
    "id": "a5",
    "name": "H&M Accessories a-5",
    "price": 175,
    "discountPercent": 30,
    "rating": 4.7,
    "reviewCount": 89,
    "category": "Accessories",
    "brand": "H&M",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-5",
    "images": [
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-5",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-5-detail-1",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-5-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-A-005",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 66
  },
  {
    "id": "a6",
    "name": "Puma Accessories a-6",
    "price": 253,
    "discountPercent": 20,
    "rating": 4.3,
    "reviewCount": 88,
    "category": "Accessories",
    "brand": "Puma",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-6",
    "images": [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-6",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-6-detail-1",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-6-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-A-006",
    "tags": [],
    "stockQuantity": 16
  },
  {
    "id": "a7",
    "name": "Levi's Accessories a-7",
    "price": 266,
    "discountPercent": 10,
    "rating": 4.7,
    "reviewCount": 23,
    "category": "Accessories",
    "brand": "Levi's",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-7",
    "images": [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-7",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-7-detail-1",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-7-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-A-007",
    "tags": [],
    "stockQuantity": 80
  },
  {
    "id": "a8",
    "name": "Nike Accessories a-8",
    "price": 276,
    "discountPercent": 0,
    "rating": 3.6,
    "reviewCount": 33,
    "category": "Accessories",
    "brand": "Nike",
    "description": "Luxurious premium travel bag.",
    "imageSrc": "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-8",
    "images": [
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-8",
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-8-detail-1",
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-8-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-A-008",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 122
  },
  {
    "id": "a9",
    "name": "Zara Accessories a-9",
    "price": 444,
    "discountPercent": 40,
    "rating": 4.3,
    "reviewCount": 170,
    "category": "Accessories",
    "brand": "Zara",
    "description": "Elegant evening dress.",
    "imageSrc": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-9",
    "images": [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-9",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-9-detail-1",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-9-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-A-009",
    "tags": [],
    "stockQuantity": 159
  },
  {
    "id": "a10",
    "name": "Zara Accessories a-10",
    "price": 113,
    "discountPercent": 0,
    "rating": 4.7,
    "reviewCount": 107,
    "category": "Accessories",
    "brand": "Zara",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-10",
    "images": [
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-10",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-10-detail-1",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-10-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-A-010",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 151
  },
  {
    "id": "a11",
    "name": "Nike Accessories a-11",
    "price": 60,
    "discountPercent": 10,
    "rating": 3.8,
    "reviewCount": 152,
    "category": "Accessories",
    "brand": "Nike",
    "description": "Comfortable daily wear.",
    "imageSrc": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-11",
    "images": [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-11",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-11-detail-1",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop&sig=a-11-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-A-011",
    "tags": [],
    "stockQuantity": 139
  },
  {
    "id": "a12",
    "name": "Levi's Accessories a-12",
    "price": 158,
    "discountPercent": 0,
    "rating": 4.8,
    "reviewCount": 19,
    "category": "Accessories",
    "brand": "Levi's",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-12",
    "images": [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-12",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-12-detail-1",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop&sig=a-12-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-A-012",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 131
  },
  {
    "id": "a13",
    "name": "H&M Accessories a-13",
    "price": 356,
    "discountPercent": 20,
    "rating": 4.6,
    "reviewCount": 178,
    "category": "Accessories",
    "brand": "H&M",
    "description": "Comfortable daily wear.",
    "imageSrc": "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-13",
    "images": [
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-13",
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-13-detail-1",
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop&sig=a-13-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-A-013",
    "tags": [],
    "stockQuantity": 27
  },
  {
    "id": "a14",
    "name": "Louis Philippe Accessories a-14",
    "price": 202,
    "discountPercent": 40,
    "rating": 4.1,
    "reviewCount": 32,
    "category": "Accessories",
    "brand": "Louis Philippe",
    "description": "Premium cotton casual shirt.",
    "imageSrc": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-14",
    "images": [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-14",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-14-detail-1",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop&sig=a-14-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-A-014",
    "tags": [],
    "stockQuantity": 82
  },
  {
    "id": "a15",
    "name": "H&M Accessories a-15",
    "price": 82,
    "discountPercent": 30,
    "rating": 4.3,
    "reviewCount": 23,
    "category": "Accessories",
    "brand": "H&M",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-15",
    "images": [
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-15",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-15-detail-1",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop&sig=a-15-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-A-015",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 149
  },
  {
    "id": "f1",
    "name": "Allen Solly Footwear f-1",
    "price": 53,
    "discountPercent": 40,
    "rating": 4.3,
    "reviewCount": 124,
    "category": "Footwear",
    "brand": "Allen Solly",
    "description": "Comfortable daily wear.",
    "imageSrc": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400&auto=format&fit=crop&sig=f-1",
    "images": [
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400&auto=format&fit=crop&sig=f-1",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400&auto=format&fit=crop&sig=f-1-detail-1",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400&auto=format&fit=crop&sig=f-1-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-F-001",
    "tags": [],
    "stockQuantity": 112
  },
  {
    "id": "f2",
    "name": "Zara Footwear f-2",
    "price": 347,
    "discountPercent": 0,
    "rating": 3.7,
    "reviewCount": 22,
    "category": "Footwear",
    "brand": "Zara",
    "description": "Luxurious premium travel bag.",
    "imageSrc": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop&sig=f-2",
    "images": [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop&sig=f-2",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop&sig=f-2-detail-1",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop&sig=f-2-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-F-002",
    "tags": [],
    "stockQuantity": 20
  },
  {
    "id": "f3",
    "name": "Puma Footwear f-3",
    "price": 320,
    "discountPercent": 40,
    "rating": 4,
    "reviewCount": 115,
    "category": "Footwear",
    "brand": "Puma",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop&sig=f-3",
    "images": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop&sig=f-3",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop&sig=f-3-detail-1",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop&sig=f-3-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-F-003",
    "tags": [],
    "stockQuantity": 28
  },
  {
    "id": "f4",
    "name": "Puma Footwear f-4",
    "price": 93,
    "discountPercent": 0,
    "rating": 4.3,
    "reviewCount": 48,
    "category": "Footwear",
    "brand": "Puma",
    "description": "Eco-friendly warm sports socks.",
    "imageSrc": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop&sig=f-4",
    "images": [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop&sig=f-4",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop&sig=f-4-detail-1",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop&sig=f-4-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-F-004",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 100
  },
  {
    "id": "f5",
    "name": "H&M Footwear f-5",
    "price": 124,
    "discountPercent": 20,
    "rating": 4.4,
    "reviewCount": 151,
    "category": "Footwear",
    "brand": "H&M",
    "description": "Lightweight running shoes.",
    "imageSrc": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop&sig=f-5",
    "images": [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop&sig=f-5",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop&sig=f-5-detail-1",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop&sig=f-5-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Cream",
    "sku": "CC-F-005",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 73
  },
  {
    "id": "f6",
    "name": "Puma Footwear f-6",
    "price": 249,
    "discountPercent": 0,
    "rating": 4.9,
    "reviewCount": 184,
    "category": "Footwear",
    "brand": "Puma",
    "description": "Designer leather watch strap.",
    "imageSrc": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400&auto=format&fit=crop&sig=f-6",
    "images": [
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400&auto=format&fit=crop&sig=f-6",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400&auto=format&fit=crop&sig=f-6-detail-1",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400&auto=format&fit=crop&sig=f-6-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-F-006",
    "tags": [],
    "stockQuantity": 89
  },
  {
    "id": "f7",
    "name": "H&M Footwear f-7",
    "price": 436,
    "discountPercent": 10,
    "rating": 4.5,
    "reviewCount": 86,
    "category": "Footwear",
    "brand": "H&M",
    "description": "Classic slim fit jeans.",
    "imageSrc": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop&sig=f-7",
    "images": [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop&sig=f-7",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop&sig=f-7-detail-1",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop&sig=f-7-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Charcoal",
    "sku": "CC-F-007",
    "tags": [],
    "stockQuantity": 125
  },
  {
    "id": "f8",
    "name": "Allen Solly Footwear f-8",
    "price": 102,
    "discountPercent": 0,
    "rating": 3.9,
    "reviewCount": 69,
    "category": "Footwear",
    "brand": "Allen Solly",
    "description": "Stylish summer collection.",
    "imageSrc": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop&sig=f-8",
    "images": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop&sig=f-8",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop&sig=f-8-detail-1",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop&sig=f-8-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-F-008",
    "tags": [
      "New Arrival"
    ],
    "stockQuantity": 46
  },
  {
    "id": "f9",
    "name": "Adidas Footwear f-9",
    "price": 74,
    "discountPercent": 0,
    "rating": 4.6,
    "reviewCount": 29,
    "category": "Footwear",
    "brand": "Adidas",
    "description": "Lightweight running shoes.",
    "imageSrc": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop&sig=f-9",
    "images": [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop&sig=f-9",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop&sig=f-9-detail-1",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop&sig=f-9-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Beige",
    "sku": "CC-F-009",
    "tags": [],
    "stockQuantity": 96
  },
  {
    "id": "f10",
    "name": "Zara Footwear f-10",
    "price": 378,
    "discountPercent": 40,
    "rating": 4,
    "reviewCount": 137,
    "category": "Footwear",
    "brand": "Zara",
    "description": "Eco-friendly warm sports socks.",
    "imageSrc": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop&sig=f-10",
    "images": [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop&sig=f-10",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop&sig=f-10-detail-1",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop&sig=f-10-detail-2"
    ],
    "size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "color": "Olive",
    "sku": "CC-F-010",
    "tags": [
      "Best Seller",
      "Sale"
    ],
    "stockQuantity": 151
  }
];
