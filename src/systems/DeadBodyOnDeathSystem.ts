import DeadBodyOnDeathComponent from '../components/DeadBodyOnDeathComponent';
import LifetimeComponent from '../components/LifetimeComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import EntityKilledEvent from '../events/EntityKilledEvent';

export default class DeadBodyOnDeathSystem extends System {
    constructor() {
        super();
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(EntityKilledEvent, this, this.onEntityDeath);
    }

    onEntityDeath = (event: EntityKilledEvent) => {
        const entity = event.entity;

        if (entity.hasComponent(DeadBodyOnDeathComponent)) {
            const sprite = entity.getComponent(SpriteComponent);
            const transform = entity.getComponent(TransformComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);

            if (sprite && transform && rigidBody) {
                const registry = entity.registry;

                const deadBody = registry.createEntity();
                deadBody.addComponent(
                    TransformComponent,
                    { ...transform.position },
                    { ...transform.scale },
                    transform.rotation,
                );
                deadBody.addComponent(RigidBodyComponent, { x: 0, y: 0 }, { ...rigidBody.direction });

                let spriteOffset = 0;

                if (rigidBody.direction.x > 0) {
                    spriteOffset = 1;
                } else if (rigidBody.direction.y > 0) {
                    spriteOffset = 2;
                } else if (rigidBody.direction.x < 0) {
                    spriteOffset = 3;
                }

                deadBody.addComponent(
                    SpriteComponent,
                    sprite.assetId,
                    sprite.width,
                    sprite.height,
                    sprite.zIndex,
                    0,
                    sprite.height * 12 + sprite.height * spriteOffset,
                );
                deadBody.addComponent(LifetimeComponent, 5000);
            }
        }
    };
}
