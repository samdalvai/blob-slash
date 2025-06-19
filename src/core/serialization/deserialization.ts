import AnimationComponent from '../../game/components/AnimationComponent';
import BoxColliderComponent from '../../game/components/BoxColliderComponent';
import CameraFollowComponent from '../../game/components/CameraFollowComponent';
import CameraShakeComponent from '../../game/components/CameraShakeComponent';
import DamageRadiusComponent from '../../game/components/DamageRadiusComponent';
import DeadBodyOnDeathComponent from '../../game/components/DeadBodyOnDeathComponent';
import EntityDestinationComponent from '../../game/components/EntityDestinationComponent';
import EntityEffectComponent from '../../game/components/EntityEffectComponent';
import EntityFollowComponent from '../../game/components/EntityFollowComponent';
import HealthComponent from '../../game/components/HealthComponent';
import HighlightComponent from '../../game/components/HighlightComponent';
import LifetimeComponent from '../../game/components/LifetimeComponent';
import LightEmitComponent from '../../game/components/LightEmitComponent';
import MeleeAttackComponent from '../../game/components/MeleeAttackComponent';
import ParticleComponent from '../../game/components/ParticleComponent';
import ParticleEmitComponent from '../../game/components/ParticleEmitComponent';
import PlayerControlComponent from '../../game/components/PlayerControlComponent';
import ProjectileComponent from '../../game/components/ProjectileComponent';
import RangedAttackEmitterComponent from '../../game/components/RangedAttackEmitterComponent';
import RigidBodyComponent from '../../game/components/RigidBodyComponent';
import ScriptComponent from '../../game/components/ScriptComponent';
import ShadowComponent from '../../game/components/ShadowComponent';
import SlowTimeComponent from '../../game/components/SlowTimeComponent';
import SoundComponent from '../../game/components/SoundComponent';
import SpriteComponent from '../../game/components/SpriteComponent';
import SpriteStateComponent from '../../game/components/SpriteStateComponent';
import TeleportComponent from '../../game/components/TeleportComponent';
import TextLabelComponent from '../../game/components/TextLabelComponent';
import TransformComponent from '../../game/components/TransformComponent';
import Component from '../../core/ecs/Component';
import Entity from '../core/../ecs/Entity';
import Registry from '../core/../ecs/Registry';
import { ComponentType } from '../types/components';
import { EntityMap } from '../types/map';

const getComponentClass = (componentType: ComponentType): typeof Component => {
    switch (componentType) {
        case 'animation':
            return AnimationComponent;
        case 'boxcollider':
            return BoxColliderComponent;
        case 'camerafollow':
            return CameraFollowComponent;
        case 'camerashake':
            return CameraShakeComponent;
        case 'damageradius':
            return DamageRadiusComponent;
        case 'deadbodyondeath':
            return DeadBodyOnDeathComponent;
        case 'entitydestination':
            return EntityDestinationComponent;
        case 'entityeffect':
            return EntityEffectComponent;
        case 'entityfollow':
            return EntityFollowComponent;
        case 'health':
            return HealthComponent;
        case 'highlight':
            return HighlightComponent;
        case 'lifetime':
            return LifetimeComponent;
        case 'lightemit':
            return LightEmitComponent;
        case 'meleeattack':
            return MeleeAttackComponent;
        case 'particle':
            return ParticleComponent;
        case 'particleemit':
            return ParticleEmitComponent;
        case 'playercontrol':
            return PlayerControlComponent;
        case 'projectile':
            return ProjectileComponent;
        case 'rangedattackemitter':
            return RangedAttackEmitterComponent;
        case 'rigidbody':
            return RigidBodyComponent;
        case 'script':
            return ScriptComponent;
        case 'shadow':
            return ShadowComponent;
        case 'slowtime':
            return SlowTimeComponent;
        case 'sound':
            return SoundComponent;
        case 'sprite':
            return SpriteComponent;
        case 'spritestate':
            return SpriteStateComponent;
        case 'teleport':
            return TeleportComponent;
        case 'textlabel':
            return TextLabelComponent;
        case 'transform':
            return TransformComponent;
        default:
            throw new Error(`Component of type ${componentType} not supported`);
    }
};

export const deserializeEntity = (entityMap: EntityMap, registry: Registry): Entity => {
    const entity = registry.createEntity();

    for (const component of entityMap.components) {
        const ComponentClass = getComponentClass(component.name);
        const parameters = getComponentConstructorParamNames(ComponentClass);
        const parameterValues = [];

        for (const param of parameters) {
            parameterValues.push(component.properties[param as keyof Component]);
        }

        entity.addComponent(ComponentClass, ...parameterValues);
    }

    if (entityMap.tag) {
        entity.tag(entityMap.tag);
    }

    if (entityMap.group) {
        entity.group(entityMap.group);
    }

    return entity;
};

export const deserializeEntities = (entities: EntityMap[], registry: Registry): Entity[] => {
    const entitiesList: Entity[] = [];

    for (const entity of entities) {
        entitiesList.push(deserializeEntity(entity, registry));
    }

    return entitiesList;
};

export const getComponentConstructorParamNames = <T extends Component>(component: T): string[] => {
    const constructorStr = component.toString();
    const constructorMatch = constructorStr.match(/constructor\(([\s\S]*?)\)/g);

    if (!constructorMatch || !constructorMatch[0]) {
        throw new Error(`'Error, could not parse constructor for component class ${component}`);
    }

    const paramNames = constructorMatch[0]
        .replace('constructor', '')
        .replace('= false', '')
        .replace('= true', '')
        .replace(/\{([\s\S]*?)\}/g, '')
        .replace(/'(.*?)'/g, '')
        .replace(/"(.*?)"/g, '')
        .replace(/[()=,]/g, ' ')
        .split(' ')
        .filter(param => param !== '')
        .filter(param => !isNumeric(param));

    return paramNames;
};

const isNumeric = (str: string) => {
    return !isNaN(parseFloat(str));
};
