const fs = require('fs');
const content = fs.readFileSync('src/data/GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv', 'utf8');
const tsContent = "export const newFomentoCSV = `" + content.replace(/\\/g, '\\\\').replace(/`/g, '\\`') + "`;\n";
fs.writeFileSync('src/data/newFomentoData.ts', tsContent);
