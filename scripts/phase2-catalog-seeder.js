const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const { randomUUID } = require("crypto");

const env = fs.readFileSync(".env.local", "utf-8");
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

const BRAND_MAP = {
  "t-shirts": ["H&M","Roadster","Jack & Jones","US Polo Assn.","Superdry","Allen Solly","HRX by Hrithik","Bewakoof","Puma"],
  "polo-t-shirts": ["US Polo Assn.","Allen Solly","Arrow","Lacoste","Peter England","Scullers","Louis Philippe"],
  "casual-shirts": ["Roadster","Jack & Jones","H&M","Mufti","Wrogn","United Colors of Benetton","Flying Machine"],
  "formal-shirts": ["Arrow","Van Heusen","Peter England","Louis Philippe","Raymond","Park Avenue","Allen Solly"],
  "hoodies": ["HRX by Hrithik","Roadster","H&M","Jack & Jones","Puma","Nike","Adidas"],
  "sweatshirts": ["H&M","HRX by Hrithik","Roadster","Bewakoof","Jack & Jones","Puma","Adidas"],
  "jackets": ["Roadster","Jack & Jones","H&M","Wildcraft","Columbia","Woodland","Flying Machine"],
  "sweaters": ["H&M","Monte Carlo","United Colors of Benetton","Jack & Jones","Raymond","Mufti"],
  "jeans": ["Levi's","Wrangler","Lee","Flying Machine","Spykar","Jack & Jones","Pepe Jeans"],
  "casual-trousers": ["Allen Solly","Arrow","Van Heusen","Roadster","H&M","United Colors of Benetton"],
  "formal-trousers": ["Arrow","Van Heusen","Louis Philippe","Raymond","Park Avenue","Peter England"],
  "cargo-pants": ["Roadster","US Polo Assn.","Jack & Jones","Spykar","Flying Machine","Mufti"],
  "joggers": ["HRX by Hrithik","Puma","Adidas","Nike","Roadster","Wildcraft","Nivia"],
  "shorts": ["HRX by Hrithik","Puma","Adidas","Nike","H&M","Roadster","US Polo Assn."],
  "kurtas": ["Manyavar","Biba","Fabindia","W","Ethnix","Raymond","Sangria","Anouk"],
  "kurta-sets": ["Manyavar","Biba","Fabindia","Aurelia","W","Ethnix","Soch","Anouk"],
  "sherwanis": ["Manyavar","Mohanlal Sons","Raymond","Ethnix","Jade Blue"],
  "kurtis": ["Biba","W","Aurelia","Fabindia","Libas","Sangria","Anouk","Soch"],
  "sarees": ["Fabindia","Nalli","Taneira","Soch","Ethnix","Suta","BIBA","Libas"],
  "suits": ["W","Biba","Aurelia","Soch","Fabindia","Anouk","Ethnix"],
  "tops": ["H&M","Biba","W","Vero Moda","Only","Roadster","Global Desi","AND"],
  "shirts": ["H&M","Vero Moda","Only","AND","Mango","W","Anouk","Fabindia"],
  "tunics": ["Biba","W","Global Desi","AND","Fabindia","Aurelia","Anouk","Soch"],
  "leggings": ["Biba","W","HRX by Hrithik","Marika","Chromozome","Jockey","Clovia"],
  "trousers": ["W","AND","Vero Moda","Only","H&M","Arrow","Van Heusen"],
  "palazzos": ["Biba","W","Global Desi","Fabindia","AND","Sangria","Aurelia"],
  "skirts": ["Vero Moda","Only","H&M","AND","Mango","Zara","Roadster"],
  "dresses": ["Vero Moda","Only","H&M","AND","Mango","Zara","Roadster","Biba"],
  "jumpsuits": ["Vero Moda","Only","H&M","AND","Zara","ASOS"],
  "co-ords": ["H&M","Vero Moda","Only","Zara","AND","ASOS","Mango"],
  "heels": ["Carlton London","Steve Madden","Inc.5","Catwalk","Clarks","Aldo"],
  "flats": ["Carlton London","Clarks","Tresmode","Metro Shoes","Catwalk","Inc.5"],
  "sneakers": ["Nike","Adidas","Puma","Reebok","Skechers","New Balance","Fila","Vans"],
  "boots": ["Woodland","Clarks","Caterpillar","Red Tape","Timberland","Steve Madden"],
  "sandals": ["Bata","Action","Woodland","Crocs","Clarks","M&B Footwear"],
  "casual-shoes": ["Woodland","Red Tape","Bata","Hush Puppies","Clarks","Adidas"],
  "formal-shoes": ["Red Tape","Bata","Hush Puppies","Clarks","Lee Cooper","Louis Philippe"],
  "running-shoes": ["Nike","Adidas","Puma","Reebok","Skechers","Asics","New Balance"],
  "loafers": ["Woodland","Hush Puppies","Clarks","Red Tape","Lee Cooper","Bata"],
  "school-shoes": ["Bata","Liberty","Action","Khadim's","Lakhani","Paragon"],
  "wallets": ["Fossil","Tommy Hilfiger","Wildcraft","Baggit","Lavie","Hidesign"],
  "belts": ["Tommy Hilfiger","Louis Philippe","Van Heusen","Allen Solly","U.S. Polo Assn."],
  "watches": ["Titan","Fastrack","Casio","Timex","Sonata","Fossil","Seiko"],
  "sunglasses": ["Ray-Ban","Fastrack","Oakley","Titan Eyewear","Vincent Chase","John Jacobs"],
  "backpacks": ["Wildcraft","American Tourister","Skybags","F Gear","Fastrack"],
  "caps": ["Roadster","HRX by Hrithik","Nike","Adidas","Puma","US Polo Assn."],
  "handbags": ["Lavie","Baggit","Hidesign","Esbeda","Da Milano","Steve Madden","Caprese"],
  "jewellery": ["Tanishq","Mia by Tanishq","Melorra","Zaveri Pearls","Shaya","BlueStone"],
  "bags": ["Wildcraft","American Tourister","Skybags","F Gear","Fastrack","Ajanta"],
  "frocks": ["H&M","Hopscotch","U.S. Polo Assn. Kids","Max Fashion","Gini & Jony"],
};
const DEFAULT_BRANDS = ["H&M","Roadster","Puma","Adidas","Max Fashion","Bewakoof"];

const NAME_TEMPLATES = {
  "t-shirts": ["{b} Graphic Print Crew Neck T-Shirt","{b} Solid Round Neck Tee","{b} Typography Print T-Shirt","{b} Striped Cotton T-Shirt","{b} Oversized Drop Shoulder Tee"],
  "polo-t-shirts": ["{b} Classic Polo T-Shirt","{b} Striped Polo Neck Tee","{b} Solid Pique Polo","{b} Tipped Collar Polo T-Shirt"],
  "casual-shirts": ["{b} Check Print Casual Shirt","{b} Linen Casual Shirt","{b} Floral Print Shirt","{b} Stripe Regular Fit Shirt","{b} Oxford Weave Casual Shirt"],
  "formal-shirts": ["{b} Slim Fit Formal Shirt","{b} Regular Fit Oxford Shirt","{b} Wrinkle-Free Formal Shirt","{b} Classic Fit Dress Shirt","{b} Pinstripe Formal Shirt"],
  "hoodies": ["{b} Printed Pullover Hoodie","{b} Zip-Up Fleece Hoodie","{b} Logo Print Hoodie","{b} Tie-Dye Hoodie","{b} Solid Drawstring Hoodie"],
  "sweatshirts": ["{b} Graphic Print Sweatshirt","{b} Solid Crew Neck Sweatshirt","{b} Raglan Sleeve Sweatshirt","{b} Embroidered Logo Sweatshirt"],
  "jackets": ["{b} Puffer Jacket","{b} Bomber Jacket","{b} Windbreaker Jacket","{b} Denim Jacket","{b} Quilted Jacket"],
  "sweaters": ["{b} Cable Knit Sweater","{b} V-Neck Wool Sweater","{b} Crew Neck Pullover","{b} Striped Knit Sweater"],
  "jeans": ["{b} Slim Fit Jeans","{b} Skinny Fit Jeans","{b} Regular Fit Stretch Jeans","{b} Tapered Leg Jeans","{b} Straight Cut Jeans"],
  "casual-trousers": ["{b} Slim Fit Casual Trousers","{b} Regular Fit Chinos","{b} Linen Blend Trousers","{b} Cotton Casual Pants"],
  "formal-trousers": ["{b} Slim Fit Formal Trousers","{b} Regular Fit Dress Pants","{b} Pleated Formal Trousers","{b} Flat Front Formal Pants"],
  "cargo-pants": ["{b} 6-Pocket Cargo Pants","{b} Utility Cargo Trousers","{b} Relaxed Fit Cargo Pants","{b} Multi-Pocket Cargo"],
  "joggers": ["{b} Cotton Jogger Pants","{b} Track Pants with Pockets","{b} Slim Fit Jogger","{b} French Terry Joggers"],
  "shorts": ["{b} Running Shorts","{b} Cargo Shorts","{b} Chino Shorts","{b} Cotton Casual Shorts"],
  "kurtas": ["{b} Printed Straight Kurta","{b} Solid Mandarin Collar Kurta","{b} Embroidered Kurta","{b} Linen Blend Kurta","{b} Nehru Collar Cotton Kurta"],
  "kurta-sets": ["{b} Kurta with Churidar Set","{b} Embroidered Kurta Pyjama Set","{b} Printed Kurta Trouser Set","{b} Festive Kurta Set"],
  "sherwanis": ["{b} Embroidered Sherwani Set","{b} Classic Jodhpuri Sherwani","{b} Brocade Wedding Sherwani","{b} Velvet Sherwani"],
  "kurtis": ["{b} Printed A-Line Kurti","{b} Floral Anarkali Kurti","{b} Embroidered Straight Kurti","{b} Cotton Casual Kurti","{b} Ethnic Print Kurti"],
  "sarees": ["{b} Printed Georgette Saree","{b} Silk Kanjeevaram Saree","{b} Cotton Handloom Saree","{b} Chiffon Saree with Blouse","{b} Banarasi Silk Saree"],
  "suits": ["{b} Salwar Suit Set","{b} Embroidered Anarkali Suit","{b} Cotton Churidar Suit","{b} Patiala Salwar Suit"],
  "tops": ["{b} Floral Print Top","{b} Solid Casual Top","{b} Embroidered Top","{b} Off-Shoulder Top","{b} Ruffled Hem Top"],
  "shirts": ["{b} Floral Print Shirt","{b} Linen Casual Shirt","{b} Check Shirt","{b} Wrap-Around Shirt"],
  "tunics": ["{b} Embroidered Tunic Top","{b} Floral Print Tunic","{b} Long A-Line Tunic","{b} Cotton Casual Tunic"],
  "leggings": ["{b} Cotton Stretch Leggings","{b} Solid Ankle Leggings","{b} Printed Leggings","{b} Slim Fit Jeggings"],
  "trousers": ["{b} Slim Fit Trousers","{b} Flared Formal Trousers","{b} Cigarette Fit Trousers","{b} Straight Leg Trousers"],
  "palazzos": ["{b} Printed Palazzo Pants","{b} Flared Cotton Palazzo","{b} Embroidered Palazzo","{b} Solid Wide-Leg Palazzo"],
  "skirts": ["{b} Flared A-Line Skirt","{b} Midi Wrap Skirt","{b} Pleated Mini Skirt","{b} Printed Maxi Skirt"],
  "dresses": ["{b} Floral Midi Dress","{b} Wrap Dress","{b} Shirt Dress","{b} Bodycon Dress","{b} A-Line Casual Dress"],
  "jumpsuits": ["{b} Solid Belted Jumpsuit","{b} Printed Wide-Leg Jumpsuit","{b} Culotte Jumpsuit","{b} Linen Jumpsuit"],
  "co-ords": ["{b} Printed Co-ord Set","{b} Solid Blazer Co-ord","{b} Tie-Dye Co-ord Set","{b} Floral Co-ord"],
  "heels": ["{b} Block Heel Pumps","{b} Stiletto Heeled Sandals","{b} Ankle Strap Heels","{b} Kitten Heel Mules"],
  "flats": ["{b} Pointed Toe Ballet Flats","{b} Slip-On Flats","{b} Embellished Juttis","{b} Loafer Flats"],
  "sneakers": ["{b} Running Sneakers","{b} Classic Canvas Sneakers","{b} Chunky Sole Sneakers","{b} Low-Top Trainers"],
  "boots": ["{b} Ankle Chelsea Boots","{b} Knee-High Riding Boots","{b} Lace-Up Combat Boots"],
  "sandals": ["{b} Kolhapuri Sandals","{b} Flat Toe-Ring Sandals","{b} Block Heel Sandals","{b} Gladiator Sandals"],
  "casual-shoes": ["{b} Leather Casual Lace-Up","{b} Canvas Sneakers","{b} Suede Derby Shoes","{b} Slip-On Shoes"],
  "formal-shoes": ["{b} Oxford Brogues","{b} Derby Formal Shoes","{b} Monk Strap Shoes","{b} Patent Leather Formal Shoes"],
  "running-shoes": ["{b} Lightweight Running Shoes","{b} Cushioned Training Shoes","{b} Breathable Mesh Runners"],
  "loafers": ["{b} Bit Loafers","{b} Tassel Loafers","{b} Slip-On Penny Loafers","{b} Suede Loafers"],
  "school-shoes": ["{b} Classic Black School Shoes","{b} Lace-Up Leather School Shoes","{b} Velcro School Shoes"],
  "wallets": ["{b} Leather Bi-Fold Wallet","{b} Slim Card Holder Wallet","{b} RFID Blocking Wallet"],
  "belts": ["{b} Leather Formal Belt","{b} Canvas Casual Belt","{b} Reversible Belt"],
  "watches": ["{b} Analog Day-Date Watch","{b} Chronograph Watch","{b} Digital Sports Watch","{b} Slim Dial Watch"],
  "sunglasses": ["{b} Aviator Sunglasses","{b} Wayfarer Sunglasses","{b} Round Frame Sunglasses","{b} Oversized Square Sunglasses"],
  "backpacks": ["{b} 30L Trekking Backpack","{b} Laptop Backpack","{b} Casual Daypack","{b} Urban Commuter Backpack"],
  "caps": ["{b} Logo Baseball Cap","{b} Flat Cap Snapback","{b} Trucker Mesh Cap","{b} Dad Hat Cap"],
  "handbags": ["{b} Tote Bag","{b} Crossbody Bag","{b} Shoulder Bag","{b} Clutch Purse","{b} Hobo Bag"],
  "jewellery": ["{b} Gold Plated Necklace Set","{b} Jhumka Earrings","{b} Kada Bangle Set","{b} Statement Choker"],
  "bags": ["{b} Kids School Backpack","{b} Unicorn Print Bag","{b} Dinosaur Backpack","{b} Trendy Kids Sling Bag"],
  "frocks": ["{b} Floral Print Frock","{b} Embroidered Party Frock","{b} Cotton Casual Frock","{b} Layered Princess Frock"],
};

const IMAGE_POOLS = {
  "t-shirts": ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800","https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800"],
  "polo-t-shirts": ["https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=800","https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800"],
  "casual-shirts": ["https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800","https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800"],
  "formal-shirts": ["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800","https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800"],
  "hoodies": ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800","https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800"],
  "sweatshirts": ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800","https://images.unsplash.com/photo-1600185365778-918c8960b2f2?w=800"],
  "jackets": ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800","https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"],
  "sweaters": ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800","https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800"],
  "jeans": ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800","https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800"],
  "cargo-pants": ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800","https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"],
  "joggers": ["https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800","https://images.unsplash.com/photo-1548032885-b5e38734688a?w=800"],
  "shorts": ["https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800","https://images.unsplash.com/photo-1565339119519-7d63ad604e72?w=800"],
  "formal-trousers": ["https://images.unsplash.com/photo-1594938298603-c8148c4b4086?w=800","https://images.unsplash.com/photo-1559563458-527698bf5295?w=800"],
  "trousers": ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800","https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800"],
  "kurtas": ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800","https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800"],
  "kurta-sets": ["https://images.unsplash.com/photo-1596516109370-29001ec8ec36?w=800","https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=800"],
  "sherwanis": ["https://images.unsplash.com/photo-1631343864-ba43c1540f25?w=800","https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800"],
  "kurtis": ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800","https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=800"],
  "sarees": ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800","https://images.unsplash.com/photo-1629367494173-c78a56567877?w=800"],
  "suits": ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800","https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=800"],
  "tops": ["https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
  "shirts": ["https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800","https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800"],
  "tunics": ["https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=800","https://images.unsplash.com/photo-1538329972958-465d6d2144ed?w=800"],
  "leggings": ["https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800","https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800"],
  "palazzos": ["https://images.unsplash.com/photo-1614945787055-a0c3f68e0673?w=800","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800"],
  "skirts": ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800","https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800"],
  "dresses": ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800","https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800"],
  "jumpsuits": ["https://images.unsplash.com/photo-1589810635657-232948472d98?w=800","https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800"],
  "co-ords": ["https://images.unsplash.com/photo-1521341957697-b93449760f30?w=800","https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800"],
  "heels": ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800","https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800"],
  "flats": ["https://images.unsplash.com/photo-1496440788591-d1004764c3f6?w=800","https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800"],
  "sneakers": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800","https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800"],
  "boots": ["https://images.unsplash.com/photo-1542280756-74b2f55e73ab?w=800","https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800"],
  "sandals": ["https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800","https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800"],
  "casual-shoes": ["https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=800","https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800"],
  "formal-shoes": ["https://images.unsplash.com/photo-1614252235316-8c857196f5f4?w=800","https://images.unsplash.com/photo-1531245423-38a5327a7c7d?w=800"],
  "running-shoes": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800","https://images.unsplash.com/photo-1538325857685-75ec87614a7d?w=800"],
  "loafers": ["https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800","https://images.unsplash.com/photo-1614252235316-8c857196f5f4?w=800"],
  "school-shoes": ["https://images.unsplash.com/photo-1614252235316-8c857196f5f4?w=800","https://images.unsplash.com/photo-1531245423-38a5327a7c7d?w=800"],
  "wallets": ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"],
  "belts": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1624623278313-a930126a11c3?w=800"],
  "watches": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800","https://images.unsplash.com/photo-1591172207264-a7b2e04c0764?w=800"],
  "sunglasses": ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800","https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800"],
  "backpacks": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800"],
  "caps": ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800","https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800"],
  "handbags": ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800"],
  "jewellery": ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800","https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800"],
  "bags": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800"],
  "frocks": ["https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800","https://images.unsplash.com/photo-1524503033411-c9566986fc8f?w=800"],
  "default": ["https://images.unsplash.com/photo-1445205170230-053b83016050?w=800","https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800"],
};

const HSN_MAP = {"t-shirts":{h:"6109",g:12},"polo-t-shirts":{h:"6105",g:12},"casual-shirts":{h:"6205",g:12},"formal-shirts":{h:"6205",g:12},"hoodies":{h:"6110",g:12},"sweatshirts":{h:"6110",g:12},"jackets":{h:"6201",g:12},"sweaters":{h:"6110",g:12},"jeans":{h:"6203",g:12},"casual-trousers":{h:"6203",g:12},"formal-trousers":{h:"6203",g:12},"cargo-pants":{h:"6203",g:12},"joggers":{h:"6211",g:12},"shorts":{h:"6211",g:12},"kurtas":{h:"6211",g:5},"kurta-sets":{h:"6211",g:5},"sherwanis":{h:"6211",g:12},"kurtis":{h:"6211",g:5},"sarees":{h:"5407",g:5},"suits":{h:"6211",g:5},"tops":{h:"6206",g:12},"shirts":{h:"6205",g:12},"tunics":{h:"6206",g:12},"leggings":{h:"6114",g:12},"trousers":{h:"6204",g:12},"palazzos":{h:"6204",g:12},"skirts":{h:"6204",g:12},"dresses":{h:"6204",g:12},"jumpsuits":{h:"6211",g:12},"co-ords":{h:"6211",g:12},"heels":{h:"6402",g:18},"flats":{h:"6402",g:18},"sneakers":{h:"6404",g:18},"boots":{h:"6403",g:18},"sandals":{h:"6402",g:18},"casual-shoes":{h:"6405",g:18},"formal-shoes":{h:"6403",g:18},"running-shoes":{h:"6404",g:18},"loafers":{h:"6403",g:18},"school-shoes":{h:"6404",g:18},"wallets":{h:"4202",g:18},"belts":{h:"4203",g:18},"watches":{h:"9102",g:18},"sunglasses":{h:"9004",g:18},"backpacks":{h:"4202",g:18},"caps":{h:"6505",g:18},"handbags":{h:"4202",g:18},"jewellery":{h:"7117",g:3},"bags":{h:"4202",g:18},"frocks":{h:"6204",g:12}};

const PRICE_RANGES = {"t-shirts":[299,1999],"polo-t-shirts":[499,2999],"casual-shirts":[599,3499],"formal-shirts":[799,4999],"hoodies":[799,4999],"sweatshirts":[599,3499],"jackets":[999,7999],"sweaters":[799,4999],"jeans":[999,5999],"casual-trousers":[699,4499],"formal-trousers":[799,5999],"cargo-pants":[799,3999],"joggers":[499,2999],"shorts":[399,2499],"kurtas":[499,3999],"kurta-sets":[799,6999],"sherwanis":[3999,24999],"kurtis":[399,2999],"sarees":[699,14999],"suits":[799,6999],"tops":[299,2499],"shirts":[499,3499],"tunics":[399,2999],"leggings":[199,1499],"trousers":[699,3999],"palazzos":[399,2499],"skirts":[399,3499],"dresses":[599,5999],"jumpsuits":[999,6999],"co-ords":[1199,7999],"heels":[699,5999],"flats":[499,3999],"sneakers":[999,9999],"boots":[1499,9999],"sandals":[399,3999],"casual-shoes":[799,5999],"formal-shoes":[1299,8999],"running-shoes":[1499,8999],"loafers":[999,6999],"school-shoes":[499,2499],"wallets":[499,4999],"belts":[299,2999],"watches":[999,19999],"sunglasses":[499,9999],"backpacks":[799,5999],"caps":[199,1499],"handbags":[799,7999],"jewellery":[299,9999],"bags":[399,2999],"frocks":[399,2999]};

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length));

function* variantCombinations(groups, attrsByGroup, avsByAttr) {
  const cg = groups.find(g => g.name === "Color");
  const sg = groups.find(g => g.name === "Size") || groups.find(g => g.name === "Shoe Size");
  const og = groups.filter(g => g.name !== "Color" && g.name !== "Size" && g.name !== "Shoe Size");
  const ca = cg ? attrsByGroup[cg.id]?.[0] : null;
  const sa = sg ? attrsByGroup[sg.id]?.[0] : null;
  const colors = ca ? pickN(avsByAttr[ca.id] || [], 3) : [null];
  const sizes = sa ? pickN(avsByAttr[sa.id] || [], 4) : [null];
  const fixed = og.map(g => { const a = attrsByGroup[g.id]?.[0]; if (!a) return null; const av = pick(avsByAttr[a.id] || []); return av ? {attr:a,av} : null; }).filter(Boolean);
  for (const color of colors) {
    for (const size of sizes) {
      const combo = [];
      if (color && ca) combo.push({attr:ca,av:color});
      if (size && sa) combo.push({attr:sa,av:size});
      combo.push(...fixed);
      if (combo.length > 0) yield combo;
    }
  }
}

async function main() {
  console.log("=== Phase 2 Seeder ===");
  const {data:nodes} = await supabase.from("navigation_nodes").select("*").order("full_path");
  const {data:allAG} = await supabase.from("attribute_groups").select("id,name");
  const {data:allA} = await supabase.from("attributes").select("id,name,group_id");
  const {data:allAV} = await supabase.from("attribute_values").select("id,value,attribute_id");
  const {data:nagRows} = await supabase.from("navigation_attribute_groups").select("nav_node_id,attribute_group_id");
  const {data:exSkus} = await supabase.from("product_variants").select("sku");
  const skuSet = new Set(exSkus.map(r=>r.sku));
  const leafNodes = nodes.filter(n => !nodes.some(c => c.parent_id === n.id));
  const agMap = Object.fromEntries(allAG.map(g=>[g.id,g.name]));
  const abg = {}; for (const a of allA) { if (!abg[a.group_id]) abg[a.group_id]=[]; abg[a.group_id].push(a); }
  const aba = {}; for (const av of allAV) { if (!aba[av.attribute_id]) aba[av.attribute_id]=[]; aba[av.attribute_id].push(av); }
  const nagByNode = {}; for (const r of nagRows) { if (!nagByNode[r.nav_node_id]) nagByNode[r.nav_node_id]=[]; nagByNode[r.nav_node_id].push(r.attribute_group_id); }
  const {count:ip} = await supabase.from("products").select("*",{count:"exact",head:true});
  const {count:iv} = await supabase.from("product_variants").select("*",{count:"exact",head:true});
  console.log(`Before: ${ip} products, ${iv} variants`);
  const report = [];
  for (const leaf of leafNodes) {
    const {data:rpc} = await supabase.rpc("filter_products_by_node",{p_nav_node_id:leaf.id});
    const cur = rpc?.totalCount ?? 0;
    const target = rand(14,18);
    const needed = Math.max(0, target - cur);
    const slug = leaf.slug;
    const fp = leaf.full_path;
    const gender = fp.startsWith("men/") ? "men" : fp.startsWith("women/") ? "women" : "kids";
    if (needed === 0) { console.log(`✓ ${fp} (${cur})`); report.push({path:fp,before:cur,added:0,after:cur}); continue; }
    console.log(`→ ${fp}: ${cur} need +${needed}`);
    const gids = nagByNode[leaf.id] || [];
    const effGroups = gids.map(gid=>({id:gid,name:agMap[gid]})).filter(g=>g.name);
    const groups = effGroups.length > 0 ? effGroups : allAG.filter(g=>["Size","Color"].includes(g.name));
    const brands = BRAND_MAP[slug] || DEFAULT_BRANDS;
    const templates = NAME_TEMPLATES[slug] || ["{b} Premium "+leaf.name,"{b} Classic "+leaf.name];
    const imgs = IMAGE_POOLS[slug] || IMAGE_POOLS["default"];
    const hsnInfo = HSN_MAP[slug] || {h:"6211",g:12};
    const pr = PRICE_RANGES[slug] || [499,3999];
    let added = 0;
    for (let i = 0; i < needed; i++) {
      const pid = randomUUID();
      const brand = pick(brands);
      const pname = pick(templates).replace("{b}", brand);
      const bp = rand(pr[0],pr[1]);
      const mrp = Math.round(bp * (1 + rand(10,60)/100));
      const disc = Math.round(((mrp-bp)/mrp)*100);
      const img = pick(imgs);
      const rating = parseFloat((rand(35,50)/10).toFixed(1));
      const rc = rand(15,800);
      const stock = rand(20,300);
      const sp = brand.replace(/[^A-Za-z]/g,"").toUpperCase().substring(0,3) || "PRD";
      const psku = `${sp}-${slug.substring(0,4).toUpperCase()}-${pid.substring(0,6).toUpperCase()}`;
      const {error:pe} = await supabase.from("products").insert({id:pid,name:pname,brand,description:`${pname} — crafted for style and comfort.`,price:bp,images:[img],category:gender,stock,discount_percent:disc,rating,review_count:rc,sku:psku,tags:[brand,slug,gender,"new arrival"],status:"active",gst_rate:hsnInfo.g,hsn_code:hsnInfo.h,nav_node_id:leaf.id});
      if (pe) { console.error("PE:",pe.message); continue; }
      const usedSigs = new Set(); let vc = 0;
      for (const combo of variantCombinations(groups,abg,aba)) {
        if (vc >= 8) break;
        const sig = combo.map(c=>c.av.id).sort().join("|");
        if (usedSigs.has(sig)) continue; usedSigs.add(sig);
        const vid = randomUUID();
        const vsku = `${psku}-${vid.substring(0,6).toUpperCase()}`;
        if (skuSet.has(vsku)) continue; skuSet.add(vsku);
        const vname = combo.map(c=>c.av.value).join(" / ");
        const vp = Math.max(bp+rand(-50,200),100);
        const vd = Math.max(0,Math.round(((mrp-vp)/mrp)*100));
        const {data:vd2,error:ve} = await supabase.from("product_variants").insert({id:vid,product_id:pid,sku:vsku,variant_name:vname,price:vp,discounted_price:Math.max(vp-Math.round(vp*vd/100),100),quantity:rand(5,80),status:"active",images:[],variant_signature:sig}).select("id").single();
        if (ve) continue;
        await supabase.from("variant_attribute_values").insert(combo.map(c=>({id:randomUUID(),variant_id:vid,attribute_id:c.attr.id,attribute_value_id:c.av.id})));
        vc++;
      }
      added++;
    }
    report.push({path:fp,before:cur,added,after:cur+added});
  }
  const {count:fp2} = await supabase.from("products").select("*",{count:"exact",head:true});
  const {count:fv} = await supabase.from("product_variants").select("*",{count:"exact",head:true});
  console.log(`\nAfter: ${fp2} products (+${fp2-ip}), ${fv} variants (+${fv-iv})`);
  fs.writeFileSync("seeder_report.json",JSON.stringify({ip,fp:fp2,iv,fv,report},null,2));
  console.log("Done. Report: seeder_report.json");
}

main().catch(e=>{console.error(e);process.exit(1);});
