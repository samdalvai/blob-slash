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
import Registry from '../ecs/Registry';
import { EntityMap } from '../types/map';

export const deserializeEntity = (entityMap: EntityMap, registry: Registry): Entity => {
    const entity = registry.createEntity();

    for (const component of entityMap.components) {
        switch (component.name) {
            case 'animation': {
                entity.addComponent(
                    AnimationComponent,
                    component.properties.numFrames,
                    component.properties.currentFrame,
                    component.properties.frameSpeedRate,
                    component.properties.isLoop,
                    component.properties.startTime,
                );
                break;
            }
            case 'boxcollider': {
                entity.addComponent(
                    BoxColliderComponent,
                    component.properties.width,
                    component.properties.height,
                    component.properties.offset,
                );
                break;
            }
            case 'camerafollow': {
                entity.addComponent(CameraFollowComponent);
                break;
            }
            case 'camerashake': {
                entity.addComponent(CameraShakeComponent, component.properties.shakeDuration);
                break;
            }
            case 'damageradius': {
                entity.addComponent(
                    DamageRadiusComponent,
                    component.properties.radius,
                    component.properties.damagePerSecond,
                    component.properties.isFriendly,
                );
                break;
            }
            case 'deadbodyondeath': {
                entity.addComponent(DeadBodyOnDeathComponent);
                break;
            }
            case 'entitydestination': {
                entity.addComponent(
                    EntityDestinationComponent,
                    component.properties.destinationX,
                    component.properties.destinationY,
                    component.properties.velocity,
                );
                break;
            }
            case 'entityeffect': {
                entity.addComponent(
                    EntityEffectComponent,
                    component.properties.slowed,
                    component.properties.slowedPercentage,
                    component.properties.hasDamageOverTime,
                    component.properties.damagePerSecond,
                    component.properties.lastDamageTime,
                );
                break;
            }
            case 'entityfollow': {
                entity.addComponent(
                    EntityFollowComponent,
                    component.properties.detectionRadius,
                    component.properties.minFollowDistance,
                    component.properties.followVelocity,
                    component.properties.followDuration,
                    component.properties.followedEntity,
                    component.properties.startFollowTime,
                );
                break;
            }
            case 'health': {
                entity.addComponent(
                    HealthComponent,
                    component.properties.healthPercentage,
                    component.properties.lastDamageTime,
                );
                break;
            }
            case 'highlight': {
                entity.addComponent(
                    HighlightComponent,
                    component.properties.isHighlighted,
                    component.properties.width,
                    component.properties.height,
                    component.properties.offsetX,
                    component.properties.offsetY,
                );
                break;
            }
            case 'lifetime': {
                entity.addComponent(LifetimeComponent, component.properties.lifetime, component.properties.startTime);
                break;
            }
            case 'lightemit': {
                entity.addComponent(LightEmitComponent, component.properties.lightRadius);
                break;
            }
            case 'particle': {
                entity.addComponent(ParticleComponent, component.properties.dimension, component.properties.color);
                break;
            }
            case 'particleemit': {
                entity.addComponent(
                    ParticleEmitComponent,
                    component.properties.dimension,
                    component.properties.duration,
                    component.properties.color,
                    component.properties.emitFrequency,
                    component.properties.emitRadius,
                    component.properties.offsetX,
                    component.properties.offsetY,
                    component.properties.particleVelocity,
                    component.properties.lastEmission,
                );
                break;
            }
            case 'playercontrol': {
                entity.addComponent(
                    PlayerControlComponent,
                    component.properties.velocity,
                    component.properties.keysPressed,
                    component.properties.magicBubbleCooldown,
                    component.properties.magicBubbleLastEmissionTime,
                    component.properties.teleportCooldown,
                    component.properties.teleportLastEmissionTime,
                    component.properties.fireCircleCooldown,
                    component.properties.fireCircleLastEmissionTime,
                );
                break;
            }
            case 'projectile': {
                entity.addComponent(
                    ProjectileComponent,
                    component.properties.isFriendly,
                    component.properties.hitPercentDamage,
                );
                break;
            }
            case 'rangedattackemitter': {
                entity.addComponent(
                    RangedAttackEmitterComponent,
                    component.properties.projectileVelocity,
                    component.properties.repeatFrequency,
                    component.properties.projectileDuration,
                    component.properties.hitPercentDamage,
                    component.properties.isFriendly,
                    component.properties.lastEmissionTime,
                );
                break;
            }
            case 'rigidbody': {
                entity.addComponent(RigidBodyComponent, component.properties.velocity, component.properties.direction);
                break;
            }
            case 'script': {
                entity.addComponent(
                    ScriptComponent,
                    component.properties.scripts,
                    component.properties.currentActionIndex,
                    component.properties.actionStart,
                );
                break;
            }
            case 'shadow': {
                entity.addComponent(
                    ShadowComponent,
                    component.properties.width,
                    component.properties.height,
                    component.properties.offsetX,
                    component.properties.offsetY,
                );
                break;
            }
            case 'slowtime': {
                entity.addComponent(
                    SlowTimeComponent,
                    component.properties.radius,
                    component.properties.slowTimePercentage,
                    component.properties.isFriendly,
                );
                break;
            }
            case 'sound': {
                entity.addComponent(
                    SoundComponent,
                    component.properties.assetId,
                    component.properties.offsetBuffer,
                    component.properties.volume,
                );
                break;
            }
            case 'sprite': {
                entity.addComponent(
                    SpriteComponent,
                    component.properties.assetId,
                    component.properties.width,
                    component.properties.height,
                    component.properties.zIndex,
                    component.properties.srcRect.x,
                    component.properties.srcRect.y,
                    component.properties.flip,
                    component.properties.isFixed,
                    component.properties.transparency,
                );
                break;
            }
            case 'spritestate': {
                entity.addComponent(SpriteStateComponent);
                break;
            }
            case 'teleport': {
                entity.addComponent(
                    TeleportComponent,
                    component.properties.isTeleporting,
                    component.properties.teleportDelay,
                );
                break;
            }
            case 'textlabel': {
                entity.addComponent(
                    TextLabelComponent,
                    component.properties.position,
                    component.properties.text,
                    component.properties.color,
                    component.properties.isFixed,
                    component.properties.font,
                );
                break;
            }
            case 'transform': {
                entity.addComponent(
                    TransformComponent,
                    component.properties.position,
                    component.properties.scale,
                    component.properties.rotation,
                );
                break;
            }
        }
    }

    return entity;
};
