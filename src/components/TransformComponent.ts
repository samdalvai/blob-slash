import Component from '../ecs/Component';
import { Vector } from '../types';

export default class TransformComponent extends Component {
    position: Vector;
    scale: Vector;
    // Rotation is expressed in degrees
    rotation: number;

    constructor(position: Vector = { x: 0, y: 0 }, scale: Vector = { x: 1, y: 1 }, rotation: number = 0.0) {
        super();
        this.position = position;
        this.scale = scale;
        this.rotation = rotation;
    }
}
