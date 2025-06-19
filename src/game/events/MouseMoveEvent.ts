import GameEvent from '../../core/event-bus/GameEvent';
import { Vector } from '../../core/types/utils';

export default class MouseMoveEvent extends GameEvent {
    coordinates: Vector;

    constructor(coordinates: Vector) {
        super();
        this.coordinates = coordinates;
    }
}
