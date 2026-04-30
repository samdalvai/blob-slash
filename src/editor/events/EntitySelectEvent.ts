import { Entity, GameEvent } from '../../engine';

export default class EntitySelectEvent extends GameEvent {
    entities: Entity[];

    constructor(entities: Entity[]) {
        super();
        this.entities = entities;
    }
}
