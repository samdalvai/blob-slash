import Engine from '../Engine';
import AssetStore from '../asset-store/AssetStore';
import Registry from '../ecs/Registry';
import { deserializeEntities } from '../serialization/deserialization';
import { loadLevelFromLocalStorage } from '../serialization/persistence';
// import { loadLevelFromLocalStorage } from '../serialization/persistence';
import { LevelMap } from '../types/map';

export default class LevelManager {
    private assetStore: AssetStore;

    constructor(assetStore: AssetStore) {
        this.assetStore = assetStore;
    }

    public async addLevelToAssets(levelId: string, levelFilePath: string) {
        console.log('Loading level ' + levelId);
        await this.assetStore.addJson(levelId, levelFilePath);
    }

    public async loadLevelFromAssets(registry: Registry, levelId: string) {
        const level = this.assetStore.getJson(levelId) as LevelMap;

        await this.loadAssets(level);
        this.loadEntities(registry, level);
        this.setMapBoundaries(level);
    }

    public async loadLevelFromLocalStorage(registry: Registry, levelId: string) {
        const level = loadLevelFromLocalStorage(levelId);
        if (!level) {
            throw new Error('Could not read level from local storage');
        }

        await this.loadAssets(level);
        this.loadEntities(registry, level);
        this.setMapBoundaries(level);
    }

    private async loadAssets(level: LevelMap) {
        console.log('Loading default texture');
        await this.assetStore.addTexture('__default__', './assets/sprites/default.png');

        console.log('Loading assets');
        for (const texture of level.textures) {
            await this.assetStore.addTexture(texture.assetId, texture.filePath);
        }

        for (const sound of level.sounds) {
            await this.assetStore.addSound(sound.assetId, sound.filePath);
        }
    }

    private loadEntities(registry: Registry, level: LevelMap) {
        console.log('Loading entities');
        deserializeEntities(level.entities, registry);
    }

    private setMapBoundaries(level: LevelMap) {
        console.log('Setting map boundaries');

        Engine.mapWidth = level.mapWidth;
        Engine.mapHeight = level.mapHeight;
    }
}
