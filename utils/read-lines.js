import readline from 'readline';

export default async function readLines(stream) {
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
