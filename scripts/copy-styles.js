import fs from 'fs';
import path from 'path';

const sourceFile = path.resolve('src/styles/index.css');
const destFile = path.resolve('dist/styles.css');

try {
  const content = fs.readFileSync(sourceFile, 'utf-8');
  fs.writeFileSync(destFile, content);
  console.log(`✓ Copied CSS to ${destFile}`);
} catch (error) {
  console.error(`Error copying CSS: ${error.message}`);
  process.exit(1);
}
