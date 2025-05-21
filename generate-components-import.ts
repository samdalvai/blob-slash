// Run with npx ts-node generate-components-import.ts
import { readdirSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

// Define paths
const componentsDir = join(__dirname, 'src/components');
const outputFile = join(__dirname, 'components.ts');

// Get list of .ts files in the components directory (excluding components.ts)
const files = readdirSync(componentsDir).filter(file => file.endsWith('.ts') && file !== 'components.ts');

// Generate import and type lines
const lines: string[] = [];

files.forEach(file => {
    const componentName = basename(file, '.ts');
    lines.push(`import ${componentName} from '../components/${componentName}';`);
});

lines.push(''); // Add empty line between imports and type declarations

// Step 2: type declarations
const typeNames: string[] = [];

files.forEach(file => {
    const componentName = basename(file, '.ts');
    const typeName = `${componentName}Type`;
    lines.push(`export type ${typeName} = InstanceType<typeof ${componentName}>;`);
    typeNames.push(typeName);
});

lines.push(''); // spacing

// Step 3: union type
lines.push(`export type ComponentType = ${typeNames.join(' | ')};`);

// Write to components.ts
writeFileSync(outputFile, lines.join('\n') + '\n', 'utf8');

console.log(`✅ components.ts generated with ${files.length} components.`);
