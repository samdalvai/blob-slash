import { Component, Vector } from '../../engine';

export default class TransformComponent extends Component {
    /** Centre position in the standard Y-up world coordinate system. */
    position: Vector;
    scale: Vector;
    /** Rotation in degrees; positive values are counter-clockwise in world space. */
    rotation: number;
    /** True for screen-space entities; these do not participate in the world camera. */
    isFixed: boolean;

    constructor(
        position: Vector = { x: 0, y: 0 },
        scale: Vector = { x: 1, y: 1 },
        rotation: number = 0.0,
        isFixed = false,
    ) {
        super();
        this.position = position;
        this.scale = scale;
        this.rotation = rotation;
        this.isFixed = isFixed;
    }
}
