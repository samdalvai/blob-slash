import { migrateEntityMapsToCurrentCoordinates } from '../src/engine/serialization/levelCoordinateMigration';
import { EntityMap } from '../src/engine/types/map';

declare const process: {
    argv: string[];
};
declare const require: (moduleName: string) => {
    readFileSync(filePath: string, encoding: string): string;
    writeFileSync(filePath: string, content: string): void;
};

const fs = require('fs');
const arguments_ = process.argv.slice(2);
const write = arguments_.includes('--write');
const mapHeightIndex = arguments_.indexOf('--map-height');

if (mapHeightIndex === -1 || !arguments_[mapHeightIndex + 1]) {
    throw new Error('Usage: npm run migrate:entitymaps -- --map-height <height> [--write] <entitymap.json> [...]');
}

const sourceMapHeight = Number(arguments_[mapHeightIndex + 1]);
const entityMapPaths = arguments_.filter(
    (argument, index) => argument !== '--write' && argument !== '--map-height' && index !== mapHeightIndex + 1,
);

if (entityMapPaths.length === 0) {
    throw new Error('Provide at least one entity-map JSON file to migrate');
}

for (const entityMapPath of entityMapPaths) {
    const entities = JSON.parse(fs.readFileSync(entityMapPath, 'utf8')) as EntityMap[];
    const migratedEntities = migrateEntityMapsToCurrentCoordinates(entities, sourceMapHeight);

    if (write) {
        fs.writeFileSync(entityMapPath, JSON.stringify(migratedEntities, null, 2) + '\n');
        console.log(`${entityMapPath}: migrated ${migratedEntities.length} entities`);
    } else {
        console.log(`${entityMapPath}: would migrate ${migratedEntities.length} entities`);
    }
}

if (!write) {
    console.log('Dry run only. Re-run with --write after verifying the source map height.');
}
