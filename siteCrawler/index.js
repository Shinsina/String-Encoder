import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import striptags from 'striptags';

const { log } = console;

async function crawl({ url, root }) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(false);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.setViewport({ width: 1800, height: 900 });
  const article = await page.$(root);
  const html = await page.evaluate((a) => a.innerHTML, article);
  await browser.close();
  return { url, html };
}

const crawled = await crawl({ url: 'https://shinsina.github.io', root: 'body' });

const { url, html } = crawled;

const $ = cheerio.load(html, {}, false);

const uniqueURL = new Set();

$('*').each(function fn() {
  if (this.name !== 'script') {
    if (['img', 'a', 'iframe'].includes(this.name)) {
      uniqueURL.add(this.attribs['data-src'] || this.attribs.href || this.attribs.src);
      if (this.attribs['data-src'] || this.attribs.src) {
        $(this).replaceWith(
          $(`<a href="${this.attribs['data-src'] || this.attribs.src}" target="_blank">Link</a> `),
        );
      }
    }
  }
});

const articleData = {
  body: striptags(String($.html()), ['a', 'table', 'tr', 'td', 'th'])
    .replace(/\n/g, '<br/>')
    .replace(/ {2}/g, '')
    .replace(/(<br\/>)+/g, '<br/>'),
  URLS: Array.from(uniqueURL),
  url,
};

log(articleData);
