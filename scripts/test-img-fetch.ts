const urlsToTest = {
  watch: "https://commons.wikimedia.org/wiki/Special:FilePath/Casio_F-91W_5051.jpg",
  blackShoes: "https://commons.wikimedia.org/wiki/Special:FilePath/Black_Oxford_shoes.JPG",
  hoodie: "https://commons.wikimedia.org/wiki/Special:FilePath/Hooded_sweatshirt_by_Gildan_activewear.jpg",
  trousers: "https://commons.wikimedia.org/wiki/Special:FilePath/Chino_trousers_front.JPG",
  velcroShoes: "https://commons.wikimedia.org/wiki/Special:FilePath/Velcro_running_shoes.jpg",
  shorts1: "https://commons.wikimedia.org/wiki/Special:FilePath/Pajama_shorts.jpg",
  sweatshirt: "https://commons.wikimedia.org/wiki/Special:FilePath/Light_blue_sweatshirt.jpg",
  sherwani1: "https://commons.wikimedia.org/wiki/Special:FilePath/Jodhpuri_suit.jpg",
  shorts2: "https://commons.wikimedia.org/wiki/Special:FilePath/Chino_shorts.jpg",
  sherwani2: "https://commons.wikimedia.org/wiki/Special:FilePath/Jodhpuri_suit.jpg",
  loafers: "https://commons.wikimedia.org/wiki/Special:FilePath/Penny_loafers.jpg",
  runningShoes: "https://commons.wikimedia.org/wiki/Special:FilePath/Running_shoe.jpg",
  palazzo: "https://commons.wikimedia.org/wiki/Special:FilePath/Pajamas.jpg"
};

async function testUrls() {
  console.log("Testing Special:FilePath redirect URLs...");
  for (const [key, url] of Object.entries(urlsToTest)) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "LegacyImageMigrationBot/1.0 (contact@skhan-atelier.com)"
        }
      });
      // The response headers will contain the redirected status/size/type
      console.log(`${key}: Status = ${res.status}, Type = ${res.headers.get("content-type")}, Size = ${res.headers.get("content-length")} bytes`);
    } catch (err: any) {
      console.log(`${key}: Failed - ${err.message}`);
    }
  }
}

testUrls();
