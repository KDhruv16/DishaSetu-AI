const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../client/src/pages/organization');
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.jsx')) {
    const fp = path.join(dir, file);
    let content = fs.readFileSync(fp, 'utf8');
    content = content.replace(/['"]\.\.\/\.\.\/\.\.\/utils\/api['"]/g, "'../../utils/api'");
    fs.writeFileSync(fp, content);
  }
});
console.log('Fixed imports');
