import Engine from '../Engine';
import AssetStore from '../asset-store/AssetStore';
import Registry from '../ecs/Registry';
import { deserializeEntities } from '../serialization/deserialization';
// import { loadLevelFromLocalStorage } from '../serialization/persistence';
import { LevelMap } from '../types/map';

export default class LevelManager {
    private assetStore: AssetStore;

    constructor(assetStore: AssetStore) {
        this.assetStore = assetStore;
    }

    public async addLevel(levelId: string, levelFilePath: string) {
        console.log('Loading level ' + levelId);
        await this.assetStore.addJson(levelId, levelFilePath);
    }

    public async loadLevel(registry: Registry, levelId: string) {
        const level = this.assetStore.getJson(levelId) as LevelMap;
        await this.loadAssets(level);
        // const level = loadLevelFromLocalStorage();
        // if (!levelLocal) {
        //     throw new Error('Could not read level from local storage');
        // }

        this.loadEntities(registry, level);
        this.setMapBoundaries(level);
    }

    private async loadAssets(level: LevelMap) {
        console.log('Loading assets');
        for (const texture of level.textures) {
            await this.assetStore.addTexture(texture.assetId, texture.filePath);
        }

        for (const sound of level.sounds) {
            await this.assetStore.addSound(sound.assetId, sound.filePath);
        }
        /*await assetStore.addJson('snapshot', '/assets/levels/snapshot.json');

        await assetStore.addTexture('desert-texture', './assets/tilemaps/desert.png');
        await assetStore.addTexture('tiles-dark-texture', './assets/tilemaps/tiles_dark.png');

        await assetStore.addTexture('slime-texture', './assets/sprites/slime_big_full.png');
        await assetStore.addTexture('player-texture', './assets/sprites/player_full.png');
        await assetStore.addTexture('skeleton-texture', './assets/sprites/skeleton_full.png');

        await assetStore.addTexture('magic-sphere-texture', './assets/sprites/magic_sphere.png');
        await assetStore.addTexture('magic-bubble-texture', './assets/sprites/magic_bubble.png');
        await assetStore.addTexture('fire-circle-texture', './assets/sprites/fire_circle.png');
        await assetStore.addTexture('teleport-texture', './assets/sprites/teleport.png');

        await assetStore.addTexture('tree-texture', './assets/sprites/tree.png');
        await assetStore.addTexture('torch-texture', './assets/sprites/torch.png');

        await assetStore.addTexture('skills-menu-texture', './assets/sprites/skills_menu.png');
        await assetStore.addTexture('cooldown-skill-texture', './assets/sprites/cooldown_skill.png');
        await assetStore.addTexture('mouse-menu-texture', './assets/sprites/mouse_menu.png');
        await assetStore.addTexture('cursor-texture', './assets/sprites/cursor.png');
        await assetStore.addTexture('destination-circle-texture', './assets/sprites/destination_circle.png');
        await assetStore.addTexture('smear-animation-texture', './assets/sprites/smear64.png');

        await assetStore.addTexture('explosion-small-blue-texture', './assets/sprites/explosion_small_blue.png');

        await assetStore.addSound('entity-hit-sound', './assets/sounds/entity_hit.wav');
        await assetStore.addSound('teleport-sound', './assets/sounds/teleport.wav');
        await assetStore.addSound('slash-sound', './assets/sounds/slash.wav');
        await assetStore.addSound('melee-attack-sound', './assets/sounds/melee_attack.wav');*/
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
