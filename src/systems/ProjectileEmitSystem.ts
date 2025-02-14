import AnimationComponent from '../components/AnimationComponent';
import BoxColliderComponent from '../components/BoxColliderComponent';
import LifetimeComponent from '../components/LifetimeComponent';
import ProjectileComponent from '../components/ProjectileComponent';
import ProjectileEmitterComponent from '../components/ProjectileEmitterComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Entity from '../ecs/Entity';
import Registry from '../ecs/Registry';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import KeyPressedEvent from '../events/KeyPressedEvent';

export default class ProjectileEmitSystem extends System {
    registry: Registry;

    constructor(registry: Registry) {
        super();
        this.requireComponent(ProjectileEmitterComponent);
        this.requireComponent(TransformComponent);
        this.registry = registry;
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(KeyPressedEvent, this, this.onKeyPressed);
    }

    onKeyPressed(event: KeyPressedEvent) {
        if (event.keyCode === 'Space') {
            const player = this.registry.getEntityByTag('player');

            if (!player) {
                throw new Error('Could not find entity with tag "Player"');
            }
            const projectileEmitter = player.getComponent(ProjectileEmitterComponent);
            const transform = player.getComponent(TransformComponent);

            if (!projectileEmitter || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + player.getId());
            }

            this.emitProjectile(projectileEmitter, transform, player, this.registry);
        }
    }

    update(registry: Registry) {
        for (const entity of this.getSystemEntities()) {
            const projectileEmitter = entity.getComponent(ProjectileEmitterComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!projectileEmitter || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            // If entity is player, skip automatic emission
            if (entity.hasTag('player')) {
                continue;
            }

            this.emitProjectile(projectileEmitter, transform, entity, registry);
        }
    }

    private emitProjectile(
        projectileEmitter: ProjectileEmitterComponent,
        transform: TransformComponent,
        entity: Entity,
        registry: Registry,
    ) {
        // Check if its time to re-emit a new projectile
        if (performance.now() - projectileEmitter.lastEmissionTime > projectileEmitter.repeatFrequency) {
            // Modify the direction of the projectile according to the rigid body direction
            const projectileVelocity = { ...projectileEmitter.projectileVelocity };

            if (entity.hasComponent(RigidBodyComponent)) {
                const rigidBody = entity.getComponent(RigidBodyComponent);

                if (!rigidBody) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                let directionX = 0;
                let directionY = 0;

                if (rigidBody.direction.x > 0) directionX = +1;
                if (rigidBody.direction.x < 0) directionX = -1;
                if (rigidBody.direction.y > 0) directionY = +1;
                if (rigidBody.direction.y < 0) directionY = -1;
                projectileVelocity.x = projectileEmitter.projectileVelocity.x * directionX + rigidBody.velocity.x;
                projectileVelocity.y = projectileEmitter.projectileVelocity.y * directionY + rigidBody.velocity.y;
            }

            // Add a new projectile entity to the registry
            const projectile = registry.createEntity();
            projectile.group('projectiles');
            projectile.addComponent(TransformComponent, { ...transform.position }, { x: 1.0, y: 1.0 }, 0.0);
            projectile.addComponent(RigidBodyComponent, projectileVelocity);
            projectile.addComponent(SpriteComponent, 'magic-missile-texture', 32, 32, 4);
            projectile.addComponent(BoxColliderComponent, 8, 8, { x: 12, y: 12 });
            projectile.addComponent(
                ProjectileComponent,
                projectileEmitter.isFriendly,
                projectileEmitter.hitPercentDamage,
            );
            projectile.addComponent(LifetimeComponent, projectileEmitter.projectileDuration);

            // Update the projectile emitter component last emission to the current milliseconds
            projectileEmitter.lastEmissionTime = performance.now();
        }
    }
}
