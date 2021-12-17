import table from './EncodeTable.js'
export function encoder(unencodedString) {
  const unencodedStringSplit = unencodedString.split('');
  const octalArray = [];
  unencodedStringSplit.forEach(char => {
    octalArray.push(table[char].octal);
  });

  const octalString = octalArray.join('');
  const octalStringSplit = octalString.split('');
  const decimalArray = [];
  octalStringSplit.forEach(char => {
    decimalArray.push(table[char].decimal);
  });

  const decimalString = decimalArray.join('');
  const decimalStringSplit = decimalString.split('');
  const hexArray = [];
  decimalStringSplit.forEach(char => {
    hexArray.push(table[char].hex);
  });

  const hexString = hexArray.join('');
  const hexStringSplit = hexString.split('');
  const binaryArray = [];
  hexStringSplit.forEach(char => {
    binaryArray.push(table[char].binary);
  });

  const binaryString = binaryArray.join('');
  const binaryStringSplit = binaryString.split('');
  binaryStringSplit.forEach((char,index) => {
  if(char === '0'){
    binaryStringSplit[index] = '1';
  }
  else {
    binaryStringSplit[index] = '0';
  }
  });

  const encodedString = binaryStringSplit.join('');
  return encodedString;
}
export function decoder(encodedString) {
  const itemKeysArray = [];
  const decodeBinaryArray =[];
  const decodeHexArray = [];
  const decodeDecimalArray = [];
  const decodeOctalArray = [];

  Object.keys(table).forEach(item => {
    itemKeysArray.push(item);
    decodeBinaryArray.push(table[item].binary);
    decodeHexArray.push(table[item].hex);
    decodeDecimalArray.push(table[item].decimal);
    decodeOctalArray.push(table[item].octal);
  });

  const decodeTable = {itemKeysArray, decodeBinaryArray, decodeHexArray, decodeDecimalArray, decodeOctalArray};

  const encodedStringSplit = encodedString.split('');
  encodedStringSplit.forEach((char,index) => {
    if (char === '0'){
      encodedStringSplit[index] = '1';
    }
    else {
      encodedStringSplit[index] = '0';
    }
  });

  const bitFlippedString = encodedStringSplit.join('');
  const bitFlippedCharArray = bitFlippedString.match(/(.{1,7})/g);
  const hexArray = [];
  bitFlippedCharArray.forEach(char => {
   const located = decodeTable.decodeBinaryArray.findIndex(element => element === char);
   hexArray.push(located);
  });

  const hexString = hexArray.join('');
  const hexCharArray = hexString.match(/(.{1,2})/g);
  const decimalArray = [];
  hexCharArray.forEach(char => {
    const located = decodeTable.decodeHexArray.findIndex(element => element === char);
    decimalArray.push(located);
  });

  const decimalString = decimalArray.join('');
  const decimalCharArray = decimalString.match(/(.{1,2})/g);
  const octalArray = [];
  decimalCharArray.forEach(char => {
    const located = decodeTable.decodeDecimalArray.findIndex(element => element === char);
    octalArray.push(located);
  });

  const octalString = octalArray.join('');
  const octalCharArray = octalString.match(/(.{1,3})/g);
  const decodedArray = [];
  octalCharArray.forEach(char => {
    const located = decodeTable.decodeOctalArray.findIndex(element => element === char);
    decodedArray.push(located);
  });

  const createStringArray = [];
  decodedArray.forEach(indice => {
    const located = decodeTable.itemKeysArray[indice];
    createStringArray.push(located);
  });

  const decodedString = createStringArray.join('');
  return decodedString;
}
