import Component from '../ecs/Component';
import { Vector } from '../types';

export default class BoxColliderComponent extends Component {
    width: number;
    height: number;
    offset: Vector;

    constructor(width = 0, height = 0, offset = { x: 0, y: 0 }) {
        super();
        this.width = width;
        this.height = height;
        this.offset = offset;
    }
}
