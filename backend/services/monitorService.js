const docClient = require("../config/dynamoConfig");
const { scrapeProductPrice } = require("./scraperService"); // Your puppeteer scraper
const { saveScrapeResult } = require("./scrapingService");
const { sendPriceDropAlert } = require("./emailService");

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

async function updateNotificationSent(productID, userEmail) {
  const params = {
    TableName: PRODUCTS_TABLE,
    Key: {
      Product_ID: productID,
      User_Email: userEmail,
    },
    UpdateExpression: "SET NotificationSent = :sent",
    ExpressionAttributeValues: {
      ":sent": true,
    },
  };

  try {
    await docClient.update(params).promise();
    console.log(`✅ NotificationSent updated for Product_ID ${productID}`);
  } catch (error) {
    console.error(`Error updating NotificationSent for ${productID}:`, error.message);
  }
}

async function monitorProductsAndScrape() {
  const trackedProducts = await fetchAllTrackedProducts();

  if (trackedProducts.length === 0) {
    console.log("⚡ No products being tracked currently.");
    return { message: "No products to monitor." };
  }

  for (const product of trackedProducts) {
    const { Product_ID, User_Email, Product_URL, Threshold_Value, NotificationSent } = product;

    if (NotificationSent) {
      console.log(`⏩ Skipping Product_ID ${Product_ID} - notification already sent.`);
      continue; // Skip if already notified
    }

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

      // Save the scrape result (history)
      await saveScrapeResult(Product_ID, User_Email, numericPrice);

      if (numericPrice <= Threshold_Value) {
        console.log(`💥 Price drop detected for Product ID ${Product_ID} - Scraped Price: ${numericPrice}`);

        // ✅ Send email
        await sendPriceDropAlert(User_Email, Product_URL, numericPrice);

        // ✅ Update NotificationSent in Products table
        await updateNotificationSent(Product_ID, User_Email);
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
