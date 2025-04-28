const docClient = require("../config/dynamoConfig");

const SCRAPING_TABLE = "ScrapingTable";

// Save or update scraped price to Scraping
async function saveScrapeResult(productID, userEmail, price) {
  try {
    // 1. First check if an entry already exists using Product_ID and User_Email as PK+SK
    const getParams = {
      TableName: SCRAPING_TABLE,
      Key: {
        Product_ID: productID,
        User_Email: userEmail,
      },
    };

    const data = await docClient.get(getParams).promise();
    const existingItem = data.Item ? data.Item : null;

    if (existingItem) {
      // 2. If exists, UPDATE it
      const updateParams = {
        TableName: SCRAPING_TABLE,
        Key: {
          Product_ID: productID,
          User_Email: userEmail,
        },
        UpdateExpression: "SET ScrapedPrice = :price, Scrape_Timestamp = :timestamp, NotificationSent = :notified",
        ExpressionAttributeValues: {
          ":price": price,
          ":timestamp": new Date().toISOString(),
          ":notified": false,
        },
      };

      await docClient.update(updateParams).promise();
      console.log(`✅ Scrape result updated for Product ID: ${productID}, User Email: ${userEmail}`);
      return { message: "Scrape result updated." };
    } else {
      // 3. If does not exist, PUT a new item
      const putParams = {
        TableName: SCRAPING_TABLE,
        Item: {
          Product_ID: productID,
          User_Email: userEmail,
          ScrapedPrice: price,
          Scrape_Timestamp: new Date().toISOString(),
          NotificationSent: false,
        },
      };

      await docClient.put(putParams).promise();
      console.log(`✅ Scrape result saved for Product ID: ${productID}, User Email: ${userEmail}`);
      return { message: "Scrape result saved." };
    }
  } catch (error) {
    console.error("❌ Error saving or updating scrape result:", error.message);
    throw new Error("Failed to save or update scrape result.");
  }
}

module.exports = {
  saveScrapeResult,
};
