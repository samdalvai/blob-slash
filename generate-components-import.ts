// Run with npx ts-node generate-components-import.ts
import { readdirSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

// Define paths
const componentsDir = join(__dirname, 'src/components');
const outputFile = join(__dirname, 'components.ts');

// Get list of .ts files in the components directory (excluding components.ts)
const files = readdirSync(componentsDir).filter(file => file.endsWith('.ts') && file !== 'components.ts');

const lines: string[] = [];
const typeNames: string[] = [];

files.forEach(file => {
    const componentName = basename(file, '.ts');
    const typeName = '"' + componentName.replace('Component', '').toLowerCase() + '"';
    typeNames.push(typeName);
});

lines.push(''); // spacing

// Step 3: union type
lines.push(`export type ComponentType = ${typeNames.join(' | ')};`);

// Write to components.ts
writeFileSync(outputFile, lines.join('\n') + '\n', 'utf8');

console.log(`✅ components.ts generated with ${files.length} components.`);
