import GameEvent from '../event-bus/GameEvent';
import { Vector } from '../types';

export default class MousePressedEvent extends GameEvent {
    coordinates: Vector;

    constructor(coordinates: Vector) {
        super();
        this.coordinates = coordinates;
    }
}
