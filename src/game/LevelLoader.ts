import AssetStore from '../asset-store/AssetStore';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../ecs/Registry';
import { deserializeEntities } from '../serialization/deserialization';
// import { loadLevelFromLocalStorage } from '../serialization/persistence';
import { LevelMap } from '../types/map';
import Game from './Game';

export default class LevelLoader {
    public static async loadLevel(registry: Registry, assetStore: AssetStore) {
        await this.loadAssets(assetStore);
        const level = assetStore.getJson('level') as LevelMap;
        // const level = loadLevelFromLocalStorage();
        // if (!levelLocal) {
        //     throw new Error('Could not read level from local storage');
        // }

        this.loadEntities(registry, level);
        this.setMapBoundaries(registry);
    }

    private static async loadAssets(assetStore: AssetStore) {
        console.log('Loading assets');
        await assetStore.addJson('level', '/assets/tilemaps/level.json');
        await assetStore.addTexture('desert-texture', './assets/tilemaps/desert.png');
        await assetStore.addTexture('tiles-dark-texture', './assets/tilemaps/tiles_dark.png');

        await assetStore.addTexture('slime-texture', './assets/images/slime_big_full.png');
        await assetStore.addTexture('player-texture', './assets/images/player_full.png');
        await assetStore.addTexture('skeleton-texture', './assets/images/skeleton_full.png');

        await assetStore.addTexture('magic-sphere-texture', './assets/images/magic_sphere.png');
        await assetStore.addTexture('magic-bubble-texture', './assets/images/magic_bubble.png');
        await assetStore.addTexture('fire-circle-texture', './assets/images/fire_circle.png');
        await assetStore.addTexture('teleport-texture', './assets/images/teleport.png');

        await assetStore.addTexture('tree-texture', './assets/images/tree.png');
        await assetStore.addTexture('torch-texture', './assets/images/torch.png');

        await assetStore.addTexture('skills-menu-texture', './assets/images/skills_menu.png');
        await assetStore.addTexture('cooldown-skill-texture', './assets/images/cooldown_skill.png');
        await assetStore.addTexture('mouse-menu-texture', './assets/images/mouse_menu.png');
        await assetStore.addTexture('cursor-texture', './assets/images/cursor.png');
        await assetStore.addTexture('destination-circle-texture', './assets/images/destination_circle.png');
        await assetStore.addTexture('smear-animation-texture', './assets/images/smear64.png');

        await assetStore.addTexture('explosion-small-blue-texture', './assets/images/explosion_small_blue.png');

        await assetStore.addSound('entity-hit-sound', './assets/sounds/entity_hit.wav');
        await assetStore.addSound('teleport-sound', './assets/sounds/teleport.wav');
        await assetStore.addSound('slash-sound', './assets/sounds/slash.wav');
        await assetStore.addSound('melee-attack-sound', './assets/sounds/melee_attack.wav');
    }

    private static loadEntities(registry: Registry, level: LevelMap) {
        console.log('Loading entities');
        deserializeEntities(level.entities, registry);
    }

    private static setMapBoundaries(registry: Registry) {
        console.log('Setting map boundaries');
        const tiles = registry.getEntitiesByGroup('tiles');

        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;

        let maxX = 0;
        let maxY = 0;

        let spriteWidth = 0;
        let spriteHeight = 0;
        const spriteScale = { x: 0, y: 0 };

        for (const tile of tiles) {
            const sprite = tile.getComponent(SpriteComponent);
            const transform = tile.getComponent(TransformComponent);

            if (!sprite || !transform) {
                throw new Error(`Could not find some component(s) of tile entity ${tile.getId()}`);
            }

            if (transform.position.x < minX) {
                minX = transform.position.x;
            }

            if (transform.position.y < minY) {
                minY = transform.position.y;
            }

            if (transform.position.x > maxX) {
                maxX = transform.position.x;
            }

            if (transform.position.y > maxY) {
                maxY = transform.position.y;
            }

            if (sprite.width > spriteWidth) {
                spriteWidth = sprite.width;
            }

            if (sprite.height > spriteHeight) {
                spriteHeight = sprite.height;
            }

            if (transform.scale.x > spriteScale.x) {
                spriteScale.x = transform.scale.x;
            }

            if (transform.scale.y > spriteScale.y) {
                spriteScale.y = transform.scale.y;
            }
        }

        Game.mapWidth = maxX - minX + spriteWidth * spriteScale.x;
        Game.mapHeight = maxY - minY + spriteHeight * spriteScale.y;
    }
}
