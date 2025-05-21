import AnimationComponent from '../components/AnimationComponent';
import BoxColliderComponent from '../components/BoxColliderComponent';
import CameraFollowComponent from '../components/CameraFollowComponent';
import CameraShakeComponent from '../components/CameraShakeComponent';
import DamageRadiusComponent from '../components/DamageRadiusComponent';
import DeadBodyOnDeathComponent from '../components/DeadBodyOnDeathComponent';
import EntityDestinationComponent from '../components/EntityDestinationComponent';
import EntityEffectComponent from '../components/EntityEffectComponent';
import EntityFollowComponent from '../components/EntityFollowComponent';
import HealthComponent from '../components/HealthComponent';
import HighlightComponent from '../components/HighlightComponent';
import LifetimeComponent from '../components/LifetimeComponent';
import LightEmitComponent from '../components/LightEmitComponent';
import ParticleComponent from '../components/ParticleComponent';
import ParticleEmitComponent from '../components/ParticleEmitComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteStateComponent from '../components/SpriteStateComponent';
import TransformComponent from '../components/TransformComponent';
import Entity from '../ecs/Entity';
import { ComponentType } from '../types/components';
import { EntityMap } from '../types/map';

export const serializeEntity = (entity: Entity): EntityMap => {
    const components: ComponentType[] = [];

    // case 'animation'
    if (entity.hasComponent(AnimationComponent)) {
        const animation = entity.getComponent(AnimationComponent);

        if (!animation) {
            throw new Error('Could not find animation component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'animation',
            properties: {
                numFrames: animation.numFrames,
                currentFrame: animation.currentFrame,
                frameSpeedRate: animation.frameSpeedRate,
                isLoop: animation.isLoop,
                startTime: animation.startTime,
            },
        });
    }

    // case 'boxcollider'
    if (entity.hasComponent(BoxColliderComponent)) {
        const collider = entity.getComponent(BoxColliderComponent);

        if (!collider) {
            throw new Error('Could not find collider component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'boxcollider',
            properties: {
                width: collider.width,
                height: collider.height,
                offset: collider.offset,
            },
        });
    }

    // case 'camerafollow'
    if (entity.hasComponent(CameraFollowComponent)) {
        const cameraFollow = entity.getComponent(CameraFollowComponent);

        if (!cameraFollow) {
            throw new Error('Could not find camerafollow component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'camerafollow',
            properties: {},
        });
    }

    // case 'camerashake'
    if (entity.hasComponent(CameraShakeComponent)) {
        const cameraShake = entity.getComponent(CameraShakeComponent);

        if (!cameraShake) {
            throw new Error('Could not find camerashake component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'camerashake',
            properties: {
                shakeDuration: cameraShake.shakeDuration,
            },
        });
    }

    // case 'damageradius'
    if (entity.hasComponent(DamageRadiusComponent)) {
        const damageradius = entity.getComponent(DamageRadiusComponent);

        if (!damageradius) {
            throw new Error('Could not find damageradius component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'damageradius',
            properties: {
                radius: damageradius.radius,
                damagePerSecond: damageradius.damagePerSecond,
                isFriendly: damageradius.isFriendly,
            },
        });
    }

    // case 'deadbodyondeath'
    if (entity.hasComponent(DeadBodyOnDeathComponent)) {
        const deathBody = entity.getComponent(DeadBodyOnDeathComponent);

        if (!deathBody) {
            throw new Error('Could not find deadbodyondeath component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'deadbodyondeath',
            properties: {},
        });
    }

    // case 'entitydestination'
    if (entity.hasComponent(EntityDestinationComponent)) {
        const entityDestination = entity.getComponent(EntityDestinationComponent);

        if (!entityDestination) {
            throw new Error('Could not find entitydestination component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'entitydestination',
            properties: {
                destinationX: entityDestination.destinationX,
                destinationY: entityDestination.destinationY,
                velocity: entityDestination.velocity,
            },
        });
    }

    // case 'entityeffect'
    if (entity.hasComponent(EntityEffectComponent)) {
        const entityEffect = entity.getComponent(EntityEffectComponent);

        if (!entityEffect) {
            throw new Error('Could not find entityeffect component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'entityeffect',
            properties: {
                slowed: entityEffect.slowed,
                slowedPercentage: entityEffect.slowedPercentage,
                hasDamageOverTime: entityEffect.hasDamageOverTime,
                damagePerSecond: entityEffect.damagePerSecond,
                lastDamageTime: entityEffect.lastDamageTime,
            },
        });
    }

    // case 'entityfollow'
    if (entity.hasComponent(EntityFollowComponent)) {
        const entityFollow = entity.getComponent(EntityFollowComponent);

        if (!entityFollow) {
            throw new Error('Could not find entityfollow component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'entityfollow',
            properties: {
                detectionRadius: entityFollow.detectionRadius,
                minFollowDistance: entityFollow.minFollowDistance,
                followVelocity: entityFollow.followVelocity,
                followDuration: entityFollow.followDuration,
                followedEntity: entityFollow.followedEntity, // TODO: does this work or is it better to use entity id as number???
                startFollowTime: entityFollow.startFollowTime,
            },
        });
    }

    // case 'health'
    if (entity.hasComponent(HealthComponent)) {
        const health = entity.getComponent(HealthComponent);

        if (!health) {
            throw new Error('Could not find health component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'health',
            properties: {
                healthPercentage: health.healthPercentage,
                lastDamageTime: health.lastDamageTime,
            },
        });
    }

    // case 'highlight'
    if (entity.hasComponent(HighlightComponent)) {
        const highlight = entity.getComponent(HighlightComponent);

        if (!highlight) {
            throw new Error('Could not find highlight component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'highlight',
            properties: {
                isHighlighted: highlight.isHighlighted,
                width: highlight.width,
                height: highlight.height,
                offsetX: highlight.offsetX,
                offsetY: highlight.offsetY,
            },
        });
    }

    // case 'lifetime'
    if (entity.hasComponent(LifetimeComponent)) {
        const lifeTime = entity.getComponent(LifetimeComponent);

        if (!lifeTime) {
            throw new Error('Could not find lifetime component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'lifetime',
            properties: {
                lifetime: lifeTime.lifetime,
                startTime: lifeTime.startTime,
            },
        });
    }

    // case 'lightemit'
    if (entity.hasComponent(LightEmitComponent)) {
        const lightEmit = entity.getComponent(LightEmitComponent);

        if (!lightEmit) {
            throw new Error('Could not find lightemit component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'lightemit',
            properties: {
                lightRadius: lightEmit.lightRadius,
            },
        });
    }

    // case 'particle'
    if (entity.hasComponent(ParticleComponent)) {
        const particle = entity.getComponent(ParticleComponent);

        if (!particle) {
            throw new Error('Could not find particle component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'particle',
            properties: {
                dimension: particle.dimension,
                color: particle.color,
            },
        });
    }

    // case 'particleemit'
    if (entity.hasComponent(ParticleEmitComponent)) {
        const particleEmit = entity.getComponent(ParticleEmitComponent);

        if (!particleEmit) {
            throw new Error('Could not find particle component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'particleemit',
            properties: {
                dimension: particleEmit.dimension,
                duration: particleEmit.duration,
                color: particleEmit.color,
                emitFrequency: particleEmit.emitFrequency,
                emitRadius: particleEmit.emitRadius,
                offsetX: particleEmit.offsetX,
                offsetY: particleEmit.offsetY,
                particleVelocity: particleEmit.particleVelocity,
                lastEmission: particleEmit.lastEmission,
            },
        });
    }

    // case 'playercontrol'
    // case 'projectile'
    // case 'rangedattackemitter'

    // case 'rigidbody'
    if (entity.hasComponent(RigidBodyComponent)) {
        const rigidbody = entity.getComponent(RigidBodyComponent);

        if (!rigidbody) {
            throw new Error('Could not find rigidbody component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'rigidbody',
            properties: {
                velocity: rigidbody.velocity,
                direction: rigidbody.direction,
            },
        });
    }

    // case 'script'
    // case 'shadow'
    // case 'slowtime'
    // case 'sound'
    // case 'sprite'

    // case 'spritestate'
    if (entity.hasComponent(SpriteStateComponent)) {
        const spritestate = entity.getComponent(SpriteStateComponent);

        if (!spritestate) {
            throw new Error('Could not find spritestate component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'spritestate',
            properties: {},
        });
    }

    // case 'teleport'
    // case 'textlabel'

    // case 'transform'
    if (entity.hasComponent(TransformComponent)) {
        const transform = entity.getComponent(TransformComponent);

        if (!transform) {
            throw new Error('Could not find transform component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'transform',
            properties: {
                position: transform.position,
                scale: transform.scale,
                rotation: transform.rotation,
            },
        });
    }

    const entityTag = entity.getTag();
    const entityGroup = entity.getGroup();

    return {
        tag: entityTag ?? undefined,
        group: entityGroup ?? undefined,
        components: components,
    };
};
