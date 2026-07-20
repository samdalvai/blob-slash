import AnimationComponent from '../components/AnimationComponent';
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
import { Entity, Registry, System, EventBus, Vector, computeDirectionVector, computeUnitVector, Engine } from '../../engine';
import RangedAttackEmitEvent from '../events/RangedAttackEmitEvent';

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
        const projectileEmitter = player.getComponent(RangedAttackEmitterComponent);

        if (!projectileEmitter || !transform) {
            throw new Error('Could not find some component(s) of entity with id ' + player.getId());
        }

        const directionVector = computeDirectionVector(
            transform.position.x,
            transform.position.y,
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
            const projectileEmitter = entity.getComponent(RangedAttackEmitterComponent);

            if (!projectileEmitter || !transform) {
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
                    if (!followedEntityTransform) {
                        throw new Error('Could not find player transform and/or sprite component');
                    }

                    const directionVector = computeDirectionVector(
                        transform.position.x,
                        transform.position.y,
                        followedEntityTransform.position.x,
                        followedEntityTransform.position.y,
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

            const projectilePosition = { ...transform.position };

            // Add a new projectile entity to the registry
            const projectile = registry.createEntity();
            projectile.group('projectiles');
            projectile.addComponent(TransformComponent, projectilePosition, { x: 1.0, y: 1.0 }, 0.0);
            projectile.addComponent(RigidBodyComponent, projectileDirection);
            projectile.addComponent(SpriteComponent, 'magic_sphere', 32, 32, 4);
            projectile.addComponent(BoxColliderComponent, 8, 8);
            projectile.addComponent(
                ProjectileComponent,
                rangedAttackEmitter.isFriendly,
                rangedAttackEmitter.hitPercentDamage,
            );
            projectile.addComponent(LifetimeComponent, rangedAttackEmitter.projectileDuration);
            projectile.addComponent(ParticleEmitComponent, 2, 300, 'rgba(255,255,255,0.5)', 100, 5);
            projectile.addComponent(ShadowComponent, 8, 4);
            projectile.addComponent(EntityEffectComponent);

            // Update the projectile emitter component last emission to the current milliseconds
            rangedAttackEmitter.lastEmissionTime = performance.now();

            if (entity.hasTag('player')) {
                const framesPerSecond = 8 / (rangedAttackEmitter.repeatFrequency / 1000);
                const cooldownAnimation = this.registry.createEntity();
                cooldownAnimation.addComponent(
                    SpriteComponent,
                    'cooldown_skill',
                    32,
                    32,
                    2
                );
                cooldownAnimation.addComponent(AnimationComponent, 8, framesPerSecond, false);
                cooldownAnimation.addComponent(
                    TransformComponent,
                    { x: 2 * 25 + 32 * 3 * 2 + 32, y: Engine.windowHeight - 64 - 25 + 32 },
                    { x: 2, y: 2 },
                    0,
                    true
                );
                cooldownAnimation.addComponent(LifetimeComponent, rangedAttackEmitter.repeatFrequency);
            }
        }
    };
}
