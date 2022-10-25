import fs from 'fs';
import readline from 'readline';
import fetch from 'node-fetch';
import inquirer from 'inquirer';

const { log } = console;

async function download(relativeFolder, item) {
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
      if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath);
      }
    });
    if (!fs.existsSync(filePath)) {
      const response = item.id ? await fetch(item.url) : await fetch(item);
      const buffer = await response.buffer();
      fs.writeFile(filePath, buffer, () => log(`Downloaded to ${filePath}`));
    }
  } catch (e) {
    log(e);
  }
}

async function readLines(stream) {
  const lineReader = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });
  return new Promise((resolve) => {
    stream.once('error', () => resolve(null));
    const lines = [];
    lineReader.on('line', (line) => lines.push(line));
    lineReader.on('close', () => resolve(lines));
  });
}

const main = async () => {
  const { urlListFileName, destinationFolderName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'urlListFileName',
      message: 'Enter the relative path to the list of image URLs',
      default: './urls.json',
    },
    {
      type: 'input',
      name: 'destinationFolderName',
      message: 'Enter the relative path to the folder the images should download to',
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
    const isImage = /\.jpg|jpeg|jpe|png|gif$/i;
    await Promise.all([
      urls.forEach(async (item) => {
        const url = item.id ? item.url : item;
        if (url.match(isImage)) {
          await download(destinationFolderName, item);
        } else {
          notImages.push(url);
        }
      }),
    ]);
    if (notImages.length) {
      fs.writeFileSync('./notImages.json', JSON.stringify(notImages));
    }
  }
};

main();
