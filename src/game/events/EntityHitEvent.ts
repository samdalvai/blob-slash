import { Entity, GameEvent, Vector } from '../../engine';

export default class EntityHitEvent extends GameEvent {
    entity: Entity;
    hitPosition: Vector;

    constructor(entity: Entity, hitPosition: Vector) {
        super();
        this.hitPosition = hitPosition;
        this.entity = entity;
    }
}
