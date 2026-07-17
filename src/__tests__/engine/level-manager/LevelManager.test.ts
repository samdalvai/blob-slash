import { describe, expect, jest, test } from '@jest/globals';

import AssetStore from '../../../engine/asset-store/AssetStore';
import { createComponentCatalog } from '../../../engine/ecs/ComponentCatalog';
import Registry from '../../../engine/ecs/Registry';
import LevelManager from '../../../engine/level-manager/LevelManager';
import { LevelMap } from '../../../engine/types/map';
import { DEFAULT_SPRITE } from '../../../engine/utils/constants';
import SpriteComponent from '../../../game/components/SpriteComponent';
import TransformComponent from '../../../game/components/TransformComponent';

describe('Testing LevelManager', () => {
    test('Should load level textures and sounds in parallel after the default texture', async () => {
        const loadOrder: string[] = [];
        const pendingAssetLoads: Array<() => void> = [];
        const registry = new Registry();
        const assetStore = {
            clear: jest.fn(),
            addTexture: jest.fn((assetId: string) => {
                loadOrder.push(`texture:${assetId}`);

                if (assetId === DEFAULT_SPRITE) {
                    return Promise.resolve();
                }

                return new Promise<void>(resolve => pendingAssetLoads.push(resolve));
            }),
            addSound: jest.fn((assetId: string) => {
                loadOrder.push(`sound:${assetId}`);
                return new Promise<void>(resolve => pendingAssetLoads.push(resolve));
            }),
        } as unknown as AssetStore;
        const levelManager = new LevelManager(registry, assetStore, createComponentCatalog([]));
        const level: LevelMap = {
            coordinateSystemVersion: 2,
            textures: [
                { assetId: 'texture-1', filePath: '/texture-1.png' },
                { assetId: 'texture-2', filePath: '/texture-2.png' },
            ],
            sounds: [
                { assetId: 'sound-1', filePath: '/sound-1.wav' },
                { assetId: 'sound-2', filePath: '/sound-2.wav' },
            ],
            mapWidth: 100,
            mapHeight: 100,
            entities: [],
        };

        const levelLoadPromise = levelManager.loadLevelFromLevelMap(level);
        await Promise.resolve();

        expect(loadOrder).toEqual([
            'texture:texture-1',
            'texture:texture-2',
            'sound:sound-1',
            'sound:sound-2',
        ]);
        expect(pendingAssetLoads).toHaveLength(4);

        for (const resolveAssetLoad of pendingAssetLoads) {
            resolveAssetLoad();
        }

        await expect(levelLoadPromise).resolves.toBe(level);
    });

    test('Should migrate a v1 level before deserializing its entities', async () => {
        const registry = new Registry();
        const assetStore = { clear: jest.fn() } as unknown as AssetStore;
        const levelManager = new LevelManager(
            registry,
            assetStore,
            createComponentCatalog([
                { name: 'SpriteComponent', constructor: SpriteComponent },
                { name: 'TransformComponent', constructor: TransformComponent },
            ]),
        );
        const legacyLevel: LevelMap = {
            textures: [],
            sounds: [],
            mapWidth: 100,
            mapHeight: 100,
            entities: [
                {
                    components: [
                        {
                            name: 'SpriteComponent',
                            properties: { assetId: DEFAULT_SPRITE, width: 20, height: 10 },
                        },
                        {
                            name: 'TransformComponent',
                            properties: { position: { x: 10, y: 20 }, scale: { x: 1, y: 1 } },
                        },
                    ],
                },
            ],
        };

        const loadedLevel = await levelManager.loadLevelFromLevelMap(legacyLevel);
        registry.update();

        const transform = [...registry.getAllEntities()][0].getComponent(TransformComponent);
        expect(loadedLevel.coordinateSystemVersion).toBe(2);
        expect(transform?.position).toEqual({ x: 20, y: 75 });
        expect(legacyLevel.coordinateSystemVersion).toBeUndefined();
        expect(legacyLevel.entities[0].components[1].properties.position).toEqual({ x: 10, y: 20 });
    });
});
