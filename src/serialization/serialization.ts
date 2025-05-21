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
import PlayerControlComponent from '../components/PlayerControlComponent';
import ProjectileComponent from '../components/ProjectileComponent';
import RangedAttackEmitterComponent from '../components/RangedAttackEmitterComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import ScriptComponent from '../components/ScriptComponent';
import ShadowComponent from '../components/ShadowComponent';
import SlowTimeComponent from '../components/SlowTimeComponent';
import SoundComponent from '../components/SoundComponent';
import SpriteComponent from '../components/SpriteComponent';
import SpriteStateComponent from '../components/SpriteStateComponent';
import TeleportComponent from '../components/TeleportComponent';
import TextLabelComponent from '../components/TextLabelComponent';
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
                ...animation,
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
                ...collider,
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
            properties: { ...cameraFollow },
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
                ...cameraShake,
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
                ...damageradius,
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
                ...entityDestination,
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
                ...entityEffect,
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
                ...entityFollow,
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
                ...health,
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
                ...highlight,
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
                ...lifeTime,
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
                ...lightEmit,
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
                ...particle,
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
                ...particleEmit,
            },
        });
    }

    // case 'playercontrol'
    if (entity.hasComponent(PlayerControlComponent)) {
        const playercontrol = entity.getComponent(PlayerControlComponent);

        if (!playercontrol) {
            throw new Error('Could not find playercontrol component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'playercontrol',
            properties: {
                ...playercontrol,
            },
        });
    }

    // case 'projectile'
    if (entity.hasComponent(ProjectileComponent)) {
        const projectile = entity.getComponent(ProjectileComponent);

        if (!projectile) {
            throw new Error('Could not find projectile component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'projectile',
            properties: {
                ...projectile,
            },
        });
    }

    // case 'rangedattackemitter'
    if (entity.hasComponent(RangedAttackEmitterComponent)) {
        const rangedattackemitter = entity.getComponent(RangedAttackEmitterComponent);

        if (!rangedattackemitter) {
            throw new Error('Could not find rangedattackemitter component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'rangedattackemitter',
            properties: {
                ...rangedattackemitter,
            },
        });
    }

    // case 'rigidbody'
    if (entity.hasComponent(RigidBodyComponent)) {
        const rigidbody = entity.getComponent(RigidBodyComponent);

        if (!rigidbody) {
            throw new Error('Could not find rigidbody component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'rigidbody',
            properties: {
                ...rigidbody,
            },
        });
    }

    // case 'script'
    if (entity.hasComponent(ScriptComponent)) {
        const script = entity.getComponent(ScriptComponent);

        if (!script) {
            throw new Error('Could not find script component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'script',
            properties: {
                ...script,
            },
        });
    }

    // case 'shadow'
    if (entity.hasComponent(ShadowComponent)) {
        const shadow = entity.getComponent(ShadowComponent);

        if (!shadow) {
            throw new Error('Could not find shadow component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'shadow',
            properties: {
                ...shadow,
            },
        });
    }

    // case 'slowtime'
    if (entity.hasComponent(SlowTimeComponent)) {
        const slowtime = entity.getComponent(SlowTimeComponent);

        if (!slowtime) {
            throw new Error('Could not find slowtime component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'slowtime',
            properties: {
                ...slowtime,
            },
        });
    }

    // case 'sound'
    if (entity.hasComponent(SoundComponent)) {
        const sound = entity.getComponent(SoundComponent);

        if (!sound) {
            throw new Error('Could not find sound component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'sound',
            properties: {
                ...sound,
            },
        });
    }

    // case 'sprite'
    if (entity.hasComponent(SpriteComponent)) {
        const sprite = entity.getComponent(SpriteComponent);

        if (!sprite) {
            throw new Error('Could not find sprite component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'sprite',
            properties: {
                ...sprite,
            },
        });
    }

    // case 'spritestate'
    if (entity.hasComponent(SpriteStateComponent)) {
        const spritestate = entity.getComponent(SpriteStateComponent);

        if (!spritestate) {
            throw new Error('Could not find spritestate component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'spritestate',
            properties: { ...spritestate },
        });
    }

    // case 'teleport'
    if (entity.hasComponent(TeleportComponent)) {
        const teleport = entity.getComponent(TeleportComponent);

        if (!teleport) {
            throw new Error('Could not find teleport component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'teleport',
            properties: {
                ...teleport,
            },
        });
    }

    // case 'textlabel'
    if (entity.hasComponent(TextLabelComponent)) {
        const textLabel = entity.getComponent(TextLabelComponent);

        if (!textLabel) {
            throw new Error('Could not find textlabel component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'textlabel',
            properties: {
                ...textLabel,
            },
        });
    }

    // case 'transform'
    if (entity.hasComponent(TransformComponent)) {
        const transform = entity.getComponent(TransformComponent);

        if (!transform) {
            throw new Error('Could not find transform component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'transform',
            properties: {
                ...transform,
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
