import EntityEffectComponent from '../components/EntityEffectComponent';
import SlowTimeComponent from '../components/SlowTimeComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../ecs/Registry';
import System from '../ecs/System';
import { isPointInsideCircle } from '../utils/circle';

export default class SlowTimeSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
        this.requireComponent(EntityEffectComponent);
    }

    update(registry: Registry) {
        const slowTimeEntities = registry.getEntitiesByGroup('slow-time');
        const slowTimeCircles: { x: number; y: number; radius: number; slowTimePercentage: number }[] = [];

        for (const entity of slowTimeEntities) {
            const slowTime = entity.getComponent(SlowTimeComponent);
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!slowTime || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const circleX = transform.position.x + (sprite.width / 2) * transform.scale.x;
            const circleY = transform.position.y + (sprite.height / 2) * transform.scale.y;

            slowTimeCircles.push({
                x: circleX,
                y: circleY,
                radius: slowTime.radius,
                slowTimePercentage: slowTime.slowTimePercentage,
            });
        }

        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);
            const entityEffect = entity.getComponent(EntityEffectComponent);

            if (!transform || !sprite || !entityEffect) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const entityX = transform.position.x + (transform.scale.x * sprite.width) / 2;
            const entityY = transform.position.y + (transform.scale.y * sprite.height) / 2;

            let isInSlowTimeCircle = false;
            let slowTimePercentage = 1.0;

            for (const circle of slowTimeCircles) {
                if (isPointInsideCircle(entityX, entityY, circle.x, circle.y, circle.radius)) {
                    isInSlowTimeCircle = true;
                    if (circle.slowTimePercentage < slowTimePercentage) {
                        slowTimePercentage = circle.slowTimePercentage;
                    }
                }
            }

            if (isInSlowTimeCircle) {
                entityEffect.slowed = true;
                entityEffect.slowedPercentage = slowTimePercentage;
            } else {
                entityEffect.slowed = false;
                entityEffect.slowedPercentage = slowTimePercentage;
            }
        }
    }
}
