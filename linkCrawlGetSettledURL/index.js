import puppeteer from 'puppeteer';
import bluebird from 'bluebird';
import fs from 'fs';

const { log } = console;

const withBrowser = async (fn) => {
  const browser = await puppeteer.launch({/* ... */});
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
};

const withPage = (browser) => async (fn) => {
  const page = await browser.newPage();
  try {
    return await fn(page);
  } finally {
    await page.close();
  }
};

const rawMapping = fs.readFileSync('./mappings.json');
const mapping = JSON.parse(rawMapping);

fs.readdirSync('./').forEach((file) => {
  if (file.match(/[0-9]{8}/)) {
    const [id] = file.match(/[0-9]{8}/);
    delete mapping[id];
  }
});
const urls = Object.values(mapping).map((value) => new URL(value).href);
const reverseMapping = {};

Object.keys(mapping).forEach((key) => {
  reverseMapping[new URL(mapping[key]).href] = key;
});

await withBrowser(async (browser) => bluebird.map(urls, async (url, index) => {
  if (fs.existsSync(`./output-${reverseMapping[url]}`)) return null;
  return withPage(browser)(async (page) => {
    await page.setJavaScriptEnabled(true);
    await page.goto(url, { waitUntil: 'networkidle0' });

    log(`Processing URL ${index} of ${urls.length}`);
    const result = { id: reverseMapping[url], url: page.url() };
    fs.writeFileSync(`./output-${result.id}.json`, JSON.stringify(result));
    return result;
  });
}, { concurrency: 5 }));
