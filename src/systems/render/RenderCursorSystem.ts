import AssetStore from '../../asset-store/AssetStore';
import HighlightComponent from '../../components/HighlightComponent';
import Registry from '../../ecs/Registry';
import System from '../../ecs/System';
import { Vector } from '../../types';

export default class RenderCursorSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, assetStore: AssetStore, registry: Registry, mousePosition: Vector) {
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
            ctx.drawImage(
                assetStore.getTexture('cursor-texture'),
                32,
                0,
                32,
                32,
                mousePosition.x - 5,
                mousePosition.y - 5,
                32,
                32,
            );
            return;
        }

        ctx.drawImage(
            assetStore.getTexture('cursor-texture'),
            0,
            0,
            32,
            32,
            mousePosition.x - 14,
            mousePosition.y - 5,
            32,
            32,
        );
    }
}
