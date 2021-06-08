const table = require('./EncodeTable')
const testString = 'shinsina@att.net'
const test = testString.split("")
test.forEach(char => {
  console.log(char, table[char] )
})
