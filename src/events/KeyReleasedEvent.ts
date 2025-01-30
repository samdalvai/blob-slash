import GameEvent from '../event-bus/GameEvent';

export default class KeyReleasedEvent extends GameEvent {
    keyCode: string;

    constructor(keyCode: string) {
        super();
        this.keyCode = keyCode;
    }
}
