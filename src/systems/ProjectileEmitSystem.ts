import BoxColliderComponent from '../components/BoxColliderComponent';
import LifetimeComponent from '../components/LifetimeComponent';
import ParticleEmitComponent from '../components/ParticleEmitComponent';
import ProjectileComponent from '../components/ProjectileComponent';
import ProjectileEmitterComponent from '../components/ProjectileEmitterComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import ShadowComponent from '../components/ShadowComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Entity from '../ecs/Entity';
import Registry from '../ecs/Registry';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import MouseClickEvent from '../events/MouseClickEvent';
import { Vector } from '../types';
import { computeDirectionVector, computeUnitVector } from '../utils/vector';

export default class ProjectileEmitSystem extends System {
    registry: Registry;

    constructor(registry: Registry) {
        super();
        this.requireComponent(ProjectileEmitterComponent);
        this.requireComponent(TransformComponent);
        this.registry = registry;
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(MouseClickEvent, this, this.onKeyPressed);
    }

    onKeyPressed(event: MouseClickEvent) {
        const player = this.registry.getEntityByTag('player');

        if (!player) {
            throw new Error('Could not find entity with tag "Player"');
        }
        const projectileEmitter = player.getComponent(ProjectileEmitterComponent);
        const transform = player.getComponent(TransformComponent);

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

        this.emitProjectile(projectileEmitter, directionVector, transform, player, this.registry);
    }

    update(registry: Registry) {
        for (const entity of this.getSystemEntities()) {
            // const projectileEmitter = entity.getComponent(ProjectileEmitterComponent);
            // const transform = entity.getComponent(TransformComponent);
            // if (!projectileEmitter || !transform) {
            //     throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            // }
            // // If entity is player, skip automatic emission
            // if (entity.hasTag('player')) {
            //     continue;
            // }
            // this.emitProjectile(projectileEmitter, transform, entity, registry);
        }
    }

    private emitProjectile(
        projectileEmitter: ProjectileEmitterComponent,
        projectileDirection: Vector,
        transform: TransformComponent,
        entity: Entity,
        registry: Registry,
    ) {
        // Check if its time to re-emit a new projectile
        if (performance.now() - projectileEmitter.lastEmissionTime > projectileEmitter.repeatFrequency) {
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
                projectileEmitter.isFriendly,
                projectileEmitter.hitPercentDamage,
            );
            projectile.addComponent(LifetimeComponent, projectileEmitter.projectileDuration);
            projectile.addComponent(ParticleEmitComponent, 2, 300, 'rgba(255,255,255,0.5)', 100, 5, 16, 16);
            projectile.addComponent(ShadowComponent, 8, 4);

            // Update the projectile emitter component last emission to the current milliseconds
            projectileEmitter.lastEmissionTime = performance.now();
        }
    }
}
