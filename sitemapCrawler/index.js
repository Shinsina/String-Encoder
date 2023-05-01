import fs from 'fs';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import inquirer from 'inquirer';

const { log } = console;

const urlsToCrawl = new Set();

const crawlSiteMap = async ({
  sitemapURL,
  replacesWWW,
  iteration,
}) => {
  log(`Handling iteration ${iteration}...`);
  const response = await fetch(sitemapURL);
  const sitemap = await response.text();
  const $ = cheerio.load(sitemap, { xmlMode: true });
  const foundSitemaps = new Set();
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
  const sitemaps = Array.from(foundSitemaps);
  if (sitemaps.length) {
    await Promise.all(sitemaps.map((url) => crawlSiteMap({
      sitemapURL: url,
      replacesWWW,
      iteration: iteration + 1,
    })));
  }
  return null;
};

const parseSiteMap = ({ file, replacesWWW }) => {
  const raw = fs.readFileSync(file).toString();
  const $ = cheerio.load(raw, { xmlMode: true });
  $('loc').each((_, tag) => {
    const [containsURL] = tag.children;
    const { data: url } = containsURL;
    const urlToCrawl = replacesWWW ? url.replace('www', replacesWWW) : url;
    urlsToCrawl.add(urlToCrawl);
  });
};

const main = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isURL',
      message: 'Is the source for the sitemap a URL?',
    },
    {
      type: 'input',
      name: 'sitemapURL',
      message: 'Enter the URL for the sitemap to process (with protocol)',
      when: ({ isURL }) => isURL,
    },
    {
      type: 'input',
      name: 'siteMapsRelativePath',
      message: 'Enter the relative folder for the sitemaps to process',
      default: './input',
      when: ({ isURL }) => !isURL,
    },
    {
      type: 'input',
      name: 'replacesWWW',
      message: 'What should replace www on the URLs to crawl? (Optional)',
    },
  ]);
  const { sitemapURL, siteMapsRelativePath, replacesWWW } = answers;
  const domainName = sitemapURL ? sitemapURL.split('/')[2] : siteMapsRelativePath.split('/').find((value) => value.match(/\w+/));
  if (sitemapURL) {
    await crawlSiteMap({
      sitemapURL,
      replacesWWW,
      iteration: 1,
    });
  } else {
    fs.readdirSync(siteMapsRelativePath).forEach((file) => {
      parseSiteMap({ file: `${siteMapsRelativePath}/${file}`, replacesWWW });
    });
  }

  const outputRelativePath = `./output/${domainName}`;
  if (!fs.existsSync(outputRelativePath)) {
    fs.mkdirSync(outputRelativePath);
  }
  fs.writeFileSync(`${outputRelativePath}/urls.json`, JSON.stringify(Array.from(urlsToCrawl)));
};

main();
