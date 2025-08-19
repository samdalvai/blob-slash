import Entity from '../../engine/ecs/Entity';
import GameEvent from '../../engine/event-bus/GameEvent';

export default class EntitySelectEvent extends GameEvent {
    entity: Entity | null;

    constructor(entity: Entity | null) {
        super();
        this.entity = entity;
    }
}
