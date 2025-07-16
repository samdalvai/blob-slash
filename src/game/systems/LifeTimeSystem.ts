import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import LifetimeComponent from '../components/LifetimeComponent';
import EntityKilledEvent from '../events/EntityKilledEvent';

export default class LifetimeSystem extends System {
    constructor() {
        super();
        this.requireComponent(LifetimeComponent);
    }

    update(eventBus: EventBus) {
        for (const entity of this.getSystemEntities()) {
            const lifeTime = entity.getComponent(LifetimeComponent);

            if (!lifeTime) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            // Kill projectiles after they reach their duration limit
            if (performance.now() - lifeTime.startTime > lifeTime.lifetime) {
                entity.kill();
                eventBus.emitEvent(EntityKilledEvent, entity);
            }
        }
    }
}
