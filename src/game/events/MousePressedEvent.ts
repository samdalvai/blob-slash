import GameEvent from '../../core/event-bus/GameEvent';
import { MouseButton } from '../../core/types/control';
import { Vector } from '../../core/types/utils';

export default class MousePressedEvent extends GameEvent {
    coordinates: Vector;
    button: MouseButton;

    constructor(coordinates: Vector, button: MouseButton) {
        super();
        this.coordinates = coordinates;
        this.button = button;
    }
}
