import { GameEvent } from '../../engine';

export default class CameraShakeEvent extends GameEvent {
    shakeDuration: number;

    constructor(shakeDuration: number) {
        super();
        this.shakeDuration = shakeDuration;
    }
}
