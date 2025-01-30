import Component from '../ecs/Component';
import { Flip, Rectangle } from '../types';

export default class SpriteComponent extends Component {
    assetId: string;
    width: number;
    height: number;
    zIndex: number;
    srcRect: Rectangle;
    flip: Flip;
    isFixed: boolean;
    
    constructor(
        assetId = '',
        width = 0,
        height = 0,
        zIndex = 0,
        srcRectX = 0,
        srcRectY = 0,
        flip: Flip = Flip.NONE,
        isFixed = false,
    ) {
        super();
        this.assetId = assetId;
        this.width = width;
        this.height = height;
        this.zIndex = zIndex;
        this.srcRect = { x: srcRectX, y: srcRectY, width, height };
        this.flip = flip;
        this.isFixed = isFixed;
    }
}
