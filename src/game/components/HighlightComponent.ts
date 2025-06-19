import Component from '../../core/ecs/Component';

export default class HighlightComponent extends Component {
    isHighlighted: boolean;
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;

    constructor(width = 0, height = 0, offsetX = 0, offsetY = 0) {
        super();
        this.isHighlighted = false;
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
}
