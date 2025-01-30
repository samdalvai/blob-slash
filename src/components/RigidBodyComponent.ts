import Component from '../ecs/Component';
import { Vector } from '../types';

export default class RigidBodyComponent extends Component {
    velocity: Vector;
    direction: Vector;

    constructor(velocity = { x: 0, y: 0 }, direction = { x: 0, y: 0 }) {
        super();
        this.velocity = velocity;
        this.direction = direction;
    }
}
