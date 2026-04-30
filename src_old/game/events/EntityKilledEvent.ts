import { Entity, GameEvent } from '../../engine';

export default class EntityKilledEvent extends GameEvent {
    entity: Entity;

    constructor(entity: Entity) {
        super();
        this.entity = entity;
    }
}
