import Component from '../../engine/ecs/Component';
import { Flip } from '../../engine/types/utils';
import { DEFAULT_SPRITE } from '../../engine/utils/constants';

export default class SpriteComponent extends Component {
    assetId: string;
    width: number;
    height: number;
    zIndex: number;
    row: number;
    column: number;
    flip: Flip;
    transparency: number;

    constructor(
        assetId = DEFAULT_SPRITE,
        width = 0,
        height = 0,
        zIndex = 0,
        row = 0,
        column = 0,
        flip: Flip = 0,
        transparency = 1,
    ) {
        super();
        this.assetId = assetId;
        this.width = width;
        this.height = height;
        this.row = row;
        this.column = column;
        this.zIndex = zIndex;
        this.flip = flip;

        // Clamps value if it is less than 0 or more than 1
        this.transparency = Math.min(1, Math.max(0, transparency));
    }
}
