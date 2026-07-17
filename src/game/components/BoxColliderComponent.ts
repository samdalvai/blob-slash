import { Component, Vector } from '../../engine';

export default class BoxColliderComponent extends Component {
    width: number;
    height: number;
    /**
     * LEGACY (coordinate-system version 1): offset from the transform's
     * top-left position, with positive Y downward.
     *
     * Migration target (version 2): offset from the transform centre to the
     * collider centre, with positive Y upward.
     */
    offset: Vector;
    lastCollision: number;

    constructor(width = 0, height = 0, offset = { x: 0, y: 0 }) {
        super();
        this.width = width;
        this.height = height;
        this.offset = offset;
        this.lastCollision = 0;
    }
}
