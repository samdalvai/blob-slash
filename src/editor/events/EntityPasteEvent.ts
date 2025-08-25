import GameEvent from '../../engine/event-bus/GameEvent';
import { EntityMap } from '../../engine/types/map';

export default class EntityPasteEvent extends GameEvent {
    entities: EntityMap[];

    constructor(entities: EntityMap[]) {
        super();
        this.entities = entities;
    }
}
