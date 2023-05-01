import fs from 'fs';
import fetch from 'node-fetch';
import inquirer from 'inquirer';
import bluebird from 'bluebird';

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
  const fetched = [];
  await bluebird.map(urls, async (url, index) => {
    log(`Processing URL ${index} of ${urls.length}`);
    const response = await fetch(url);
    if (response.status === 200 && (url !== response.url)) {
      fetched.push({ originalUrl: url, status: 301, finalUrl: response.url });
    } else {
      fetched.push({ originalUrl: url, status: response.status, finalUrl: response.url });
    }
  }, { concurrency: 5 });
  fs.writeFileSync('./output.json', JSON.stringify(fetched));
};

main();
