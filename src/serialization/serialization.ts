import AnimationComponent from '../components/AnimationComponent';
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
            throw new Error('Could not find some animation component of entity with id ' + entity.getId());
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
    // case 'camerafollow'
    // case 'camerashake'
    // case 'damageradius'
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
            throw new Error('Could not find some rigidbody component of entity with id ' + entity.getId());
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
            throw new Error('Could not find some transform component of entity with id ' + entity.getId());
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
