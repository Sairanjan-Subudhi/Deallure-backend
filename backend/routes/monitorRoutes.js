const express = require("express");
const { monitorProductsAndScrape } = require("../services/monitorService");

const router = express.Router();

// Manual trigger monitoring
router.get("/monitor", async (req, res) => {
  try {
    const result = await monitorProductsAndScrape();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error monitoring products:", error.message);
    res.status(500).json({ error: "Failed to monitor products." });
  }
});

module.exports = router;
