import { expect } from '@jest/globals';

import VersionManager from '../../../editor/version-manager/VersionManager';
import { LevelMap } from '../../../engine/types/map';

describe('Testing version manager related functions', () => {
    test('Should add a new level version with no existing versions', () => {
        const versionManager = new VersionManager();

        const level: LevelMap = {
            textures: [],
            sounds: [],
            mapWidth: 100,
            mapHeight: 100,
            entities: [],
        };

        versionManager.addLevelVersion('test', level);
        expect(versionManager.getLevelVersions('test')?.length).toBe(1);
    });

    test('Should add a new level version with existing versions', () => {
        const versionManager = new VersionManager();

        const level1: LevelMap = {
            textures: [],
            sounds: [],
            mapWidth: 100,
            mapHeight: 100,
            entities: [],
        };

        const level2: LevelMap = {
            textures: [],
            sounds: [],
            mapWidth: 200,
            mapHeight: 200,
            entities: [],
        };

        versionManager.addLevelVersion('test', level1);
        versionManager.addLevelVersion('test', level2);
        expect(versionManager.getLevelVersions('test')?.length).toBe(2);
        expect(versionManager.getLevelVersions('test')![1].snapShot).toEqual(level2);
    });
});
