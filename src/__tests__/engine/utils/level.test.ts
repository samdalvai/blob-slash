import { expect } from '@jest/globals';

import { LevelMap } from '../../../engine/types/map';
import { isValidLevelMap } from '../../../engine/utils/validation';

describe('Testing level utils related functions', () => {
    test('Should return true if object is of type LevelMap', () => {
        const levelMap: LevelMap = {
            textures: [],
            sounds: [],
            mapWidth: 0,
            mapHeight: 0,
            entities: [],
        };

        expect(isValidLevelMap(levelMap)).toBe(true);
    });

    test('Should return false if object is missing some property from LevelMap', () => {
        const levelMap = {
            textures: [],
            sounds: [],
            mapWidth: 0,
            mapHeight: 0,
        };

        expect(isValidLevelMap(levelMap)).toBe(false);
    });

    test('Should return false if object is of a completely different type', () => {
        const object = { x: 0, y: 0 };

        expect(isValidLevelMap(object)).toBe(false);
    });
});
