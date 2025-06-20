import Entity from '../../engine/ecs/Entity';
import GameEvent from '../../engine/event-bus/GameEvent';

export default class EntitySelectEvent extends GameEvent {
    entity: Entity;

    constructor(entity: Entity) {
        super();
        this.entity = entity;
    }
}
