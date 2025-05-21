import AssetStore from '../asset-store/AssetStore';
import AnimationComponent from '../components/AnimationComponent';
import BoxColliderComponent from '../components/BoxColliderComponent';
import CameraFollowComponent from '../components/CameraFollowComponent';
import CameraShakeComponent from '../components/CameraShakeComponent';
import DeadBodyOnDeathComponent from '../components/DeadBodyOnDeathComponent';
import EntityEffectComponent from '../components/EntityEffectComponent';
import EntityFollowComponent from '../components/EntityFollowComponent';
import HealthComponent from '../components/HealthComponent';
import HighlightComponent from '../components/HighlightComponent';
import LightEmitComponent from '../components/LightEmitComponent';
import ParticleEmitComponent from '../components/ParticleEmitComponent';
import PlayerControlComponent from '../components/PlayerControlComponent';
import RangedAttackEmitterComponent from '../components/RangedAttackEmitterComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import ScriptComponent from '../components/ScriptComponent';
import ShadowComponent from '../components/ShadowComponent';
import SpriteComponent from '../components/SpriteComponent';
import SpriteStateComponent from '../components/SpriteStateComponent';
import TeleportComponent from '../components/TeleportComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../ecs/Registry';
import { Flip, LevelMap, TileMap } from '../types';
import Game from './Game';

export default class LevelLoader {
    public static async loadLevel(registry: Registry, assetStore: AssetStore) {
        await this.loadAssets(assetStore);
        this.loadTileMap(registry, assetStore);
        this.loadEntities(registry);
    }

    private static async loadAssets(assetStore: AssetStore) {
        console.log('Loading assets');
        await assetStore.addJson('level-0', '/assets/tilemaps/level_0.json');
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

    private static loadTileMap(registry: Registry, assetStore: AssetStore) {
        console.log('Loading tilemap');
        const level = assetStore.getJson('level-0') as LevelMap;
        const tileMap = level.tileMap;

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
        player.addComponent(SpriteComponent, 'player-texture', 32, 32, 2, 0, 0, Flip.NONE, false, 1);
        player.addComponent(DeadBodyOnDeathComponent);
        player.addComponent(SpriteStateComponent);
        player.addComponent(ShadowComponent, 30, 10, 0, -2);
        player.addComponent(AnimationComponent, 4, 6);
        player.addComponent(RigidBodyComponent, { x: 0, y: 0 }, { x: 1, y: 0 });
        player.addComponent(CameraFollowComponent);
        player.addComponent(PlayerControlComponent, 150, 2000, 1000, 5000);
        player.addComponent(RangedAttackEmitterComponent, 200, 400, 7500, 10, true);
        player.addComponent(BoxColliderComponent, 25, 34, { x: 2.5, y: 0 });
        player.addComponent(HealthComponent, 100);
        player.addComponent(CameraShakeComponent, 100);
        player.addComponent(LightEmitComponent, 250);
        player.addComponent(EntityEffectComponent);
        player.addComponent(TeleportComponent, 500);
        player.tag('player');

        const enemy = registry.createEntity();
        enemy.addComponent(TransformComponent, { x: 300, y: 500 }, { x: 1, y: 1 }, 0);
        enemy.addComponent(SpriteComponent, 'slime-texture', 32, 32, 2, 0, 0);
        enemy.addComponent(HighlightComponent, 40, 20, 0, -10);
        enemy.addComponent(SpriteStateComponent);
        enemy.addComponent(DeadBodyOnDeathComponent);
        enemy.addComponent(ShadowComponent, 30, 10, 0, -8);
        enemy.addComponent(AnimationComponent, 2, 4);
        enemy.addComponent(RigidBodyComponent, { x: 50, y: 0 }, { x: 1, y: 0 });
        enemy.addComponent(BoxColliderComponent, 25, 20, { x: 4, y: 7 });
        enemy.addComponent(HealthComponent, 50);
        enemy.addComponent(RangedAttackEmitterComponent, 200, 500, 7500, 2, false);
        enemy.addComponent(EntityFollowComponent, 200, 100, 50, 5000);
        enemy.addComponent(EntityEffectComponent);
        enemy.addComponent(ScriptComponent, [
            { movement: { x: 50, y: 0 }, duration: 2000 },
            { movement: { x: 0, y: 50 }, duration: 2000 },
            { movement: { x: -50, y: 0 }, duration: 2000 },
            { movement: { x: 0, y: -50 }, duration: 2000 },
        ]);
        enemy.group('enemies');

        const enemy2 = registry.createEntity();
        enemy2.addComponent(TransformComponent, { x: 500, y: 500 }, { x: 2, y: 2 }, 0);
        enemy2.addComponent(SpriteComponent, 'skeleton-texture', 32, 32, 2, 0, 32);
        enemy2.addComponent(HighlightComponent, 40, 20, 0, -10);
        enemy2.addComponent(SpriteStateComponent);
        enemy2.addComponent(DeadBodyOnDeathComponent);
        enemy2.addComponent(ShadowComponent, 30, 10, 0, -8);
        enemy2.addComponent(AnimationComponent, 2, 4);
        enemy2.addComponent(RigidBodyComponent, { x: 50, y: 0 }, { x: 1, y: 0 });
        enemy2.addComponent(BoxColliderComponent, 25, 20, { x: 4, y: 7 });
        enemy2.addComponent(HealthComponent, 50);
        enemy2.addComponent(RangedAttackEmitterComponent, 200, 500, 7500, 2, false);
        enemy2.addComponent(EntityFollowComponent, 200, 100, 50, 5000);
        enemy2.addComponent(EntityEffectComponent);
        enemy2.addComponent(ScriptComponent, [
            { movement: { x: 50, y: 0 }, duration: 2000 },
            { movement: { x: 0, y: 50 }, duration: 2000 },
            { movement: { x: -50, y: 0 }, duration: 2000 },
            { movement: { x: 0, y: -50 }, duration: 2000 },
        ]);
        enemy2.group('enemies');

        const torch = registry.createEntity();
        torch.addComponent(SpriteComponent, 'torch-texture', 32, 32, 2);
        torch.addComponent(TransformComponent, { x: 200, y: 200 }, { x: 1, y: 1 });
        torch.addComponent(AnimationComponent, 4, 10);
        torch.addComponent(LightEmitComponent, 100);
        torch.addComponent(ShadowComponent, 10, 5, -0.5, -5);
        torch.addComponent(ParticleEmitComponent, 2, 1000, 'rgba(255,0,0,1)', 200, 5, 16, 0, { x: 0, y: -50 });
        torch.addComponent(EntityEffectComponent);

        const torch2 = registry.createEntity();
        torch2.addComponent(SpriteComponent, 'torch-texture', 32, 32, 2);
        torch2.addComponent(TransformComponent, { x: 500, y: 200 }, { x: 1, y: 1 });
        torch2.addComponent(AnimationComponent, 4, 10);
        torch2.addComponent(LightEmitComponent, 100);
        torch2.addComponent(ShadowComponent, 10, 5, -0.5, -5);
        torch2.addComponent(ParticleEmitComponent, 2, 1000, 'rgba(255,0,0,1)', 200, 5, 16, 0, { x: 0, y: -50 });
        torch2.addComponent(EntityEffectComponent);

        const tree1 = registry.createEntity();
        tree1.addComponent(SpriteComponent, 'tree-texture', 32, 32, 2);
        tree1.addComponent(TransformComponent, { x: 600, y: 200 }, { x: 2, y: 2 });
        tree1.addComponent(BoxColliderComponent, 16, 30);
        tree1.group('obstacles');

        const tree2 = registry.createEntity();
        tree2.addComponent(SpriteComponent, 'tree-texture', 32, 32, 2);
        tree2.addComponent(TransformComponent, { x: 632, y: 200 }, { x: 2, y: 2 });
        tree2.addComponent(BoxColliderComponent, 16, 30);
        tree2.group('obstacles');

        const tree3 = registry.createEntity();
        tree3.addComponent(SpriteComponent, 'tree-texture', 32, 32, 2);
        tree3.addComponent(TransformComponent, { x: 664, y: 200 }, { x: 2, y: 2 });
        tree3.addComponent(BoxColliderComponent, 16, 30);
        tree3.group('obstacles');

        const tree4 = registry.createEntity();
        tree4.addComponent(SpriteComponent, 'tree-texture', 32, 32, 2);
        tree4.addComponent(TransformComponent, { x: 600, y: 232 }, { x: 2, y: 2 });
        tree4.addComponent(BoxColliderComponent, 16, 30);
        tree4.group('obstacles');

        const tree5 = registry.createEntity();
        tree5.addComponent(SpriteComponent, 'tree-texture', 32, 32, 2);
        tree5.addComponent(TransformComponent, { x: 600, y: 264 }, { x: 2, y: 2 });
        tree5.addComponent(BoxColliderComponent, 16, 30);
        tree5.group('obstacles');
    }
}
