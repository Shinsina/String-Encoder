import fs from 'fs';
import inquirer from 'inquirer';
import readLines from '../utils/read-lines.js';
import { returnFieldNames, unravelObject } from './fieldHelpers.js';

const { log } = console;

const { fileLocation, convertTo, hasLabels } = await inquirer.prompt([
  {
    type: 'input',
    name: 'fileLocation',
    message: 'Provide a relative file path to the data file',
    default: './data.json',
  },
  {
    type: 'input',
    name: 'convertTo',
    message: 'Name the file extension for the converted file',
    default: 'txt',
  },
  {
    type: 'confirm',
    name: 'hasLabels',
    message: 'Is this data labeled in the first row?',
    default: true,
    when: (ans) => !ans.fileLocation.match(/json$/),
  },
]);

const isJSON = (filePath) => {
  const fileData = fs.readFileSync(filePath);
  const JSONData = JSON.parse(fileData);
  const formattedData = [];
  if (Array.isArray(JSONData)) {
    JSONData.forEach((item) => {
      formattedData.push(`${unravelObject(item)}\n`);
    });
  } else {
    formattedData.push(`${unravelObject(JSONData)}\n`);
  }
  const fieldNameString = String(returnFieldNames());
  const formattedDataWithFieldNames = [`${fieldNameString}\n`].concat(formattedData);
  return formattedDataWithFieldNames;
};

const isNotJSON = async (filePath) => {
  const fileStream = fs.createReadStream(filePath);
  const lines = await readLines(fileStream);
  return lines.join('\n');
};

// SFT = Supported File Types
const SFT = {
  json: (fileLoc) => isJSON(fileLoc),
  txt: async (fileLoc) => isNotJSON(fileLoc),
  csv: async (fileLoc) => isNotJSON(fileLoc),
  xlsx: async (fileLoc) => isNotJSON(fileLoc),
};

const finalizeData = {
  json: (processedData) => processedData.toString().replace(/\n,/g, '\n'),
  txt: (processedData) => processedData.toString(),
  csv: (processedData) => processedData.toString(),
  xlsx: (processedData) => processedData.toString(),
};

// ISFT = Is Supported File Type
const ISFT = fileLocation.match(/json$|txt$|csv$|xlsx$/)[0];
const fileName = fileLocation.match(/\/(.+)\./)[1];

if (ISFT) {
  const processedData = ISFT === 'json' ? SFT[ISFT](fileLocation) : await SFT[ISFT](fileLocation);
  if (SFT[convertTo]) {
    if (convertTo !== 'json') {
      fs.writeFileSync(`./${fileName}.${convertTo}`, finalizeData[ISFT](processedData));
    } else {
      const keyedOutputObj = {};
      const arrayofDataArrays = [];
      if (hasLabels) {
        const labelsArray = processedData
          .match(/.+\n/)[0]
          .split(',')
          .filter((value) => value !== '\n');
        const filterOutKeys = processedData.match(/.+\n/)[0];
        const dataArrays = processedData.match(/.+\n/g).filter((value) => value !== filterOutKeys);
        dataArrays.forEach((dataArray) => {
          arrayofDataArrays.push(dataArray.split(',').filter((value) => value !== '\n'));
        });
        labelsArray.forEach((label, index) => {
          arrayofDataArrays.forEach((dataArray) => {
            if (keyedOutputObj[label]) {
              keyedOutputObj[label].push(dataArray[index]);
            } else {
              keyedOutputObj[label] = [dataArray[index]];
            }
          });
        });
        fs.writeFileSync(`./${fileName}.${convertTo}`, JSON.stringify(keyedOutputObj));
      } else {
        const dataArrays = processedData.match(/.+\n/g);
        dataArrays.forEach((dataArray, index) => {
          arrayofDataArrays[index] = dataArray.split(',').filter((value) => value !== '\n');
        });
        let longestDataArr = 0;
        arrayofDataArrays.forEach((dataArray) => {
          if (dataArray.length > longestDataArr) {
            longestDataArr = dataArray.length;
          }
        });
        for (let i = 0; i < longestDataArr; i += 1) {
          arrayofDataArrays.forEach((dataArray) => {
            if (keyedOutputObj[i]) {
              keyedOutputObj[i].push(dataArray[i]);
            } else {
              keyedOutputObj[i] = [dataArray[i]];
            }
          });
        }
        fs.writeFileSync(`./${fileName}.${convertTo}`, JSON.stringify(keyedOutputObj));
      }
    }
  } else {
    log(`Cannot convert to ${convertTo} file type`);
  }
} else {
  log('File type is not supported');
}
