import fs from 'fs';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import inquirer from 'inquirer';

const { log } = console;

const urlsToCrawl = new Set();

const crawlSiteMap = async ({
  sitemapURL,
  isXML,
  replacesWWW,
  iteration,
}) => {
  log(`Handling iteration ${iteration}...`);
  const response = await fetch(sitemapURL);
  const sitemap = await response.text();
  const $ = cheerio.load(sitemap, { xmlMode: isXML });
  const foundSitemaps = new Set();
  if (isXML) {
    $('loc').each((_, tag) => {
      const [containsURL] = tag.children;
      const { data: url } = containsURL;
      if (url.match(/\.xml$/)) {
        foundSitemaps.add(url);
      } else {
        const urlToCrawl = replacesWWW ? url.replace('www', replacesWWW) : url;
        urlsToCrawl.add(urlToCrawl);
      }
    });
  }
  const sitemaps = Array.from(foundSitemaps);
  if (sitemaps.length) {
    await Promise.all(sitemaps.map((url) => crawlSiteMap({
      sitemapURL: url,
      isXML,
      replacesWWW,
      iteration: iteration + 1,
    })));
  }
  return null;
};

const main = async () => {
  const { sitemapURL, isXML, replacesWWW } = await inquirer.prompt([
    {
      type: 'input',
      name: 'sitemapURL',
      message: 'Enter the URL for the sitemap to process (with protocol)',
    },
    {
      type: 'confirm',
      name: 'isXML',
      message: 'Is the sitemap in XML format?',
    },
    {
      type: 'input',
      name: 'replacesWWW',
      message: 'What should replace www on the URLs to crawl? (Optional)',
    },
  ]);
  const domainName = sitemapURL.split('/')[2];
  await crawlSiteMap({
    sitemapURL,
    isXML,
    replacesWWW,
    iteration: 1,
  });
  const outputRelativePath = `./output/${domainName}`;
  if (!fs.existsSync(outputRelativePath)) {
    fs.mkdirSync(outputRelativePath);
  }
  fs.writeFileSync(`${outputRelativePath}/urls.json`, JSON.stringify(Array.from(urlsToCrawl)));
};

main();
