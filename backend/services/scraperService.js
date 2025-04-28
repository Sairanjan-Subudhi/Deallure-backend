// services/scraperService.js
const puppeteer = require('puppeteer');

// async function tryScrape(page, selector, retries = 2) {
//   for (let attempt = 0; attempt < retries; attempt++) {
//     try {
//       await page.waitForSelector(selector, { timeout: 10000 });
//       const price = await page.$eval(selector, el => el.textContent.trim());
//       return price;
//     } catch (error) {
//       console.warn(`⚠️ Attempt ${attempt + 1} failed for selector ${selector}`);
//       if (attempt === retries - 1) throw error; // Throw only after last attempt
//     }
//   }
// }

// Launch browser and get page
async function launchBrowser(options = {}) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-http2',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
    ],
    ...options,
  });
  const page = await browser.newPage();
  return { browser, page };
}

// Set user agent and block unnecessary resources
async function setUserAgentAndBlockResources(page) {
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });
}

// Amazon Scraper
async function scrapeAmazon(url) {
  try {
    const { browser, page } = await launchBrowser();
    await setUserAgentAndBlockResources(page);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.a-price-whole', { timeout: 15000 });

    const price = await page.$eval('.a-price-whole', (el) => el.textContent.trim());
    console.log('Amazon Product Price:', price);

    await browser.close();
    return price;
  } catch (error) {
    console.error('Error scraping Amazon:', error.message);
  }
}

// Ajio Scraper
async function scrapeAjio(url) {
  const { browser, page } = await launchBrowser();
  await setUserAgentAndBlockResources(page);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  await new Promise(resolve => setTimeout(resolve, 3000));
  const selectors = ['.price .prod-sp', '.prod-sp', '.price-section .price', '[class*="price"]'];

  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      const price = await page.$eval(selector, (el) => el.textContent.trim());
      await browser.close();
      return price;
    } catch (err) {}
  }

  await browser.close();
}

// Flipkart Scraper
async function scrapeFlipkart(url) {
  const { browser, page } = await launchBrowser();
  await setUserAgentAndBlockResources(page);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.waitForSelector('.Nx9bqj.CxhGGd', { timeout: 15000 });
  const price = await page.$eval('.Nx9bqj.CxhGGd', (el) => el.textContent.trim());

  await browser.close();
  return price;
}

// Nykaa Scraper
async function scrapeNykaa(url) {
  const { browser, page } = await launchBrowser();
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.waitForSelector('.css-1byl9fj', { timeout: 15000 });
  const price = await page.$eval('.css-1byl9fj', (el) => el.textContent.trim());

  await browser.close();
  return price;
}

// Main export
async function scrapeProductPrice(url) {
  if (url.includes('amazon')) return await scrapeAmazon(url);
  else if (url.includes('ajio')) return await scrapeAjio(url);
  else if (url.includes('flipkart')) return await scrapeFlipkart(url);
  else if (url.includes('nykaa')) return await scrapeNykaa(url);
  else throw new Error('Unsupported website');
}

module.exports = { scrapeProductPrice };
