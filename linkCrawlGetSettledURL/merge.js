import fs from 'fs';

const input = [];
const output = [];
fs.readdirSync('./').forEach((file) => {
  if (file.match(/[0-9]{8}/)) {
    const raw = fs.readFileSync(file);
    const parsed = JSON.parse(raw);
    const { id, url: ironProsURL } = parsed;
    output.push({ _id: Number(id), ironProsURL });
  } else if (file.match('mappings.json')) {
    const raw = fs.readFileSync(file);
    const parsed = JSON.parse(raw);
    Object.keys(parsed).forEach((key) => {
      input.push({ baseID: key, initialURL: parsed[key] });
    });
  }
});

if (input.length === output.length) fs.writeFileSync('./finalOutput.json', JSON.stringify(output));
