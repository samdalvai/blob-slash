import { AssetStore, Engine, Registry, System } from '../../engine';
import HighlightComponent from '../components/HighlightComponent';
import PlayerControlComponent from '../components/PlayerControlComponent';

export default class RenderCursorSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, assetStore: AssetStore, registry: Registry) {
        const player = registry.getEntityByTag('player');

        if (!player) {
            this.renderDefaultCursor(ctx, assetStore);
            return;
        }

        const playerControl = player.getComponent(PlayerControlComponent);

        if (!playerControl) {
            throw new Error('Could not find some component(s) of entity with id ' + player.getId());
        }

        if (playerControl.keysPressed.includes('ShiftLeft')) {
            this.renderAttackCursor(ctx, assetStore);
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
            this.renderAttackCursor(ctx, assetStore);
            return;
        }

        this.renderDefaultCursor(ctx, assetStore);
    }

    private renderAttackCursor = (
        ctx: CanvasRenderingContext2D,
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
