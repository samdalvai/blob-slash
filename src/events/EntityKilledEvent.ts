import Entity from '../ecs/Entity';
import GameEvent from '../event-bus/GameEvent';

export default class EntityKilledEvent extends GameEvent {
    entity: Entity;

    constructor(entity: Entity) {
        super();
        this.entity = entity;
    }
}
