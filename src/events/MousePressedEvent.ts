import GameEvent from '../event-bus/GameEvent';
import { Vector } from '../types/utils';

export default class MousePressedEvent extends GameEvent {
    coordinates: Vector;
    button: 'left' | 'right';

    constructor(coordinates: Vector, button: 'left' | 'right') {
        super();
        this.coordinates = coordinates;
        this.button = button;
    }
}
