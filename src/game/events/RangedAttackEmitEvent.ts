import GameEvent from '../../engine/event-bus/GameEvent';
import { Vector } from '../../engine/types/utils';

export default class RangedAttackEmitEvent extends GameEvent {
    coordinates: Vector;

    constructor(coordinates: Vector) {
        super();
        this.coordinates = coordinates;
    }
}
