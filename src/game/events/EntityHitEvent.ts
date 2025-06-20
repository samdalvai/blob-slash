import Entity from '../../engine/ecs/Entity';
import GameEvent from '../../engine/event-bus/GameEvent';
import { Vector } from '../../engine/types/utils';

export default class EntityHitEvent extends GameEvent {
    entity: Entity;
    hitPosition: Vector;

    constructor(entity: Entity, hitPosition: Vector) {
        super();
        this.hitPosition = hitPosition;
        this.entity = entity;
    }
}
