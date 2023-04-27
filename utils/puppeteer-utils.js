import puppeteer from 'puppeteer';

export const withBrowser = async (fn) => {
  const browser = await puppeteer.launch({/* ... */});
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
};

export const withPage = (browser) => async (fn) => {
  const page = await browser.newPage();
  try {
    return await fn(page);
  } finally {
    await page.close();
  }
};
