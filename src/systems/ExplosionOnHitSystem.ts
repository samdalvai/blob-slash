import AnimationComponent from '../components/AnimationComponent';
import LifetimeComponent from '../components/LifetimeComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import EntityHitEvent from '../events/EntityHitEvent';

export default class ExplosionOnHitSystem extends System {
    constructor() {
        super();
    }

    subscribeToEvents = (eventBus: EventBus) => {
        eventBus.subscribeToEvent(EntityHitEvent, this, this.onEntityHit);
    };

    onEntityHit = (event: EntityHitEvent) => {
        const entity = event.entity;

        if (entity.hasComponent(TransformComponent) && entity.hasComponent(SpriteComponent)) {
            const transform = entity.getComponent(TransformComponent);

            if (!transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const { x, y } = event.hitPosition;
            const explosionAnimation = entity.registry.createEntity();
            explosionAnimation.addComponent(
                TransformComponent,
                {
                    x: x - 16,
                    y: y - 16,
                },
                { x: 1, y: 1 },
                0,
            );
            explosionAnimation.addComponent(SpriteComponent, 'explosion-small-blue-texture', 32, 32, 3, 0);
            explosionAnimation.addComponent(AnimationComponent, 7, 10, false);
            explosionAnimation.addComponent(LifetimeComponent, 500);
        }
    };
}
