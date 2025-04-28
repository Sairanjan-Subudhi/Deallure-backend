const docClient = require("../config/dynamoConfig");
const { scrapeProductPrice } = require("./scraperService"); // Your puppeteer scraper
const { saveScrapeResult } = require("./scrapingService");

const PRODUCTS_TABLE = "Products";

async function fetchAllTrackedProducts() {
  const params = {
    TableName: PRODUCTS_TABLE,
  };

  try {
    const data = await docClient.scan(params).promise();
    return data.Items || [];
  } catch (error) {
    console.error("Error fetching tracked products:", error.message);
    throw new Error("Failed to fetch tracked products.");
  }
}

async function monitorProductsAndScrape() {
  const trackedProducts = await fetchAllTrackedProducts();

  if (trackedProducts.length === 0) {
    console.log("⚡ No products being tracked currently.");
    return { message: "No products to monitor." };
  }

  for (const product of trackedProducts) {
    const { Product_ID, User_Email, Product_URL, Threshold_Value } = product;
    
    try {
      const scrapedPriceStr = await scrapeProductPrice(Product_URL);
      
      if (!scrapedPriceStr) {
        console.warn(`⚠️ Failed to scrape product ${Product_ID}`);
        continue;
      }

      // Clean scraped price: Remove commas and parse to number
      const numericPrice = parseFloat(scrapedPriceStr.replace(/[^0-9.]/g, ''));
      if (isNaN(numericPrice)) {
        console.warn(`⚠️ Scraped price invalid for ${Product_ID}:`, scrapedPriceStr);
        continue;
      }

      // Save the scrape result
      await saveScrapeResult(Product_ID, User_Email, numericPrice);

      // Compare price vs threshold
      if (numericPrice <= Threshold_Value) {
        console.log(`💥 Price drop detected for Product ID ${Product_ID} - Scraped Price: ${numericPrice}`);
        // 🚧 SMTP Email Logic will be added later here
      }
    } catch (error) {
      console.error(`Error monitoring product ${Product_ID}:`, error.message);
    }
  }

  return { message: "Monitoring completed." };
}

module.exports = {
  monitorProductsAndScrape,
};
