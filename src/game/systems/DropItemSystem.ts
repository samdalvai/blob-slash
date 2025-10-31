import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import {
    AnimationComponent,
    BoxColliderComponent,
    DropItemOnDeathComponent,
    LifetimeComponent,
    PickableItemComponent,
    ShadowComponent,
    SpriteComponent,
    TransformComponent,
} from '../components';
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
        if (event.entity.hasComponent(DropItemOnDeathComponent)) {
            const dropItemOnDeath = event.entity.getComponent(DropItemOnDeathComponent);

            if (!dropItemOnDeath) {
                throw new Error('Could not find DropItemOnDeathComponent of entity with id ' + event.entity.getId());
            }

            const randomValue = Math.random() * 100;

            if (randomValue < dropItemOnDeath.dropPercentage) {
                switch (dropItemOnDeath.droppedItem) {
                    case 'health': {
                        const transform = event.entity.getComponent(TransformComponent);

                        if (!transform) {
                            throw new Error(
                                'Could not find TransformComponent of entity with id ' + event.entity.getId(),
                            );
                        }

                        const healthGlobe = event.entity.registry.createEntity();
                        healthGlobe.addComponent(TransformComponent, {
                            x: transform.position.x,
                            y: transform.position.y,
                        });
                        healthGlobe.addComponent(SpriteComponent, 'health_globe', 32, 32, 2);
                        healthGlobe.addComponent(AnimationComponent, 4, 10);
                        healthGlobe.addComponent(ShadowComponent, 28, 16);
                        healthGlobe.addComponent(BoxColliderComponent, 32, 32);
                        healthGlobe.addComponent(PickableItemComponent, 'health', 50);
                        healthGlobe.addComponent(LifetimeComponent, 60000);

                        break;
                    }
                    default:
                        break;
                }
            }
        }
    };
}
