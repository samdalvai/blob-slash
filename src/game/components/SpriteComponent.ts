import { DEFAULT_TEXTURE } from '../../engine/asset-store/AssetStore';
import Component from '../../engine/ecs/Component';
import { Flip, Rectangle, Vector } from '../../engine/types/utils';

export default class SpriteComponent extends Component {
    assetId: string;
    width: number;
    height: number;
    zIndex: number;
    srcRect: Rectangle;
    flip: Flip;
    isFixed: boolean;
    transparency: number;

    constructor(
        assetId = DEFAULT_TEXTURE,
        width = 0,
        height = 0,
        zIndex = 0,
        srcRect: Vector = { x: 0, y: 0 },
        flip: Flip = 0,
        isFixed = false,
        transparency = 1,
    ) {
        if (transparency < 0 || transparency > 1) {
            throw new Error('Transparency must be between 0 and 1');
        }

        super();
        this.assetId = assetId;
        this.width = width;
        this.height = height;
        this.zIndex = zIndex;
        this.srcRect = { x: srcRect.x, y: srcRect.y, width, height };
        this.flip = flip;
        this.isFixed = isFixed;
        this.transparency = transparency;
    }
}
