import Entity from '../../engine/ecs/Entity';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import { HealthComponent, PickableItemComponent } from '../components';
import { PickupEffect } from '../components/PickableItemComponent';
import CollisionEvent from '../events/CollisionEvent';

export default class PickItemSystem extends System {
    constructor() {
        super();
        this.requireComponent(PickableItemComponent);
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(CollisionEvent, this, this.onCollision);
    }

    onCollision = (event: CollisionEvent) => {
        const entityA = event.a;
        const entityB = event.b;
        if (entityA.hasComponent(PickableItemComponent)) {
            this.handlePickItem(entityB, entityA);
        }

        if (entityB.hasComponent(PickableItemComponent)) {
            this.handlePickItem(entityA, entityB);
        }
    };

    handlePickItem = (entityPickingItem: Entity, pickedItem: Entity) => {
        const pickableItem = pickedItem.getComponent(PickableItemComponent);

        if (!pickableItem) {
            throw new Error('Could not find pickable item component of entity with id ' + pickedItem.getId());
        }

        switch (pickableItem.effectOnPickup) {
            case PickupEffect.HEALTH:
                if (entityPickingItem.hasComponent(HealthComponent)) {
                    const health = entityPickingItem.getComponent(HealthComponent);

                    if (!health) {
                        throw new Error(
                            'Could not find health component component of entity with id ' + entityPickingItem.getId(),
                        );
                    }

                    health.healthPercentage = Math.min(health.healthPercentage + pickableItem.effectValue, 100);
                    health.lastDamageTime = performance.now();
                    pickedItem.kill();
                }
                break;
            case PickupEffect.NONE:
                break;
            default:
                break;
        }
    };
}
