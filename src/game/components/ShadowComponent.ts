import { Component } from '../../engine';

export default class ShadowComponent extends Component {
    width: number;
    height: number;
    /** Horizontal offset from the sprite centre. */
    offsetX: number;
    /** Y-up adjustment from the bottom edge of the scaled sprite. */
    offsetY: number;

    constructor(width = 0, height = 0, offsetX = 0, offsetY = 0) {
        super();
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
}
