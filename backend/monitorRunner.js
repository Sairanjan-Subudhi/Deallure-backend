const { monitorProductsAndScrape } = require("./services/monitorService");

(async () => {
  try {
    await monitorProductsAndScrape();
    console.log("✅ Monitoring complete.");
    process.exit(0); // Exit cleanly
  } catch (error) {
    console.error("❌ Error during monitoring:", error.message);
    process.exit(1);
  }
})();
