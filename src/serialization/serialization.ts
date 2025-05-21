import AnimationComponent from '../components/AnimationComponent';
import BoxColliderComponent from '../components/BoxColliderComponent';
import CameraFollowComponent from '../components/CameraFollowComponent';
import CameraShakeComponent from '../components/CameraShakeComponent';
import DamageRadiusComponent from '../components/DamageRadiusComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
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
    // case 'entitydestination'
    // case 'entityeffect'
    // case 'entityfollow'
    // case 'health'
    // case 'highlight'
    // case 'lifetime'
    // case 'lightemit'
    // case 'particle'
    // case 'particleemit'
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
