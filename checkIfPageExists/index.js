import fs from 'fs';
import fetch from 'node-fetch';
import inquirer from 'inquirer';

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
  const fetched = await Promise.all(urls.map(async (url, index) => {
    let response = '';
    try {
      const fetchOp = await fetch(url, { signal: AbortSignal.timeout(10000) });
      log(`Attempting to fetch ${index} of ${urls.length}...`);
      response = { url, status: fetchOp.status };
    } catch (error) {
      response = { url, status: 404 };
    }
    return response;
  }));
  const notFounds = fetched.filter((v) => v.status === 404).map((v) => v.url);
  fs.writeFileSync('./notFound.json', JSON.stringify(notFounds));
};

main();
