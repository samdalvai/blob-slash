import GameEvent from '../../engine/event-bus/GameEvent';
import { MouseButton } from '../../engine/types/control';
import { Vector } from '../../engine/types/utils';

export default class MouseReleasedEvent extends GameEvent {
    coordinates: Vector;
    button: MouseButton;

    constructor(coordinates: Vector, button: MouseButton) {
        super();
        this.coordinates = coordinates;
        this.button = button;
    }
}
