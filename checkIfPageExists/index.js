import fs from 'fs';
import inquirer from 'inquirer';
import bluebird from 'bluebird';
import { withBrowser, withPage } from '../utils/puppeteer-utils.js';

const { log } = console;

const main = async () => {
  const { urlListFileName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'urlListFileName',
      message: 'Enter the relative path to the list of page URLs',
      default: './urls.json',
    },
  ]);
  const urls = [];
  const fileData = fs.readFileSync(urlListFileName);
  urls.push(...JSON.parse(fileData));
  const results = [];
  await withBrowser(async (b) => bluebird.map(urls, async (url, index) => withPage(b)(async (p) => {
    await p.setJavaScriptEnabled(true);
    await p.setDefaultNavigationTimeout(0);
    const response = await p.goto(url, { waitUntil: 'networkidle0' });
    log(`Processing URL ${index} of ${urls.length}`);
    if (response.status() === 200 && (url !== p.url())) {
      results.push({ originalUrl: url, status: 301, finalUrl: p.url() });
    } else {
      results.push({ originalUrl: url, status: response.status(), finalUrl: p.url() });
    }
  }), { concurrency: 5 }));
  fs.writeFileSync('./output.json', JSON.stringify(results));
};

main();
