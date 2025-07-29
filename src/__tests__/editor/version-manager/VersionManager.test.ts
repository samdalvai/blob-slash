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
        expect(versionManager.getLevelVersions('test')![0]).toEqual(level);
        expect(versionManager.getLevelVersionIndex('test')).toBe(0);
        expect(versionManager.getCurrentLevelVersion('test')).toEqual(level);
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
        expect(versionManager.getLevelVersions('test')![1]).toEqual(level2);
        expect(versionManager.getLevelVersionIndex('test')).toBe(1);
        expect(versionManager.getCurrentLevelVersion('test')).toEqual(level2);
    });

    test('Should set level version to a previous one', () => {
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
        versionManager.setPreviousLevelVersion('test');

        expect(versionManager.getCurrentLevelVersion('test')).toEqual(level1);
    });

    test('Should set level version to the next one', () => {
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
        versionManager.setPreviousLevelVersion('test');
        versionManager.setNextLevelVersion('test');

        expect(versionManager.getCurrentLevelVersion('test')).toEqual(level2);
    });

    test('Should throw error when setting non existent level version', () => {
        const versionManager = new VersionManager();

        expect(() => versionManager.setPreviousLevelVersion('test')).toThrowError();
        expect(() => versionManager.setNextLevelVersion('test')).toThrowError();
    });
});
