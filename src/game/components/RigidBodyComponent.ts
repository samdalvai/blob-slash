import { Component, Vector } from '../../engine';

export default class RigidBodyComponent extends Component {
    /** Linear velocity in world units; positive Y points up. */
    velocity: Vector;
    /** Direction uses the same Y-up coordinate convention as velocity. */
    direction: Vector;

    constructor(velocity = { x: 0, y: 0 }, direction = { x: 0, y: 0 }) {
        super();
        this.velocity = velocity;
        this.direction = direction;
    }
}
