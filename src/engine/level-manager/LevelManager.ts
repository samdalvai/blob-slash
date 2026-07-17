import Engine from '../Engine';
import AssetStore from '../asset-store/AssetStore';
import { ComponentCatalog } from '../ecs/ComponentCatalog';
import Registry from '../ecs/Registry';
import { deserializeEntities } from '../serialization/deserialization';
import { migrateLevelMapToCurrentCoordinates } from '../serialization/levelCoordinateMigration';
import { LevelMap } from '../types/map';

export default class LevelManager {
    private registry: Registry;
    private assetStore: AssetStore;
    private componentCatalog: ComponentCatalog | null;

    constructor(registry: Registry, assetStore: AssetStore, componentCatalog: ComponentCatalog | null = null) {
        this.registry = registry;
        this.assetStore = assetStore;
        this.componentCatalog = componentCatalog;
    }

    public setComponentCatalog(componentCatalog: ComponentCatalog) {
        this.componentCatalog = componentCatalog;
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
        const migratedLevel = migrateLevelMapToCurrentCoordinates(level);

        this.assetStore.clear();
        this.registry.clear();

        await this.loadAssets(migratedLevel);
        this.loadEntities(migratedLevel);
        this.setMapBoundaries(migratedLevel);

        return migratedLevel;
    }

    private async loadAssets(level: LevelMap) {
        console.log('Loading assets');
        await Promise.all([
            ...level.textures.map(texture => this.assetStore.addTexture(texture.assetId, texture.filePath)),
            ...level.sounds.map(sound => this.assetStore.addSound(sound.assetId, sound.filePath)),
        ]);
    }

    private loadEntities(level: LevelMap) {
        console.log('Loading entities');

        if (!this.componentCatalog) {
            throw new Error('Cannot load level entities without a component catalog');
        }

        deserializeEntities(level.entities, this.registry, this.componentCatalog);
    }

    private setMapBoundaries(level: LevelMap) {
        console.log('Setting map boundaries');

        Engine.mapWidth = level.mapWidth;
        Engine.mapHeight = level.mapHeight;
    }

    public getDefaultLevel = (levelId: string) => {
        const levelMap: LevelMap = {
            coordinateSystemVersion: 2,
            textures: [],
            sounds: [],
            mapWidth: 64 * 10,
            mapHeight: 64 * 10,
            entities: [],
        };

        return { levelId, levelMap };
    };
}
