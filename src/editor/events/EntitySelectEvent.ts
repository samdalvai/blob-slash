import Entity from '../../engine/ecs/Entity';
import GameEvent from '../../engine/event-bus/GameEvent';

export default class EntitySelectEvent extends GameEvent {
    entities: Entity[];

    constructor(entities: Entity[]) {
        super();
        this.entities = entities;
    }
}
