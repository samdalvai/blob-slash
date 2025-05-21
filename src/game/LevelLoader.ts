import AssetStore from '../asset-store/AssetStore';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../ecs/Registry';
import { deserializeEntities } from '../serialization/deserialization';
import { LevelMap } from '../types/map';
import Game from './Game';

export default class LevelLoader {
    public static async loadLevel(registry: Registry, assetStore: AssetStore) {
        await this.loadAssets(assetStore);
        const level = assetStore.getJson('snapshot') as LevelMap;
        this.loadTileMap(registry, level);
        this.loadEntities(registry, level);
    }

    private static async loadAssets(assetStore: AssetStore) {
        console.log('Loading assets');
        await assetStore.addJson('level', '/assets/tilemaps/level.json');
        await assetStore.addJson('snapshot', '/assets/tilemaps/snapshot.json');
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

        await assetStore.addTexture('explosion-small-blue-texture', './assets/images/explosion_small_blue.png');

        await assetStore.addSound('entity-hit-sound', './assets/sounds/entity_hit.wav');
        await assetStore.addSound('teleport-sound', './assets/sounds/teleport.wav');
    }

    private static loadTileMap(registry: Registry, level: LevelMap) {
        console.log('Loading tilemap');
        const tiles = level.tiles;

        if (!tiles) {
            console.log('No tiles to be loaded, skipping');
            return;
        }

        const tileSize = 32;
        const mapScale = 2;
        let rowNumber = 0;
        let columnNumber = 0;
        for (let i = 0; i < tiles.length; i++) {
            columnNumber = 0;
            for (let j = 0; j < tiles[i].length; j++) {
                const tileNumber = tiles[i][j];
                const srcRectX = (tileNumber % 10) * tileSize;
                const srcRectY = Math.floor(tileNumber / 10) * tileSize;
                const tile = registry.createEntity();
                tile.addComponent(
                    TransformComponent,
                    {
                        x: columnNumber * (mapScale * tileSize),
                        y: rowNumber * (mapScale * tileSize),
                    },
                    { x: mapScale, y: mapScale },
                    0,
                );
                tile.addComponent(SpriteComponent, 'tiles-dark-texture', tileSize, tileSize, 0, srcRectX, srcRectY);
                columnNumber++;
            }
            rowNumber++;
        }
        Game.mapWidth = columnNumber * tileSize * mapScale;
        Game.mapHeight = rowNumber * tileSize * mapScale;
    }

    private static loadEntities(registry: Registry, level: LevelMap) {
        console.log('Loading entities');
        deserializeEntities(level.entities, registry);
    }
}
