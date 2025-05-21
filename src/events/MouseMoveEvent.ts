import GameEvent from '../event-bus/GameEvent';
import { Vector } from '../types/utils';

export default class MouseMoveEvent extends GameEvent {
    coordinates: Vector;

    constructor(coordinates: Vector) {
        super();
        this.coordinates = coordinates;
    }
}
