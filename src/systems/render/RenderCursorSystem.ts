import AssetStore from '../../asset-store/AssetStore';
import HighlightComponent from '../../components/HighlightComponent';
import PlayerControlComponent from '../../components/PlayerControlComponent';
import Registry from '../../ecs/Registry';
import System from '../../ecs/System';
import { Rectangle, Vector } from '../../types/utils';

export default class RenderCursorSystem extends System {
    constructor() {
        super();
    }

    update(
        ctx: CanvasRenderingContext2D,
        camera: Rectangle,
        assetStore: AssetStore,
        registry: Registry,
        mousePosition: Vector,
    ) {
        const player = registry.getEntityByTag('player');

        if (!player) {
            this.renderDefaultCursor(ctx, camera, assetStore, mousePosition);
            return;
        }

        const playerControl = player.getComponent(PlayerControlComponent);

        if (!playerControl) {
            throw new Error('Could not find some component(s) of entity with id ' + player.getId());
        }

        if (playerControl.keysPressed.includes('ShiftLeft')) {
            this.renderAttackCursor(ctx, camera, assetStore, mousePosition);
            return;
        }

        let enemyHighlighted = false;

        for (const enemy of registry.getEntitiesByGroup('enemies')) {
            if (enemy.hasComponent(HighlightComponent)) {
                const highlight = enemy.getComponent(HighlightComponent);

                if (!highlight) {
                    throw new Error('Could not find some component(s) of entity with id ' + enemy.getId());
                }

                if (highlight.isHighlighted) {
                    enemyHighlighted = true;
                    break;
                }
            }
        }

        if (enemyHighlighted) {
            this.renderAttackCursor(ctx, camera, assetStore, mousePosition);
            return;
        }

        this.renderDefaultCursor(ctx, camera, assetStore, mousePosition);
    }

    private renderAttackCursor = (
        ctx: CanvasRenderingContext2D,
        camera: Rectangle,
        assetStore: AssetStore,
        mousePosition: Vector,
    ) => {
        ctx.drawImage(
            assetStore.getTexture('cursor-texture'),
            32,
            0,
            32,
            32,
            mousePosition.x - 5 - camera.x,
            mousePosition.y - 5 - camera.y,
            32,
            32,
        );
    };

    private renderDefaultCursor = (
        ctx: CanvasRenderingContext2D,
        camera: Rectangle,
        assetStore: AssetStore,
        mousePosition: Vector,
    ) => {
        ctx.drawImage(
            assetStore.getTexture('cursor-texture'),
            0,
            0,
            32,
            32,
            mousePosition.x - 14 - camera.x,
            mousePosition.y - 5 - camera.y,
            32,
            32,
        );
    };
}
