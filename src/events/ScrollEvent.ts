import GameEvent from '../event-bus/GameEvent';

export default class ScrollEvent extends GameEvent {
    direction: 'up' | 'down';

    constructor(direction: 'up' | 'down') {
        super();
        this.direction = direction;
    }
}
