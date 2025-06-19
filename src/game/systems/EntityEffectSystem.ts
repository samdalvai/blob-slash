import DamageRadiusComponent from '../components/DamageRadiusComponent';
import EntityEffectComponent from '../components/EntityEffectComponent';
import EntityFollowComponent from '../components/EntityFollowComponent';
import SlowTimeComponent from '../components/SlowTimeComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../../core/ecs/Registry';
import System from '../../core/ecs/System';
import { isPointInsideCircle } from '../../core/utils/circle';

export default class EntityEffectSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
        this.requireComponent(EntityEffectComponent);
    }

    update(registry: Registry) {
        const slowTimeCircles = this.getSlowTimeCircles(registry);
        const damageRadiusCircles = this.getDamageRadiusCircles(registry);

        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);
            const entityEffect = entity.getComponent(EntityEffectComponent);

            if (!transform || !sprite || !entityEffect) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const entityX = transform.position.x + (transform.scale.x * sprite.width) / 2;
            const entityY = transform.position.y + (transform.scale.y * sprite.height) / 2;

            /******************************/
            /** Handle slow time effects **/
            /******************************/
            let isInSlowTimeCircle = false;
            let slowTimePercentage = 1.0;
            let isFriendlySlowTime = false;

            for (const circle of slowTimeCircles) {
                if (isPointInsideCircle(entityX, entityY, circle.x, circle.y, circle.radius)) {
                    isInSlowTimeCircle = true;
                    isFriendlySlowTime = circle.isFriendly;
                    if (circle.slowTimePercentage < slowTimePercentage) {
                        slowTimePercentage = circle.slowTimePercentage;
                    }
                }
            }

            if (isInSlowTimeCircle) {
                entityEffect.slowed = true;
                entityEffect.slowedPercentage = slowTimePercentage;

                if (entity.hasComponent(EntityFollowComponent)) {
                    const entityFollow = entity.getComponent(EntityFollowComponent);
                    if (!entityFollow) {
                        throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                    }

                    if (isFriendlySlowTime) {
                        const player = entity.registry.getEntityByTag('player');

                        if (!player) {
                            console.warn('Player entity not found');
                            return;
                        }

                        entityFollow.followedEntity = player;
                        entityFollow.startFollowTime = performance.now();
                    }
                }
            } else {
                entityEffect.slowed = false;
                entityEffect.slowedPercentage = slowTimePercentage;
            }

            /*************************************/
            /** Handle damage over time effects **/
            /*************************************/
            let isInDamageRadiusCircle = false;
            let damagePerSecond = 0;
            let isFriendlyDamageRadius = false;

            for (const circle of damageRadiusCircles) {
                if (isPointInsideCircle(entityX, entityY, circle.x, circle.y, circle.radius)) {
                    isInDamageRadiusCircle = true;
                    isFriendlyDamageRadius = circle.isFriendly;
                    if (circle.damagePerSecond > damagePerSecond) {
                        damagePerSecond = circle.damagePerSecond;
                    }
                }
            }

            if (isInDamageRadiusCircle) {
                entityEffect.hasDamageOverTime = true;
                entityEffect.damagePerSecond = damagePerSecond;

                if (entity.hasComponent(EntityFollowComponent)) {
                    const entityFollow = entity.getComponent(EntityFollowComponent);
                    if (!entityFollow) {
                        throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                    }

                    if (isFriendlyDamageRadius) {
                        const player = entity.registry.getEntityByTag('player');

                        if (!player) {
                            console.warn('Player entity not found');
                            return;
                        }

                        entityFollow.followedEntity = player;
                        entityFollow.startFollowTime = performance.now();
                    }
                }
            } else {
                entityEffect.hasDamageOverTime = false;
                entityEffect.damagePerSecond = 0;
            }
        }
    }

    getSlowTimeCircles = (registry: Registry) => {
        const slowTimeEntities = registry.getEntitiesByGroup('slow-time');
        const slowTimeCircles: {
            x: number;
            y: number;
            radius: number;
            slowTimePercentage: number;
            isFriendly: boolean;
        }[] = [];

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
                isFriendly: slowTime.isFriendly,
            });
        }

        return slowTimeCircles;
    };

    getDamageRadiusCircles = (registry: Registry) => {
        const damageRadiusEntities = registry.getEntitiesByGroup('damage-radius');
        const damareRadiusCircles: {
            x: number;
            y: number;
            radius: number;
            damagePerSecond: number;
            isFriendly: boolean;
        }[] = [];

        for (const entity of damageRadiusEntities) {
            const damageRadius = entity.getComponent(DamageRadiusComponent);
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!damageRadius || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const circleX = transform.position.x + (sprite.width / 2) * transform.scale.x;
            const circleY = transform.position.y + (sprite.height / 2) * transform.scale.y;

            damareRadiusCircles.push({
                x: circleX,
                y: circleY,
                radius: damageRadius.radius,
                damagePerSecond: damageRadius.damagePerSecond,
                isFriendly: damageRadius.isFriendly,
            });
        }

        return damareRadiusCircles;
    };
}
