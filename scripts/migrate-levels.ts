import { CURRENT_COORDINATE_SYSTEM_VERSION, migrateLevelMapToCurrentCoordinates } from '../src/engine/serialization/levelCoordinateMigration';
import { LevelMap } from '../src/engine/types/map';

declare const process: {
    argv: string[];
};
declare const require: (moduleName: string) => {
    readFileSync(filePath: string, encoding: string): string;
    writeFileSync(filePath: string, content: string): void;
};

const fs = require('fs');
const arguments_ = process.argv.slice(2);
const write = arguments_[0] === '--write';
const levelPaths = write ? arguments_.slice(1) : arguments_;

if (levelPaths.length === 0) {
    throw new Error('Usage: npm run migrate:levels -- [--write] <level.json> [...]');
}

for (const levelPath of levelPaths) {
    const level = JSON.parse(fs.readFileSync(levelPath, 'utf8')) as LevelMap;
    const migratedLevel = migrateLevelMapToCurrentCoordinates(level);

    if (level.coordinateSystemVersion === CURRENT_COORDINATE_SYSTEM_VERSION) {
        console.log(`${levelPath}: already uses coordinate-system version ${CURRENT_COORDINATE_SYSTEM_VERSION}`);
        continue;
    }

    if (write) {
        fs.writeFileSync(levelPath, JSON.stringify(migratedLevel, null, 2) + '\n');
        console.log(`${levelPath}: migrated to coordinate-system version ${CURRENT_COORDINATE_SYSTEM_VERSION}`);
    } else {
        console.log(`${levelPath}: would migrate to coordinate-system version ${CURRENT_COORDINATE_SYSTEM_VERSION}`);
    }
}

if (!write) {
    console.log('Dry run only. Re-run with --write after visual verification to rewrite these files.');
}
