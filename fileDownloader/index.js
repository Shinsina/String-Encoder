import fs from 'fs';
import fetch from 'node-fetch';
import inquirer from 'inquirer';
import readLines from '../utils/read-lines.js';

const { log } = console;

async function download(relativeFolder, item, index) {
  const extractFileName = item.id ? item.url.match(/\/.+?\/(.+)/) : item.match(/\/.+?\/(.+)/);
  const extractedPath = extractFileName[1];
  const pathExploded = extractedPath.split('/');
  const extractedFolderPath = pathExploded.slice(0, -1).join('/');
  const extractedFile = pathExploded.pop();
  try {
    const filePath = item.id
      ? `${relativeFolder}/${extractedFolderPath}/${item.id}_${extractedFile}`
      : `${relativeFolder}/${extractedFolderPath}/${extractedFile}`;
    const buildingPath = [];
    pathExploded.forEach((folder) => {
      buildingPath.push(folder);
      const absolutePath = `${relativeFolder}/${buildingPath.join('/')}`;
      if (!fs.existsSync(decodeURIComponent(absolutePath))) {
        fs.mkdirSync(decodeURIComponent(absolutePath));
      }
    });
    if (!fs.existsSync(decodeURIComponent(filePath))) {
      const response = item.id ? await fetch(item.url) : await fetch(item);
      const arrayBuffer = await response.arrayBuffer();
      fs.createWriteStream(decodeURIComponent(filePath)).write(Buffer.from(arrayBuffer));
    }
    log(index);
  } catch (e) {
    log(e);
  }
}

const main = async () => {
  const { urlListFileName, destinationFolderName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'urlListFileName',
      message: 'Enter the relative path to the list of file URLs',
      default: './urls.json',
    },
    {
      type: 'input',
      name: 'destinationFolderName',
      message: 'Enter the relative path to the folder the files should download to',
      default: './Downloaded',
    },
  ]);
  const urls = [];
  if (urlListFileName.match(/\.txt$/i)) {
    const fileStream = fs.createReadStream(urlListFileName);
    const lines = await readLines(fileStream);
    urls.push(...lines);
  } else if (urlListFileName.match(/\.json$/i)) {
    const fileData = fs.readFileSync(urlListFileName);
    if (Array.isArray(JSON.parse(fileData))) {
      urls.push(...JSON.parse(fileData));
    } else {
      Object.keys(JSON.parse(fileData)).forEach((key) => {
        urls.push(JSON.parse(fileData)[key]);
      });
    }
  } else {
    log('File type is not currently supported');
  }
  if (urls.length) {
    if (!fs.existsSync(destinationFolderName)) {
      fs.mkdirSync(destinationFolderName);
    }
    const notImages = [];
    const isImage = /\.jpg|jpeg|jpe|png|gif|webp|pdf$/i;
    await Promise.all([
      urls.forEach(async (item, index) => {
        const url = item.id ? item.url : item;
        if (!url.match(isImage)) {
          notImages.push(url);
        }
        await download(destinationFolderName, item, index);
      }),
    ]);
    if (notImages.length) {
      fs.writeFileSync('./notImages.json', JSON.stringify(notImages));
    }
  }
};

main();
