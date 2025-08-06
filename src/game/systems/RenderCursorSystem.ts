import AssetStore from '../../engine/asset-store/AssetStore';
import HighlightComponent from '../components/HighlightComponent';
import PlayerControlComponent from '../components/PlayerControlComponent';
import Registry from '../../engine/ecs/Registry';
import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import Engine from '../../engine/Engine';

export default class RenderCursorSystem extends System {
    constructor() {
        super();
    }

    update(
        ctx: CanvasRenderingContext2D,
        camera: Rectangle,
        assetStore: AssetStore,
        registry: Registry,
    ) {
        const player = registry.getEntityByTag('player');

        if (!player) {
            this.renderDefaultCursor(ctx, camera, assetStore);
            return;
        }

        const playerControl = player.getComponent(PlayerControlComponent);

        if (!playerControl) {
            throw new Error('Could not find some component(s) of entity with id ' + player.getId());
        }

        if (playerControl.keysPressed.includes('ShiftLeft')) {
            this.renderAttackCursor(ctx, camera, assetStore);
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
            this.renderAttackCursor(ctx, camera, assetStore);
            return;
        }

        this.renderDefaultCursor(ctx, camera, assetStore);
    }

    private renderAttackCursor = (
        ctx: CanvasRenderingContext2D,
        camera: Rectangle,
        assetStore: AssetStore,
    ) => {
        ctx.drawImage(
            assetStore.getTexture('cursor'),
            32,
            0,
            32,
            32,
            Engine.mousePositionScreen.x - 5,
            Engine.mousePositionScreen.y - 5,
            32,
            32,
        );
    };

    private renderDefaultCursor = (
        ctx: CanvasRenderingContext2D,
        camera: Rectangle,
        assetStore: AssetStore,
    ) => {
        ctx.drawImage(
            assetStore.getTexture('cursor'),
            0,
            0,
            32,
            32,
            Engine.mousePositionScreen.x - 14,
            Engine.mousePositionScreen.y - 5,
            32,
            32,
        );
    };
}
