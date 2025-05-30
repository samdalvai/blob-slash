import CameraShakeComponent from '../components/CameraShakeComponent';
import EntityEffectComponent from '../components/EntityEffectComponent';
import HealthComponent from '../components/HealthComponent';
import MeleeAttackComponent from '../components/MeleeAttackComponent';
import ProjectileComponent from '../components/ProjectileComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Entity from '../ecs/Entity';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import CameraShakeEvent from '../events/CameraShakeEvent';
import CollisionEvent from '../events/CollisionEvent';
import EntityHitEvent from '../events/EntityHitEvent';
import EntityKilledEvent from '../events/EntityKilledEvent';

export default class DamageSystem extends System {
    eventBus: EventBus;

    constructor(eventBus: EventBus) {
        super();
        this.eventBus = eventBus;
        this.requireComponent(HealthComponent);
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(CollisionEvent, this, this.onCollision);
    }

    onCollision(event: CollisionEvent) {
        const a = event.a;
        const b = event.b;

        if (!this.handleCollision(a, b)) {
            this.handleCollision(b, a);
        }
    }

    handleCollision = (source: Entity, target: Entity) => {
        if (source.belongsToGroup('projectiles') && target.hasTag('player')) {
            this.onProjectileHitsPlayer(source, target);
            return true;
        }

        if (source.belongsToGroup('projectiles') && target.belongsToGroup('enemies')) {
            this.onProjectileHitsEnemy(source, target);
            return true;
        }

        if (source.belongsToGroup('melee-attack') && (target.hasTag('player') || target.belongsToGroup('enemies'))) {
            this.onMeleeAttackHitsEntity(source, target);
            return true;
        }

        return false;
    };

    onProjectileHitsPlayer(projectile: Entity, player: Entity) {
        const projectileComponent = projectile.getComponent(ProjectileComponent);

        if (!projectileComponent) {
            throw new Error('Could not find some component(s) of entity with id ' + projectile.getId());
        }

        if (!projectileComponent.isFriendly && player.hasComponent(HealthComponent)) {
            const health = player.getComponent(HealthComponent);

            if (!health) {
                throw new Error('Could not find some component(s) of entity with id ' + player.getId());
            }

            health.healthPercentage -= projectileComponent.hitPercentDamage;
            health.lastDamageTime = performance.now();

            projectile.kill();

            if (player.hasComponent(CameraShakeComponent)) {
                const cameraShake = player.getComponent(CameraShakeComponent);

                if (!cameraShake) {
                    throw new Error('Could not find some component(s) of entity with id ' + player.getId());
                }

                this.eventBus.emitEvent(CameraShakeEvent, cameraShake.shakeDuration);
            }

            if (projectile.hasComponent(TransformComponent) && projectile.hasComponent(SpriteComponent)) {
                const transform = projectile.getComponent(TransformComponent);
                const sprite = projectile.getComponent(SpriteComponent);

                if (!transform || !sprite) {
                    throw new Error('Could not find some component(s) of entity with id ' + projectile.getId());
                }

                this.eventBus.emitEvent(EntityHitEvent, player, {
                    x: transform.position.x + (sprite.width / 2) * transform.scale.x,
                    y: transform.position.y + (sprite.height / 2) * transform.scale.y,
                });
            }
        }
    }

    onProjectileHitsEnemy(projectile: Entity, enemy: Entity) {
        const projectileComponent = projectile.getComponent(ProjectileComponent);

        if (!projectileComponent) {
            throw new Error('Could not find some component(s) of entity with id ' + projectile.getId());
        }

        if (projectileComponent.isFriendly && enemy.hasComponent(HealthComponent)) {
            const health = enemy.getComponent(HealthComponent);

            if (!health) {
                throw new Error('Could not find some component(s) of entity with id ' + enemy.getId());
            }

            health.healthPercentage -= projectileComponent.hitPercentDamage;
            health.lastDamageTime = performance.now();

            projectile.kill();

            if (projectile.hasComponent(TransformComponent) && projectile.hasComponent(SpriteComponent)) {
                const transform = projectile.getComponent(TransformComponent);
                const sprite = projectile.getComponent(SpriteComponent);

                if (!transform || !sprite) {
                    throw new Error('Could not find some component(s) of entity with id ' + projectile.getId());
                }

                this.eventBus.emitEvent(EntityHitEvent, enemy, {
                    x: transform.position.x + (sprite.width / 2) * transform.scale.x,
                    y: transform.position.y + (sprite.height / 2) * transform.scale.y,
                });
            }
        }
    }

    onMeleeAttackHitsEntity(meleeAttack: Entity, entity: Entity) {
        if (meleeAttack.hasComponent(MeleeAttackComponent)) {
            const meleeAttackComp = meleeAttack.getComponent(MeleeAttackComponent);

            if (!meleeAttackComp) {
                throw new Error('Could not find some component(s) of entity with id ' + meleeAttack.getId());
            }

            if (entity.hasTag('player') && meleeAttackComp.isFriendly) {
                return;
            }

            const health = entity.getComponent(HealthComponent);

            if (!health) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            health.healthPercentage -= meleeAttackComp.hitPercentDamage;
            health.lastDamageTime = performance.now();

            meleeAttack.removeComponent(MeleeAttackComponent);
        }
    }

    update = () => {
        for (const entity of this.getSystemEntities()) {
            const health = entity.getComponent(HealthComponent);

            if (!health) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (health.healthPercentage <= 0) {
                this.eventBus.emitEvent(EntityKilledEvent, entity);
                entity.kill();
            }

            if (entity.hasComponent(EntityEffectComponent)) {
                const entityEffect = entity.getComponent(EntityEffectComponent);

                if (!entityEffect) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                if (!entityEffect.hasDamageOverTime) {
                    continue;
                }

                if (performance.now() - entityEffect.lastDamageTime >= 1000) {
                    health.healthPercentage -= entityEffect.damagePerSecond;
                    health.lastDamageTime = performance.now();

                    entityEffect.lastDamageTime = performance.now();
                }
            }
        }
    };
}
