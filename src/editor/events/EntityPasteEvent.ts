import { GameEvent, EntityMap } from '../../engine';

export default class EntityPasteEvent extends GameEvent {
    entities: EntityMap[];

    constructor(entities: EntityMap[]) {
        super();
        this.entities = entities;
    }
}
