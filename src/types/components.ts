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

export type AnimationComponentType = { name: 'animation'; properties: InstanceType<typeof AnimationComponent> };
export type BoxColliderComponentType = { name: 'boxcollider'; properties: InstanceType<typeof BoxColliderComponent> };
export type CameraFollowComponentType = {
    name: 'camerafollow';
    properties: InstanceType<typeof CameraFollowComponent>;
};
export type CameraShakeComponentType = { name: 'camerashake'; properties: InstanceType<typeof CameraShakeComponent> };
export type DamageRadiusComponentType = {
    name: 'damageradius';
    properties: InstanceType<typeof DamageRadiusComponent>;
};
export type DeadBodyOnDeathComponentType = {
    name: 'deadbodyondeath';
    properties: InstanceType<typeof DeadBodyOnDeathComponent>;
};
export type EntityDestinationComponentType = {
    name: 'entitydestination';
    properties: InstanceType<typeof EntityDestinationComponent>;
};
export type EntityEffectComponentType = {
    name: 'entityeffect';
    properties: InstanceType<typeof EntityEffectComponent>;
};
export type EntityFollowComponentType = {
    name: 'entityfollow';
    properties: InstanceType<typeof EntityFollowComponent>;
};
export type HealthComponentType = { name: 'health'; properties: InstanceType<typeof HealthComponent> };
export type HighlightComponentType = { name: 'highlight'; properties: InstanceType<typeof HighlightComponent> };
export type LifetimeComponentType = { name: 'lifetime'; properties: InstanceType<typeof LifetimeComponent> };
export type LightEmitComponentType = { name: 'lightemit'; properties: InstanceType<typeof LightEmitComponent> };
export type ParticleComponentType = { name: 'particle'; properties: InstanceType<typeof ParticleComponent> };
export type ParticleEmitComponentType = {
    name: 'particleemit';
    properties: InstanceType<typeof ParticleEmitComponent>;
};
export type PlayerControlComponentType = {
    name: 'playercontrol';
    properties: InstanceType<typeof PlayerControlComponent>;
};
export type ProjectileComponentType = { name: 'projectile'; properties: InstanceType<typeof ProjectileComponent> };
export type RangedAttackEmitterComponentType = {
    name: 'rangedattackemitter';
    properties: InstanceType<typeof RangedAttackEmitterComponent>;
};
export type RigidBodyComponentType = { name: 'rigidbody'; properties: InstanceType<typeof RigidBodyComponent> };
export type ScriptComponentType = { name: 'script'; properties: InstanceType<typeof ScriptComponent> };
export type ShadowComponentType = { name: 'shadow'; properties: InstanceType<typeof ShadowComponent> };
export type SlowTimeComponentType = { name: 'slowtime'; properties: InstanceType<typeof SlowTimeComponent> };
export type SoundComponentType = { name: 'sound'; properties: InstanceType<typeof SoundComponent> };
export type SpriteComponentType = { name: 'sprite'; properties: InstanceType<typeof SpriteComponent> };
export type SpriteStateComponentType = { name: 'spritestate'; properties: InstanceType<typeof SpriteStateComponent> };
export type TeleportComponentType = { name: 'teleport'; properties: InstanceType<typeof TeleportComponent> };
export type TextLabelComponentType = { name: 'textlabel'; properties: InstanceType<typeof TextLabelComponent> };
export type TransformComponentType = { name: 'transform'; properties: InstanceType<typeof TransformComponent> };

export type ComponentType =
    | AnimationComponentType
    | BoxColliderComponentType
    | CameraFollowComponentType
    | CameraShakeComponentType
    | DamageRadiusComponentType
    | DeadBodyOnDeathComponentType
    | EntityDestinationComponentType
    | EntityEffectComponentType
    | EntityFollowComponentType
    | HealthComponentType
    | HighlightComponentType
    | LifetimeComponentType
    | LightEmitComponentType
    | ParticleComponentType
    | ParticleEmitComponentType
    | PlayerControlComponentType
    | ProjectileComponentType
    | RangedAttackEmitterComponentType
    | RigidBodyComponentType
    | ScriptComponentType
    | ShadowComponentType
    | SlowTimeComponentType
    | SoundComponentType
    | SpriteComponentType
    | SpriteStateComponentType
    | TeleportComponentType
    | TextLabelComponentType
    | TransformComponentType;
