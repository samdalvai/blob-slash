import RigidBodyComponent from '../components/RigidBodyComponent';
import SlowTimeComponent from '../components/SlowTimeComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../ecs/Registry';
import System from '../ecs/System';
import { Vector } from '../types';
import { isPointInsideCircle } from '../utils/circle';

export default class SlowTimeSystem extends System {
    previousEntitiesVelocity: Map<number, Vector>;

    constructor() {
        super();
        this.requireComponent(RigidBodyComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);

        this.previousEntitiesVelocity = new Map();
    }

    update(registry: Registry) {
        const slowTimeEntities = registry.getEntitiesByGroup('slow-time');

        if (slowTimeEntities.length === 0) {
            return;
        }

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
            const rigidBody = entity.getComponent(RigidBodyComponent);
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!rigidBody || !transform || !sprite) {
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
                if (this.previousEntitiesVelocity.get(entity.getId()) !== undefined) {
                    continue;
                }

                this.previousEntitiesVelocity.set(entity.getId(), { x: rigidBody.velocity.x, y: rigidBody.velocity.y });
                rigidBody.velocity = {
                    x: rigidBody.velocity.x * slowTimePercentage,
                    y: rigidBody.velocity.y * slowTimePercentage,
                };
            } else {
                const previousVelocity = this.previousEntitiesVelocity.get(entity.getId());
                if (previousVelocity === undefined) {
                    continue;
                }

                rigidBody.velocity = { x: previousVelocity.x, y: previousVelocity.y };
                this.previousEntitiesVelocity.delete(entity.getId());
            }
        }
    }
}
