import fs from 'fs';
import path from 'path';

// Vite already processes and bundles all CSS (Tailwind + custom) into dist/style.css
// We just alias it as styles.css for cleaner import paths
const sourceFile = path.resolve('dist/style.css');
const destFile = path.resolve('dist/styles.css');

try {
  fs.copyFileSync(sourceFile, destFile);
  console.log(`✓ Copied CSS to ${destFile}`);
} catch (error) {
  console.error(`Error copying CSS: ${error.message}`);
  process.exit(1);
}
