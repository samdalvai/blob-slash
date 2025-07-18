import { expect } from '@jest/globals';

import { getNextLevelId } from '../../../editor/persistence/persistence';

describe('Testing persistence related functions', () => {
    test('Should get the next available level id with no levels', () => {
        const levelKeys: string[] = [];
        expect(getNextLevelId(levelKeys)).toBe('level-0');
    });

    test('Should get the next available level id with contiguous levels', () => {
        const levelKeys: string[] = ['level-0', 'level-1'];
        expect(getNextLevelId(levelKeys)).toBe('level-2');
    });

    test('Should get the next available level id with levels with hole', () => {
        const levelKeys1: string[] = ['level-0', 'level-2'];
        const levelKeys2: string[] = ['level-1', 'level-2'];

        expect(getNextLevelId(levelKeys1)).toBe('level-1');
        expect(getNextLevelId(levelKeys2)).toBe('level-0');
    });
});
