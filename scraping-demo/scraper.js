import puppeteer from 'puppeteer';

// Function to launch the browser and open a page
async function launchBrowser() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  return { browser, page };
}

// Scraper for Amazon
async function scrapeAmazon(url) {
  try {
    const { browser, page } = await launchBrowser();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Update the selector for Amazon price element
    await page.waitForSelector('.a-price-whole');
    const price = await page.$eval('.a-price-whole', (priceElement) => {
      return priceElement.textContent.trim();
    });

    console.log('Amazon Product Price:', price);
    await browser.close();
    return price;
  } catch (error) {
    console.error('Error scraping Amazon:', error);
  }
}

// Scraper for Ajio
async function scrapeAjio(url) {
  try {
    const { browser, page } = await launchBrowser();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Update the selector for Ajio price element
    await page.waitForSelector('.prod-sp');
    const price = await page.$eval('.prod-sp', (priceElement) => {
      return priceElement.textContent.trim();
    });

    console.log('Ajio Product Price:', price);
    await browser.close();
    return price;
  } catch (error) {
    console.error('Error scraping Ajio:', error);
  }
}

// Scraper for Flipkart
async function scrapeFlipkart(url) {
  try {
    const { browser, page } = await launchBrowser();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Update the selector for Flipkart price element
    await page.waitForSelector('.Nx9bqj.CxhGGd');
    const price = await page.$eval('.Nx9bqj.CxhGGd', (priceElement) => {
      return priceElement.textContent.trim();
    });

    console.log('Flipkart Product Price:', price);
    await browser.close();
    return price;
  } catch (error) {
    console.error('Error scraping Flipkart:', error);
  }
}

// Scraper for Nykaa
async function scrapeNykaa(url) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-http2'],
    });
    const page = await browser.newPage();

    // Set a mobile user-agent
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    );

    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate to the Nykaa product page
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Update the selector for Nykaa price element
    await page.waitForSelector('.css-1byl9fj'); // Ensure this matches the actual class on the page
    const price = await page.$eval('.css-1byl9fj', (priceElement) => {
      return priceElement.textContent.trim();
    });

    console.log('Nykaa Product Price:', price);
    await browser.close();
    return price;
  } catch (error) {
    console.error('Error scraping Nykaa:', error);
  }
}

// Function to call the appropriate scraper based on the website
async function scrapeWebsite(url) {
  if (url.includes('amazon')) {
    return await scrapeAmazon(url);
  } else if (url.includes('ajio')) {
    return await scrapeAjio(url);
  } else if (url.includes('flipkart')) {
    return await scrapeFlipkart(url);
  } else if (url.includes('nykaa')) {
    return await scrapeNykaa(url);
  } else {
    console.error('Unsupported website:', url);
  }
}

// Test the scrapers
(async () => {
  const ajioUrl = 'https://www.ajio.com/ikon-fashion-solid-regular-fit-shirt/p/700628392_brown';
  const flipkartUrl = 'https://www.flipkart.com/furr-pee-safe-scalp-hair-head-soft-silicone-scrubber-brush-shampoo-reduce-dandruff-massager/p/itme66ee3d59ba36?pid=MASGDJVNGSVT42XJ&lid=LSTMASGDJVNGSVT42XJHOSVEY&marketplace=FLIPKART&store=zlw&srno=b_1_13&otracker=browse&otracker1=hp_rich_navigation_PINNED_neo%2Fmerchandising_NA_NAV_EXPANDABLE_navigationCard_cc_6_L1_view-all&fm=organic&iid=82337a84-7712-442f-91f4-576b171f73ee.MASGDJVNGSVT42XJ.SEARCH&ppt=hp&ppn=homepage&ssid=dhugrwuus00000001736490798915';
  const amazonUrl = 'https://www.amazon.in/LG-Inverter-Technology-Fully-Automatic-FHB1207Z4W/dp/B0DK2FQWJD/';
  const nykaaUrl = 'https://www.nykaafashion.com/kisah-men-grey-kurta-sherwani-churidar-set-set-of-3/p/11113430';

  console.log('Fetching prices...');
  await scrapeWebsite(ajioUrl);
  await scrapeWebsite(flipkartUrl);
  await scrapeWebsite(amazonUrl);
  await scrapeWebsite(nykaaUrl);
})();
