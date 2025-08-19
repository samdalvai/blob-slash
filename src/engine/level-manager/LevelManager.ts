import { showAlert } from '../../editor/gui';
import Engine from '../Engine';
import AssetStore from '../asset-store/AssetStore';
import Registry from '../ecs/Registry';
import { deserializeEntities } from '../serialization/deserialization';
import { loadLevelFromLocalStorage, saveLevelToLocalStorage } from '../serialization/persistence';
import { LevelMap } from '../types/map';
import { DEFAULT_SPRITE } from '../utils/constants';

export default class LevelManager {
    private registry: Registry;
    private assetStore: AssetStore;

    constructor(registry: Registry, assetStore: AssetStore) {
        this.registry = registry;
        this.assetStore = assetStore;
    }

    public async addLevelToAssets(levelId: string, levelFilePath: string) {
        console.log('Loading level ' + levelId);
        await this.assetStore.addJson(levelId, levelFilePath);
    }

    public async loadLevelFromAssets(levelId: string) {
        const level = this.assetStore.getJson(levelId) as LevelMap;
        return this.loadLevelFromLevelMap(level);
    }

    public async loadLevelFromLevelMap(level: LevelMap) {
        this.assetStore.clear();
        this.registry.clear();

        await this.loadAssets(level);
        this.loadEntities(level);
        this.setMapBoundaries(level);

        return level;
    }

    public async loadLevelFromLocalStorage(levelId: string) {
        let level = loadLevelFromLocalStorage(levelId);
        if (!level) {
            showAlert('Level with id "' + levelId + '" could not be loaded, a default level has been generated');
            level = this.getDefaultLevel(levelId).level;
            saveLevelToLocalStorage(levelId, level);
        }

        this.assetStore.clear();
        this.registry.clear();

        await this.loadAssets(level);
        this.loadEntities(level);
        this.setMapBoundaries(level);

        return level;
    }

    private async loadAssets(level: LevelMap) {
        console.log('Loading default texture');
        await this.assetStore.addTexture(DEFAULT_SPRITE, './assets/sprites/default.png');

        console.log('Loading assets');
        for (const texture of level.textures) {
            await this.assetStore.addTexture(texture.assetId, texture.filePath);
        }

        for (const sound of level.sounds) {
            await this.assetStore.addSound(sound.assetId, sound.filePath);
        }
    }

    private loadEntities(level: LevelMap) {
        console.log('Loading entities');
        deserializeEntities(level.entities, this.registry);
    }

    private setMapBoundaries(level: LevelMap) {
        console.log('Setting map boundaries');

        Engine.mapWidth = level.mapWidth;
        Engine.mapHeight = level.mapHeight;
    }

    public getDefaultLevel = (levelId: string) => {
        const level: LevelMap = {
            textures: [],
            sounds: [],
            mapWidth: 64 * 10,
            mapHeight: 64 * 10,
            entities: [],
        };

        return { levelId, level };
    };
}
