import AssetStore from '../../engine/asset-store/AssetStore';
import Registry from '../../engine/ecs/Registry';
//import { deserializeEntities } from '../../core/serialization/deserialization';
// import { loadLevelFromLocalStorage } from '../serialization/persistence';
import { LevelMap } from '../../engine/types/map';
import Game from '../../game/Game';
import BoxColliderComponent from '../../game/components/BoxColliderComponent';
import LightEmitComponent from '../../game/components/LightEmitComponent';
import ShadowComponent from '../../game/components/ShadowComponent';
import SpriteComponent from '../../game/components/SpriteComponent';
import TransformComponent from '../../game/components/TransformComponent';

export default class EditorLevelManager {
    public static async loadLevel(registry: Registry, assetStore: AssetStore) {
        await this.loadAssets(assetStore);
        const level = assetStore.getJson('level') as LevelMap;
        // const level = loadLevelFromLocalStorage();
        // if (!levelLocal) {
        //     throw new Error('Could not read level from local storage');
        // }

        this.loadEntities(registry, level);
        this.setMapBoundaries(level);
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

        const tile1 = registry.createEntity();
        tile1.addComponent(SpriteComponent, 'tiles-dark-texture', 32, 32, 0, { x: 0, y: 0 });
        tile1.addComponent(TransformComponent, { x: 500, y: 500 }, { x: 2, y: 2 });
        tile1.group('tiles');

        const tile2 = registry.createEntity();
        tile2.addComponent(SpriteComponent, 'tiles-dark-texture', 32, 32, 0, { x: 0, y: 0 });
        tile2.addComponent(TransformComponent, { x: 564, y: 500 }, { x: 2, y: 2 });
        tile2.group('tiles');

        const tile3 = registry.createEntity();
        tile3.addComponent(SpriteComponent, 'tiles-dark-texture', 32, 32, 0, { x: 0, y: 0 });
        tile3.addComponent(TransformComponent, { x: 628, y: 500 }, { x: 2, y: 2 });
        tile3.group('tiles');

        tile3.kill();

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'player-texture', 32, 32, 0, { x: 0, y: 32 * 2 });
        player.addComponent(TransformComponent, { x: 200, y: 200 });
        player.addComponent(BoxColliderComponent, 20, 32, { x: 5, y: 0 });
        player.addComponent(LightEmitComponent, 200);
        player.addComponent(ShadowComponent, 32, 16);
        player.tag('player');
    }

    private static setMapBoundaries(level: LevelMap) {
        console.log('Setting map boundaries');

        Game.mapWidth = level.mapWidth;
        Game.mapHeight = level.mapHeight;
    }
}
