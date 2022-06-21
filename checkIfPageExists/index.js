import fs from 'fs';
import fetch from 'node-fetch';
import inquirer from 'inquirer';

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
  const fetched = await Promise.all(urls.map((url) => fetch(url)));
  const notFounds = fetched.filter((v) => v.status === 404).map((v) => v.url);
  fs.writeFileSync('./notFound.json', JSON.stringify(notFounds));
};

main();
