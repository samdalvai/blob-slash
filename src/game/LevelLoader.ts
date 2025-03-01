import AssetStore from '../asset-store/AssetStore';
import AnimationComponent from '../components/AnimationComponent';
import BoxColliderComponent from '../components/BoxColliderComponent';
import CameraFollowComponent from '../components/CameraFollowComponent';
import CameraShakeComponent from '../components/CameraShakeComponent';
import DeadBodyOnDeathComponent from '../components/DeadBodyOnDeathComponent';
import EntityControlComponent from '../components/EntityControlComponent';
import EntityFollowComponent from '../components/EntityFollowComponent';
import HealthComponent from '../components/HealthComponent';
import HighlightableComponent from '../components/HighlightableComponent';
import LightEmitComponent from '../components/LightEmitComponent';
import ParticleEmitComponent from '../components/ParticleEmitComponent';
import RangedAttackEmitterComponent from '../components/RangedAttackEmitterComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import ScriptComponent from '../components/ScriptComponent';
import ShadowComponent from '../components/ShadowComponent';
import SpriteComponent from '../components/SpriteComponent';
import SpriteStateComponent from '../components/SpriteStateComponent';
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
        await assetStore.addTexture('tiles-dark-texture', './assets/tilemaps/tiles_dark.png');

        await assetStore.addTexture('slime-texture', './assets/images/slime_big_full.png');
        await assetStore.addTexture('slime-texture-highlighted', './assets/images/slime_big_full_highlighted.png');
        await assetStore.addTexture('player-texture', './assets/images/player_full.png');
        await assetStore.addTexture('magic-sphere-texture', './assets/images/magic_sphere.png');

        await assetStore.addTexture('tree-texture', './assets/images/tree.png');
        await assetStore.addTexture('torch-texture', './assets/images/torch.png');
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
                tile.addComponent(SpriteComponent, 'tiles-dark-texture', tileSize, tileSize, 0, srcRectX, srcRectY);
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
        player.addComponent(SpriteStateComponent);
        player.addComponent(ShadowComponent, 30, 10, 0, -2);
        player.addComponent(AnimationComponent, 4, 6);
        player.addComponent(RigidBodyComponent, { x: 0, y: 0 }, { x: 1, y: 0 });
        player.addComponent(CameraFollowComponent);
        player.addComponent(EntityControlComponent, 150);
        // player.addComponent(KeyboardControlComponent, 200);
        player.addComponent(RangedAttackEmitterComponent, 200, 250, 3000, 10, true);
        player.addComponent(BoxColliderComponent, 25, 34, { x: 2.5, y: 0 });
        player.addComponent(HealthComponent, 100);
        player.addComponent(CameraShakeComponent, 100);
        player.addComponent(LightEmitComponent, 400);
        player.tag('player');

        const enemy = registry.createEntity();
        enemy.addComponent(TransformComponent, { x: 300, y: 600 }, { x: 1, y: 1 }, 0);
        enemy.addComponent(SpriteComponent, 'slime-texture', 32, 32, 1, 0, 0);
        enemy.addComponent(HighlightableComponent, 'slime-texture-highlighted');
        enemy.addComponent(SpriteStateComponent);
        enemy.addComponent(DeadBodyOnDeathComponent);
        enemy.addComponent(ShadowComponent, 30, 10, 0, -8);
        enemy.addComponent(AnimationComponent, 2, 4);
        enemy.addComponent(RigidBodyComponent, { x: 50, y: 0 }, { x: 1, y: 0 });
        enemy.addComponent(BoxColliderComponent, 25, 20, { x: 4, y: 7 });
        enemy.addComponent(HealthComponent, 50);
        enemy.addComponent(RangedAttackEmitterComponent, 200, 500, 2000, 20, false);
        enemy.addComponent(EntityFollowComponent, 200, 100, 50, 5000);
        enemy.addComponent(ScriptComponent, [
            { movement: { x: 50, y: 0 }, duration: 2000 },
            { movement: { x: 0, y: 50 }, duration: 2000 },
            { movement: { x: -50, y: 0 }, duration: 2000 },
            { movement: { x: 0, y: -50 }, duration: 2000 },
        ]);
        enemy.group('enemies');

        const torch = registry.createEntity();
        torch.addComponent(SpriteComponent, 'torch-texture', 32, 32, 1);
        torch.addComponent(TransformComponent, { x: 200, y: 200 }, { x: 1, y: 1 });
        torch.addComponent(AnimationComponent, 4, 10);
        torch.addComponent(LightEmitComponent, 100);
        torch.addComponent(ShadowComponent, 10, 5, -0.5, -5);
        torch.addComponent(ParticleEmitComponent, 2, 1000, 'rgba(255,0,0,1)', 200, 5, 16, 0, { x: 0, y: -50 });

        const torch2 = registry.createEntity();
        torch2.addComponent(SpriteComponent, 'torch-texture', 32, 32, 1);
        torch2.addComponent(TransformComponent, { x: 500, y: 200 }, { x: 1, y: 1 });
        torch2.addComponent(AnimationComponent, 4, 10);
        torch2.addComponent(LightEmitComponent, 100);
        torch2.addComponent(ShadowComponent, 10, 5, -0.5, -5);
        torch2.addComponent(ParticleEmitComponent, 2, 1000, 'rgba(255,0,0,1)', 200, 5, 16, 0, { x: 0, y: -50 });
    }
}
