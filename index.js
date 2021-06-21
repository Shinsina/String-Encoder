import { table } from './EncodeTable.js'
export function encoder(unencodedString) {
const unencodedStringSplit = unencodedString.split('')
let octalArray = []
unencodedStringSplit.forEach(char => {
  octalArray.push(table[char].octal)
})
const octalString = octalArray.join('')
const octalStringSplit = octalString.split('')
let decimalArray = []
octalStringSplit.forEach(char => {
  decimalArray.push(table[char].decimal)
})

const decimalString = decimalArray.join('')
const decimalStringSplit = decimalString.split('')
let hexArray = []
decimalStringSplit.forEach(char => {
  hexArray.push(table[char].hex)
})
const hexString = hexArray.join('')
const hexStringSplit = hexString.split('')
let binaryArray = []
hexStringSplit.forEach(char => {
  binaryArray.push(table[char].binary)
})
const binaryString = binaryArray.join('')
const binaryStringSplit = binaryString.split('')
binaryStringSplit.forEach((char,index) => {
  if(char === '0'){
    binaryStringSplit[index] = '1'
  }
  else {
    binaryStringSplit[index] = '0'
  }
})
const encodedString = binaryStringSplit.join('')
return encodedString
}
export function decoder(encodedString) {
  let itemKeysArray = []
  let decodeBinaryArray =[]
  let decodeHexArray = []
  let decodeDecimalArray = []
  let decodeOctalArray = []
  Object.keys(table).forEach(item => {
    itemKeysArray = [...itemKeysArray, item]
    decodeBinaryArray = [...decodeBinaryArray, table[item].binary]
    decodeHexArray = [...decodeHexArray, table[item].hex]
    decodeDecimalArray = [...decodeDecimalArray, table[item].decimal]
    decodeOctalArray = [...decodeOctalArray, table[item].octal]
  })
  let decodeTable = {itemKeysArray, decodeBinaryArray, decodeHexArray, decodeDecimalArray, decodeOctalArray}
  const encodedStringSplit = encodedString.split('')
  encodedStringSplit.forEach((char,index) => {
    if (char === '0'){
      encodedStringSplit[index] = '1'
    }
    else {
      encodedStringSplit[index] = '0'
    }
  })
  const bitFlippedString = encodedStringSplit.join('')
  const bitFlippedCharArray = bitFlippedString.match(/(.{1,7})/g)
  let hexArray = []
  bitFlippedCharArray.forEach(char => {
   const located = decodeTable.decodeBinaryArray.findIndex(element => element === char)
   hexArray.push(located)
  })
  const hexString = hexArray.join('')
  const hexCharArray = hexString.match(/(.{1,2})/g)
  let decimalArray = []
  hexCharArray.forEach(char => {
    const located = decodeTable.decodeHexArray.findIndex(element => element === char)
    decimalArray.push(located)
  })
  const decimalString = decimalArray.join('')
  const decimalCharArray = decimalString.match(/(.{1,2})/g)
  let octalArray = []
  decimalCharArray.forEach(char => {
    const located = decodeTable.decodeDecimalArray.findIndex(element => element === char)
    octalArray.push(located)
  })
  const octalString = octalArray.join('')
  const octalCharArray = octalString.match(/(.{1,3})/g)
  let decodedArray = []
  octalCharArray.forEach(char => {
    const located = decodeTable.decodeOctalArray.findIndex(element => element === char)
    decodedArray.push(located)
  })
  let createStringArray = []
  decodedArray.forEach(indice => {
    const located = decodeTable.itemKeysArray[indice]
    createStringArray.push(located)
  })
  const decodedString = createStringArray.join('')
  return decodedString
}
const testString = '<p>This is a test of how a message service. Might be able to handle encode and decode of messages</p>'
console.log(encoder(testString))
console.log(decoder(encoder(testString)))
