import BoxColliderComponent from '../components/BoxColliderComponent';
import EntityEffectComponent from '../components/EntityEffectComponent';
import EntityFollowComponent from '../components/EntityFollowComponent';
import LifetimeComponent from '../components/LifetimeComponent';
import ParticleEmitComponent from '../components/ParticleEmitComponent';
import ProjectileComponent from '../components/ProjectileComponent';
import RangedAttackEmitterComponent from '../components/RangedAttackEmitterComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import ShadowComponent from '../components/ShadowComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Entity from '../ecs/Entity';
import Registry from '../ecs/Registry';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import RangedAttackEmitEvent from '../events/RangedAttackEmitEvent';
import { Vector } from '../types';
import { computeDirectionVector, computeUnitVector } from '../utils/vector';

export default class RangedAttackEmitSystem extends System {
    registry: Registry;

    constructor(registry: Registry) {
        super();
        this.requireComponent(RangedAttackEmitterComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
        this.registry = registry;
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(RangedAttackEmitEvent, this, this.onRangedAttackEmitEvent);
    }

    onRangedAttackEmitEvent(event: RangedAttackEmitEvent) {
        const player = this.registry.getEntityByTag('player');

        if (!player) {
            throw new Error('Could not find entity with tag "Player"');
        }

        const transform = player.getComponent(TransformComponent);
        const sprite = player.getComponent(SpriteComponent);
        const projectileEmitter = player.getComponent(RangedAttackEmitterComponent);

        if (!projectileEmitter || !transform || !sprite) {
            throw new Error('Could not find some component(s) of entity with id ' + player.getId());
        }

        const directionVector = computeDirectionVector(
            transform.position.x + (sprite.width / 2) * transform.scale.x,
            transform.position.y + (sprite.height / 2) * transform.scale.y,
            event.coordinates.x,
            event.coordinates.y,
            projectileEmitter.projectileVelocity,
        );

        this.emitRangedAttack(projectileEmitter, directionVector, transform, player, this.registry);
    }

    update() {
        for (const entity of this.getSystemEntities()) {
            // If entity is player, skip automatic emission
            if (entity.hasTag('player')) {
                continue;
            }

            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);
            const projectileEmitter = entity.getComponent(RangedAttackEmitterComponent);

            if (!projectileEmitter || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (entity.hasComponent(EntityFollowComponent)) {
                const entityFollow = entity.getComponent(EntityFollowComponent);

                if (!entityFollow) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                const followedEntity = entityFollow.followedEntity;

                if (followedEntity) {
                    const followedEntityTransform = followedEntity.getComponent(TransformComponent);
                    const followedEntitySprite = followedEntity.getComponent(SpriteComponent);

                    if (!followedEntityTransform || !followedEntitySprite) {
                        throw new Error('Could not find player transform and/or sprite component');
                    }

                    const directionVector = computeDirectionVector(
                        transform.position.x + (sprite.width / 2) * transform.scale.x,
                        transform.position.y + (sprite.height / 2) * transform.scale.y,
                        followedEntityTransform.position.x +
                            (followedEntitySprite.width / 2) * followedEntityTransform.scale.x,
                        followedEntityTransform.position.y +
                            (followedEntitySprite.height / 2) * followedEntityTransform.scale.y,
                        projectileEmitter.projectileVelocity,
                    );

                    this.emitRangedAttack(projectileEmitter, directionVector, transform, entity, this.registry);
                }
            }
        }
    }

    private emitRangedAttack = (
        rangedAttackEmitter: RangedAttackEmitterComponent,
        projectileDirection: Vector,
        transform: TransformComponent,
        entity: Entity,
        registry: Registry,
    ) => {
        // Check if its time to re-emit a new projectile
        if (performance.now() - rangedAttackEmitter.lastEmissionTime > rangedAttackEmitter.repeatFrequency) {
            if (entity.hasComponent(RigidBodyComponent)) {
                const rigidBody = entity.getComponent(RigidBodyComponent);

                if (!rigidBody) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                rigidBody.direction = computeUnitVector(projectileDirection.x, projectileDirection.y);
            }

            const projectilePosition = { x: transform.position.x - 16, y: transform.position.y - 16 };

            if (entity.hasComponent(SpriteComponent)) {
                const sprite = entity.getComponent(SpriteComponent);

                if (!sprite) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                projectilePosition.x += (sprite.width / 2) * transform.scale.x;
                projectilePosition.y += (sprite.height / 2) * transform.scale.y;
            }

            // Add a new projectile entity to the registry
            const projectile = registry.createEntity();
            projectile.group('projectiles');
            projectile.addComponent(TransformComponent, projectilePosition, { x: 1.0, y: 1.0 }, 0.0);
            projectile.addComponent(RigidBodyComponent, projectileDirection);
            projectile.addComponent(SpriteComponent, 'magic-sphere-texture', 32, 32, 4);
            projectile.addComponent(BoxColliderComponent, 8, 8, { x: 12, y: 12 });
            projectile.addComponent(
                ProjectileComponent,
                rangedAttackEmitter.isFriendly,
                rangedAttackEmitter.hitPercentDamage,
            );
            projectile.addComponent(LifetimeComponent, rangedAttackEmitter.projectileDuration);
            projectile.addComponent(ParticleEmitComponent, 2, 300, 'rgba(255,255,255,0.5)', 100, 5, 16, 16);
            projectile.addComponent(ShadowComponent, 8, 4);
            projectile.addComponent(EntityEffectComponent);

            // Update the projectile emitter component last emission to the current milliseconds
            rangedAttackEmitter.lastEmissionTime = performance.now();
        }
    };
}
