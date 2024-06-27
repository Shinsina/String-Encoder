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
  const fileData = fs.readFileSync(urlListFileName);
  const urls = JSON.parse(fileData);
  const fetched = [];
  if (Array.isArray(urls) && urls.filter((v) => typeof v === 'string').length) {
    await Promise.all(
      urls.map(async (url, index) => {
        const response = await fetch(url);
        if (response.status === 200 && url !== response.url) {
          fetched.push({ originalUrl: url, status: 301, finalUrl: response.url });
        } else {
          fetched.push({ originalUrl: url, status: response.status, finalUrl: response.url });
        }
        log(`Processing URL ${index + 1} of ${urls.length}`);
      }),
    );
    fs.writeFileSync('./output.json', JSON.stringify(fetched));
  } else {
    log('File provided is not an array of strings!');
  }
};

main();
