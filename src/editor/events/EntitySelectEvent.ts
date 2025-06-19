import Entity from '../../core/ecs/Entity';
import GameEvent from '../../core/event-bus/GameEvent';

export default class EntitySelectEvent extends GameEvent {
    entity: Entity;

    constructor(entity: Entity) {
        super();
        this.entity = entity;
    }
}
