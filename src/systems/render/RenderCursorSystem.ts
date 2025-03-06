import AssetStore from '../../asset-store/AssetStore';
import System from '../../ecs/System';
import Game from '../../game/Game';
import { Vector } from '../../types';

export default class RenderCursorSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, assetStore: AssetStore, mousePosition: Vector) {
        ctx.drawImage(
            assetStore.getTexture('cursor-texture'),
            0,
            0,
            32,
            32,
            mousePosition.x,
            mousePosition.y,
            32 * 2,
            32 * 2,
        );
    }
}
