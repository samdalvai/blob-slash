import Entity from '../../core/ecs/Entity';
import GameEvent from '../../core/event-bus/GameEvent';
import { Vector } from '../../core/types/utils';

export default class EntityHitEvent extends GameEvent {
    entity: Entity;
    hitPosition: Vector;

    constructor(entity: Entity, hitPosition: Vector) {
        super();
        this.hitPosition = hitPosition;
        this.entity = entity;
    }
}
