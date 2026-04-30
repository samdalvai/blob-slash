import { GameEvent, Vector } from '../../engine';

export default class MouseMoveEvent extends GameEvent {
    coordinates: Vector;

    constructor(coordinates: Vector) {
        super();
        this.coordinates = coordinates;
    }
}
