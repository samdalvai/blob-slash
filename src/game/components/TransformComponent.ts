import { Component, Vector } from '../../engine';

export default class TransformComponent extends Component {
    /**
     * LEGACY (coordinate-system version 1): top-left, Y-down world position.
     *
     * Migration target (version 2): centre position in a Y-up world. Do not add
     * new code that depends on the legacy anchor or Y direction.
     */
    position: Vector;
    scale: Vector;
    /**
     * Rotation in degrees. Version 1 is interpreted by the Y-down canvas;
     * version 2 will define positive rotation as counter-clockwise in world
     * space.
     */
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
