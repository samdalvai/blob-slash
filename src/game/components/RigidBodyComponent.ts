import { Component, Vector } from '../../engine';

export default class RigidBodyComponent extends Component {
    /**
     * LEGACY (coordinate-system version 1): positive Y points down.
     * Migration target (version 2): positive Y points up.
     */
    velocity: Vector;
    /** Direction uses the same coordinate convention as velocity. */
    direction: Vector;

    constructor(velocity = { x: 0, y: 0 }, direction = { x: 0, y: 0 }) {
        super();
        this.velocity = velocity;
        this.direction = direction;
    }
}
