import Engine from '../../engine/Engine';
import AssetStore from '../../engine/asset-store/AssetStore';
import Registry from '../../engine/ecs/Registry';
import { deserializeEntities } from '../../engine/serialization/deserialization';
import { LevelMap } from '../../engine/types/map';

export default class EditorLevelManager {
    public static async loadLevel(registry: Registry, assetStore: AssetStore) {
        await this.loadAssets(assetStore);
        const level = assetStore.getJson('snapshot') as LevelMap;
        this.loadEntities(registry, level);
        this.setMapBoundaries(level);
    }

    private static async loadAssets(assetStore: AssetStore) {
        console.log('Loading assets');
        await assetStore.addJson('snapshot', '/assets/levels/snapshot.json');
        
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
        await assetStore.addSound('melee-attack-sound', './assets/sounds/melee_attack.wav');
    }

    private static loadEntities(registry: Registry, level: LevelMap) {
        console.log('Loading entities');
        deserializeEntities(level.entities, registry);
    }

    private static setMapBoundaries(level: LevelMap) {
        console.log('Setting map boundaries');

        Engine.mapWidth = level.mapWidth;
        Engine.mapHeight = level.mapHeight;
    }
}
