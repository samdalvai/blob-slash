import Component from '../ecs/Component';
import { Flip, Rectangle } from '../types/utils';

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
        assetId = '',
        width = 0,
        height = 0,
        zIndex = 0,
        srcRectX = 0,
        srcRectY = 0,
        flip: Flip = Flip.NONE,
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
        this.srcRect = { x: srcRectX, y: srcRectY, width, height };
        this.flip = flip;
        this.isFixed = isFixed;
        this.transparency = transparency;
    }
}
