import AssetStore from '../asset-store/AssetStore';
import AnimationComponent from '../components/AnimationComponent';
import BoxColliderComponent from '../components/BoxColliderComponent';
import CameraFollowComponent from '../components/CameraFollowComponent';
import CameraShakeComponent from '../components/CameraShakeComponent';
import DeadBodyOnDeathComponent from '../components/DeadBodyOnDeathComponent';
import EntityFollowComponent from '../components/EntityFollowComponent';
import HealthComponent from '../components/HealthComponent';
import KeyboardControlComponent from '../components/KeyboardControlComponent';
import ProjectileEmitterComponent from '../components/ProjectileEmitterComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import ScriptComponent from '../components/ScriptComponent';
import ShadowComponent from '../components/ShadowComponent';
import SpriteComponent from '../components/SpriteComponent';
import SpriteDirectionComponent from '../components/SpriteDirectionComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../ecs/Registry';
import { TileMap } from '../types';
import Game from './Game';

export default class LevelLoader {
    public static async loadLevel(registry: Registry, assetStore: AssetStore) {
        await this.loadAssets(assetStore);
        this.loadTileMap(registry, assetStore);
        this.loadEntities(registry);
    }

    private static async loadAssets(assetStore: AssetStore) {
        console.log('Loading assets');
        await assetStore.addJson('tile-map', '/assets/tilemaps/tilemap.json');
        await assetStore.addTexture('desert-texture', './assets/tilemaps/desert.png');

        await assetStore.addTexture('slime-texture', './assets/images/slime_big_full.png');
        await assetStore.addTexture('player-texture', './assets/images/player_full.png');
        await assetStore.addTexture('bullet-texture', './assets/images/bullet.png');

        await assetStore.addTexture('tree-texture', './assets/images/tree.png');
    }

    private static loadTileMap(registry: Registry, assetStore: AssetStore) {
        console.log('Loading tilemap');
        const tileMap = assetStore.getJson('tile-map') as TileMap;

        const tileSize = 32;
        const mapScale = 2;
        let rowNumber = 0;
        let columnNumber = 0;
        for (let i = 0; i < tileMap.tiles.length; i++) {
            columnNumber = 0;
            for (let j = 0; j < tileMap.tiles[i].length; j++) {
                const tileNumber = tileMap.tiles[i][j];
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
                tile.addComponent(SpriteComponent, 'desert-texture', tileSize, tileSize, 0, srcRectX, srcRectY);
                columnNumber++;
            }
            rowNumber++;
        }
        Game.mapWidth = columnNumber * tileSize * mapScale;
        Game.mapHeight = rowNumber * tileSize * mapScale;
    }

    private static loadEntities(registry: Registry) {
        console.log('Loading entities');
        const player = registry.createEntity();
        player.addComponent(TransformComponent, { x: 240, y: 100 }, { x: 1, y: 1 }, 0);
        player.addComponent(SpriteComponent, 'player-texture', 32, 32, 1, 0, 0);
        player.addComponent(DeadBodyOnDeathComponent);
        player.addComponent(SpriteDirectionComponent);
        player.addComponent(ShadowComponent, 30, 10, 0, -2);
        player.addComponent(AnimationComponent, 4, 6);
        player.addComponent(RigidBodyComponent, { x: 0, y: 0 }, { x: 1, y: 0 });
        player.addComponent(CameraFollowComponent);
        player.addComponent(KeyboardControlComponent, -200, 200, 200, -200);
        player.addComponent(ProjectileEmitterComponent, { x: 200, y: 200 }, 50, 3000, 10, true);
        player.addComponent(BoxColliderComponent, 32, 25, { x: 0, y: 5 });
        player.addComponent(HealthComponent, 100);
        player.addComponent(CameraShakeComponent, 100);
        player.tag('player');

        const enemy = registry.createEntity();
        enemy.addComponent(TransformComponent, { x: 300, y: 600 }, { x: 1, y: 1 }, 0);
        enemy.addComponent(SpriteComponent, 'slime-texture', 32, 32, 1, 0, 0);
        enemy.addComponent(SpriteDirectionComponent);
        enemy.addComponent(DeadBodyOnDeathComponent);
        enemy.addComponent(ShadowComponent, 30, 10, 0, -8);
        enemy.addComponent(AnimationComponent, 2, 4);
        enemy.addComponent(RigidBodyComponent, { x: 50, y: 0 }, { x: 1, y: 0 });
        enemy.addComponent(BoxColliderComponent, 25, 20, { x: 4, y: 7 });
        enemy.addComponent(HealthComponent, 50);
        enemy.addComponent(ProjectileEmitterComponent, { x: 100, y: 100 }, 500, 2000, 20, false);
        enemy.addComponent(EntityFollowComponent, 250, 100, 50, { x: 16, y: 16 }, 5000);
        enemy.addComponent(ScriptComponent, [
            { movement: { x: 50, y: 0 }, duration: 2000 },
            { movement: { x: 0, y: 50 }, duration: 2000 },
            { movement: { x: -50, y: 0 }, duration: 2000 },
            { movement: { x: 0, y: -50 }, duration: 2000 },
        ]);
        enemy.group('enemies');
    }
}
