import AssetStore from '../../asset-store/AssetStore';
import System from '../../ecs/System';
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
            mousePosition.x - 14,
            mousePosition.y - 5,
            32,
            32,
        );

        // ctx.drawImage(
        //     assetStore.getTexture('cursor-texture'),
        //     32,
        //     0,
        //     32,
        //     32,
        //     mousePosition.x - 10,
        //     mousePosition.y - 10,
        //     32,
        //     32,
        // );
    }
}
