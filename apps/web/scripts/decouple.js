const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const API_ROOT = path.join(ROOT, '../api/src');

// 1. Remove illegal Mongoose imports from auth/index.ts
const authIndex = path.join(ROOT, 'auth/index.ts');
if (fs.existsSync(authIndex)) {
  let content = fs.readFileSync(authIndex, 'utf8');
  content = content.replace(/import\s+"@\/server\/db\/models";\s*\n?/g, '');
  content = content.replace(/\/\/ Register models\n?/g, '');
  fs.writeFileSync(authIndex, content, 'utf8');
  console.log('Removed illegal mongoose imports from auth/index.ts');
}

// 2. Copy Validators
const webValidatorsDir = path.join(ROOT, 'utils/validation');
const apiValidatorsDir = path.join(API_ROOT, 'validators');
fs.mkdirSync(webValidatorsDir, { recursive: true });

if (fs.existsSync(apiValidatorsDir)) {
  const validators = fs.readdirSync(apiValidatorsDir);
  for (const file of validators) {
    if (file.endsWith('.ts')) {
      const src = path.join(apiValidatorsDir, file);
      const dest = path.join(webValidatorsDir, file);
      fs.copyFileSync(src, dest);
    }
  }
  console.log('Copied validators to apps/web/utils/validation');
}

// 3. Copy Interfaces and Strip Mongoose
const webTypesDir = path.join(ROOT, 'types/backend');
const apiInterfacesDir = path.join(API_ROOT, 'db/interfaces');
fs.mkdirSync(webTypesDir, { recursive: true });

if (fs.existsSync(apiInterfacesDir)) {
  const interfaces = fs.readdirSync(apiInterfacesDir);
  for (const file of interfaces) {
    if (file.endsWith('.ts')) {
      const src = path.join(apiInterfacesDir, file);
      const dest = path.join(webTypesDir, file);
      
      let content = fs.readFileSync(src, 'utf8');
      
      // Strip mongoose dependencies
      content = content.replace(/import .* from ['"]mongoose['"];?\n?/g, '');
      content = content.replace(/ extends Document /g, ' ');
      content = content.replace(/mongoose\.Types\.ObjectId/g, 'string');
      content = content.replace(/Schema\.Types\.ObjectId/g, 'string');
      
      fs.writeFileSync(dest, content, 'utf8');
    }
  }
  console.log('Copied and stripped interfaces to apps/web/types/backend');
}

// 4. Update TSConfig
const tsconfig = path.join(ROOT, 'tsconfig.json');
if (fs.existsSync(tsconfig)) {
  let content = fs.readFileSync(tsconfig, 'utf8');
  // We need to carefully remove the "@/server/*" line
  content = content.replace(/\s*"@\/server\/\*":\s*\[\s*"\.\.\/\.\.\/apps\/api\/src\/\*"\s*\],?\n?/g, '\n');
  fs.writeFileSync(tsconfig, content, 'utf8');
  console.log('Removed @/server alias from tsconfig.json');
}

// 5. Rewrite imports across the web app
const IMPORT_REPLACEMENTS = [
  { from: /@\/server\/validators/g, to: '@/utils/validation' },
  { from: /@\/server\/db\/interfaces/g, to: '@/types/api' },
];

function processFile(filePath) {
  if (!filePath.match(/\.tsx?$/)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  for (const { from, to } of IMPORT_REPLACEMENTS) {
    newContent = newContent.replace(from, to);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath.replace(ROOT, '')}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
        walkDir(fullPath);
      }
    } else {
      processFile(fullPath);
    }
  }
}

console.log('Updating imports across web app...');
walkDir(ROOT);
console.log('Decoupling complete!');
