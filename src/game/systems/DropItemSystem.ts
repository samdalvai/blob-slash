import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import { DropItemOnDeathComponent } from '../components';
import EntityKilledEvent from '../events/EntityKilledEvent';

export default class DropItemSystem extends System {
    constructor() {
        super();
        this.requireComponent(DropItemOnDeathComponent);
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(EntityKilledEvent, this, this.onEntityDeath);
    }

    onEntityDeath = (event: EntityKilledEvent) => {
        // Do something
    };
}
