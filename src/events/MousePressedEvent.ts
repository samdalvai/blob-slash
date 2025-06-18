import GameEvent from '../event-bus/GameEvent';
import { MouseButton } from '../types/control';
import { Vector } from '../types/utils';

export default class MousePressedEvent extends GameEvent {
    coordinates: Vector;
    button: MouseButton;

    constructor(coordinates: Vector, button: MouseButton) {
        super();
        this.coordinates = coordinates;
        this.button = button;
    }
}
