/* eslint-disable no-await-in-loop */
import fs from 'fs';
import inquirer from 'inquirer';
import table from '../encoderAndDecoder/EncodeTable.js';

const { log } = console;

const main = async () => {
  const { numberOfFields } = await inquirer.prompt([
    {
      type: 'number',
      name: 'numberOfFields',
      message: 'Enter the number of fields for this data type',
      default: 0,
    },
  ]);
  const fieldNames = [];
  for (let fieldCounter = 0; fieldCounter < numberOfFields; fieldCounter += 1) {
    const { fieldName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'fieldName',
        message: `What is the name of the ${fieldCounter} field?`,
      },
    ]);
    fieldNames.push(fieldName);
  }
  const fieldHasAcceptedValueList = [];
  for (let fieldNameCounter = 0; fieldNameCounter < fieldNames.length; fieldNameCounter += 1) {
    const { hasAcceptedValueList } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'hasAcceptedValueList',
        message: `Does field: ${fieldNames[fieldNameCounter]} have an accepted value list?`,
        default: false,
      },
    ]);
    fieldHasAcceptedValueList.push(hasAcceptedValueList);
  }
  const fieldPairings = {};
  if (fieldNames.length === fieldHasAcceptedValueList.length) {
    fieldNames.forEach((field, index) => {
      fieldPairings[field] = fieldHasAcceptedValueList[index];
    });
  }
  const hasAcceptedValueList = Object.keys(fieldPairings).filter((key) => fieldPairings[key]);
  const noAcceptedValueList = Object.keys(fieldPairings).filter((key) => !fieldPairings[key]);
  const acceptedValueListFiles = [];
  for (let valCount = 0; valCount < hasAcceptedValueList.length; valCount += 1) {
    const { acceptedValueListFile } = await inquirer.prompt([
      {
        type: 'input',
        name: 'acceptedValueListFile',
        message: `Provide a relative file path to the accepted value list for ${hasAcceptedValueList[valCount]}`,
        default: `./${hasAcceptedValueList[valCount]}.json`,
      },
    ]);
    acceptedValueListFiles.push(acceptedValueListFile);
  }
  const amountTypePairings = {};
  for (let noValCount = 0; noValCount < noAcceptedValueList.length; noValCount += 1) {
    const { numberOfValuesToGenerate, beHTML } = await inquirer.prompt([
      {
        type: 'number',
        name: 'numberOfValuesToGenerate',
        message: `How many values should be generated for ${noAcceptedValueList[noValCount]}?`,
        default: 1,
      },
      {
        type: 'confirm',
        name: 'beHTML',
        message: `Should generated values for ${noAcceptedValueList[noValCount]} be HTML strings?`,
        default: false,
      },
    ]);
    amountTypePairings[noAcceptedValueList[noValCount]] = { numberOfValuesToGenerate, beHTML };
  }
  const acceptableChars = Object.keys(table).filter((char) => char.match(/\w/));
  const masterGeneratedArr = [];
  if (noAcceptedValueList.length) {
    Object.keys(amountTypePairings).forEach((key) => {
      const generatedArrForKey = [];
      for (
        let genIndex = 0;
        genIndex < amountTypePairings[key].numberOfValuesToGenerate;
        genIndex += 1
      ) {
        const generationLength = Math.floor(Math.random() * acceptableChars.length);
        const stringArr = [];
        for (let charIndex = 0; charIndex < generationLength * 500; charIndex += 1) {
          const selectedChar = acceptableChars[Math.floor(Math.random() * generationLength)];
          stringArr.push(selectedChar);
        }
        if (amountTypePairings[key].beHTML) {
          generatedArrForKey.push(`<p>${stringArr.join('')}</p>`);
        } else {
          generatedArrForKey.push(stringArr.join(''));
        }
      }
      masterGeneratedArr.push(generatedArrForKey);
    });
  }
  const finalizeGeneration = {};
  noAcceptedValueList.forEach((item, index) => {
    finalizeGeneration[item] = masterGeneratedArr[index];
  });
  const masterFromFileGenerated = [];
  for (let currFileIndex = 0; currFileIndex < acceptedValueListFiles.length; currFileIndex += 1) {
    const { valuesToGenerateFromList } = await inquirer.prompt([
      {
        type: 'number',
        name: 'valuesToGenerateFromList',
        message: `How many values should be generated for ${hasAcceptedValueList[currFileIndex]}?`,
        default: 1,
      },
    ]);
    try {
      const fileData = fs.readFileSync(acceptedValueListFiles[currFileIndex]);
      const currentKeyAcceptedValues = [...JSON.parse(fileData)];
      const generatedValuesForKey = [];
      for (let genIndex = 0; genIndex < valuesToGenerateFromList; genIndex += 1) {
        const randomIndex = Math.floor(Math.random() * currentKeyAcceptedValues.length);
        generatedValuesForKey.push(currentKeyAcceptedValues[randomIndex]);
      }
      masterFromFileGenerated.push(generatedValuesForKey);
    } catch (e) {
      log(`File not found ${acceptedValueListFiles[currFileIndex]}`);
      masterFromFileGenerated.push([]);
    }
  }
  hasAcceptedValueList.forEach((item, index) => {
    finalizeGeneration[item] = masterFromFileGenerated[index];
  });
  let longestArr = 0;
  const finalGenKeys = Object.keys(finalizeGeneration);
  finalGenKeys.forEach((key) => {
    if (finalizeGeneration[key].length > longestArr) {
      longestArr = finalizeGeneration[key].length;
    }
  });
  const arraysForOuputData = [];
  finalGenKeys.forEach((key) => {
    arraysForOuputData.push(finalizeGeneration[key]);
  });
  const outputDataObjects = [];
  // car = Current Array Index
  for (let car = 0; car < longestArr; car += 1) {
    outputDataObjects.push({});
    for (let index = 0; index < finalGenKeys.length; index += 1) {
      if (finalizeGeneration[finalGenKeys[index]][car]) {
        outputDataObjects[car][finalGenKeys[index]] = finalizeGeneration[finalGenKeys[index]][car];
      } else {
        outputDataObjects[car][finalGenKeys[index]] = '';
      }
    }
  }
  if (outputDataObjects.length) {
    fs.writeFileSync('./output.json', JSON.stringify(outputDataObjects));
  }
};

main();
