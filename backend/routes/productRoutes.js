const express = require("express");
const router = express.Router();
const docClient = require("../config/dynamoConfig");

const TABLE_NAME = "User_Products"; 

router.post("/track", async (req, res) => {
  const { email, productLink, priceThreshold, timeoutPeriod } = req.body;

  if (!email || !productLink || !priceThreshold) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Store product tracking details for the user
    const newTrackingEntry = {
      userEmail: email, 
      productId: `PRODUCT#${Date.now()}`,
      productLink,
      priceThreshold,
      timeoutPeriod,
    };

    await docClient.put({ TableName: TABLE_NAME, Item: newTrackingEntry }).promise();
    
    res.json({ message: "Product tracking details saved successfully" });
  } catch (error) {
    console.error("Error storing tracking details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;