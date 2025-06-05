import { expect } from '@jest/globals';

import AnimationComponent from '../../components/AnimationComponent';
import BoxColliderComponent from '../../components/BoxColliderComponent';
import CameraFollowComponent from '../../components/CameraFollowComponent';
import CameraShakeComponent from '../../components/CameraShakeComponent';
import DamageRadiusComponent from '../../components/DamageRadiusComponent';
import DeadBodyOnDeathComponent from '../../components/DeadBodyOnDeathComponent';
import EntityDestinationComponent from '../../components/EntityDestinationComponent';
import EntityEffectComponent from '../../components/EntityEffectComponent';
import EntityFollowComponent from '../../components/EntityFollowComponent';
import HealthComponent from '../../components/HealthComponent';
import HighlightComponent from '../../components/HighlightComponent';
import LifetimeComponent from '../../components/LifetimeComponent';
import LightEmitComponent from '../../components/LightEmitComponent';
import MeleeAttackComponent from '../../components/MeleeAttackComponent';
import ParticleComponent from '../../components/ParticleComponent';
import ParticleEmitComponent from '../../components/ParticleEmitComponent';
import PlayerControlComponent from '../../components/PlayerControlComponent';
import ProjectileComponent from '../../components/ProjectileComponent';
import RangedAttackEmitterComponent from '../../components/RangedAttackEmitterComponent';
import RigidBodyComponent from '../../components/RigidBodyComponent';
import ScriptComponent from '../../components/ScriptComponent';
import ShadowComponent from '../../components/ShadowComponent';
import SlowTimeComponent from '../../components/SlowTimeComponent';
import SoundComponent from '../../components/SoundComponent';
import SpriteComponent from '../../components/SpriteComponent';
import SpriteStateComponent from '../../components/SpriteStateComponent';
import TeleportComponent from '../../components/TeleportComponent';
import TextLabelComponent from '../../components/TextLabelComponent';
import TransformComponent from '../../components/TransformComponent';
import Component from '../../ecs/Component';
import Registry from '../../ecs/Registry';
import {
    deserializeEntities,
    deserializeEntity,
    getComponentConstructorParamNames,
} from '../../serialization/deserialization';
import { ComponentType } from '../../types/components';
import { EntityMap } from '../../types/map';

describe('Testing deserialization related functions', () => {
    test('Should extract component constructor parameter names', () => {
        class MyComponent extends Component {
            myProperty1: number;
            myProperty2: number;

            constructor(myProperty1 = 0, myProperty2 = 0) {
                super();
                this.myProperty1 = myProperty1;
                this.myProperty2 = myProperty2;
            }
        }

        expect(getComponentConstructorParamNames(MyComponent)).toEqual(['myProperty1', 'myProperty2']);
    });

    test('Should extract component constructor parameter names with custom order', () => {
        class MyComponent extends Component {
            myProperty1: number;
            myProperty2: number;

            constructor(myProperty2 = 0, myProperty1 = 0) {
                super();
                this.myProperty1 = myProperty1;
                this.myProperty2 = myProperty2;
            }
        }

        expect(getComponentConstructorParamNames(MyComponent)).toEqual(['myProperty2', 'myProperty1']);
    });

    test('Should extract component constructor parameter names with no initializer to parameters', () => {
        class MyComponent extends Component {
            myProperty1: number;
            myProperty2: number;

            constructor(myProperty1: number, myProperty2: number) {
                super();
                this.myProperty1 = myProperty1;
                this.myProperty2 = myProperty2;
            }
        }

        expect(getComponentConstructorParamNames(MyComponent)).toEqual(['myProperty1', 'myProperty2']);
    });

    test('Should extract component constructor parameter names with a mix between initialized and uninitialized constructor properties', () => {
        class MyComponent extends Component {
            myProperty1: number;
            myProperty2: number;

            constructor(myProperty1: number, myProperty2 = 0) {
                super();
                this.myProperty1 = myProperty1;
                this.myProperty2 = myProperty2;
            }
        }

        expect(getComponentConstructorParamNames(MyComponent)).toEqual(['myProperty1', 'myProperty2']);
    });

    test('Should extract component constructor parameter names with a mix between initialized and uninitialized constructor properties with mixed order', () => {
        class MyComponent extends Component {
            myProperty1: number;
            myProperty2: number;

            constructor(myProperty2 = 0, myProperty1: number) {
                super();
                this.myProperty1 = myProperty1;
                this.myProperty2 = myProperty2;
            }
        }

        expect(getComponentConstructorParamNames(MyComponent)).toEqual(['myProperty2', 'myProperty1']);
    });

    test('Should deserialize entity Map to Entity with one component', () => {
        const registry = new Registry();

        const entityMap: EntityMap = {
            components: [
                {
                    name: 'transform',
                    properties: {
                        position: { x: 100, y: 100 },
                        scale: { x: 1, y: 1 },
                        rotation: 0,
                    },
                },
            ],
        };

        const entity = deserializeEntity(entityMap, registry);
        const transform = entity.getComponent(TransformComponent);

        expect(transform).toEqual({
            position: {
                x: 100,
                y: 100,
            },
            scale: {
                x: 1,
                y: 1,
            },
            rotation: 0,
        });
    });

    test('Should deserialize entity Map to Entity with two components', () => {
        const registry = new Registry();

        const entityMap: EntityMap = {
            components: [
                {
                    name: 'transform',
                    properties: {
                        position: { x: 100, y: 100 },
                        scale: { x: 1, y: 1 },
                        rotation: 0,
                    },
                },
                {
                    name: 'rigidbody',
                    properties: {
                        velocity: { x: 100, y: 100 },
                        direction: { x: 1, y: 0 },
                    },
                },
            ],
        };

        const entity = deserializeEntity(entityMap, registry);
        const transform = entity.getComponent(TransformComponent);
        const rigidbody = entity.getComponent(RigidBodyComponent);

        expect(transform).toEqual({
            position: {
                x: 100,
                y: 100,
            },
            scale: {
                x: 1,
                y: 1,
            },
            rotation: 0,
        });
        expect(rigidbody).toEqual({
            velocity: {
                x: 100,
                y: 100,
            },
            direction: {
                x: 1,
                y: 0,
            },
        });
    });

    test('Should deserialize entity Map to Entity having tag', () => {
        const registry = new Registry();

        const entityMap: EntityMap = {
            tag: 'test',
            components: [],
        };

        const entity = deserializeEntity(entityMap, registry);
        const entityTag = entity.getTag();

        expect(entityTag).toEqual('test');
    });

    test('Should deserialize entity Map to Entity having group', () => {
        const registry = new Registry();

        const entityMap: EntityMap = {
            group: 'test',
            components: [],
        };

        const entity = deserializeEntity(entityMap, registry);
        const entityGroup = entity.getGroup();

        expect(entityGroup).toEqual('test');
    });

    test('Should deserialize entity Map to Entity having tag and group', () => {
        const registry = new Registry();

        const entityMap: EntityMap = {
            tag: 'test',
            group: 'test',
            components: [],
        };

        const entity = deserializeEntity(entityMap, registry);
        const entityTag = entity.getTag();
        const entityGroup = entity.getGroup();

        expect(entityTag).toEqual('test');
        expect(entityGroup).toEqual('test');
    });

    test('Should deserialize list of entityMap to entities with one component', () => {
        const registry = new Registry();

        const entityMaps: EntityMap[] = [
            {
                components: [
                    {
                        name: 'transform',
                        properties: {
                            position: { x: 100, y: 100 },
                            scale: { x: 1, y: 1 },
                            rotation: 0,
                        },
                    },
                ],
            },
            {
                components: [
                    {
                        name: 'transform',
                        properties: {
                            position: { x: 200, y: 200 },
                            scale: { x: 1, y: 1 },
                            rotation: 0,
                        },
                    },
                ],
            },
        ];

        const entities = deserializeEntities(entityMaps, registry);
        const transform1 = entities[0].getComponent(TransformComponent);
        const transform2 = entities[1].getComponent(TransformComponent);

        expect(transform1).toEqual({
            position: {
                x: 100,
                y: 100,
            },
            scale: {
                x: 1,
                y: 1,
            },
            rotation: 0,
        });

        expect(transform2).toEqual({
            position: {
                x: 200,
                y: 200,
            },
            scale: {
                x: 1,
                y: 1,
            },
            rotation: 0,
        });
    });

    test('Should deserialize list of entityMap to entities with two components', () => {
        const registry = new Registry();

        const entityMaps: EntityMap[] = [
            {
                components: [
                    {
                        name: 'transform',
                        properties: {
                            position: { x: 100, y: 100 },
                            scale: { x: 1, y: 1 },
                            rotation: 0,
                        },
                    },
                    {
                        name: 'rigidbody',
                        properties: {
                            velocity: { x: 100, y: 100 },
                            direction: { x: 1, y: 0 },
                        },
                    },
                ],
            },
            {
                components: [
                    {
                        name: 'transform',
                        properties: {
                            position: { x: 200, y: 200 },
                            scale: { x: 1, y: 1 },
                            rotation: 0,
                        },
                    },
                    {
                        name: 'rigidbody',
                        properties: {
                            velocity: { x: 200, y: 200 },
                            direction: { x: 0, y: 1 },
                        },
                    },
                ],
            },
        ];

        const entities = deserializeEntities(entityMaps, registry);
        const transform1 = entities[0].getComponent(TransformComponent);
        const transform2 = entities[1].getComponent(TransformComponent);
        const rigidbody1 = entities[0].getComponent(RigidBodyComponent);
        const rigidbody2 = entities[1].getComponent(RigidBodyComponent);

        expect(transform1).toEqual({
            position: {
                x: 100,
                y: 100,
            },
            scale: {
                x: 1,
                y: 1,
            },
            rotation: 0,
        });

        expect(transform2).toEqual({
            position: {
                x: 200,
                y: 200,
            },
            scale: {
                x: 1,
                y: 1,
            },
            rotation: 0,
        });

        expect(rigidbody1).toEqual({
            velocity: {
                x: 100,
                y: 100,
            },
            direction: {
                x: 1,
                y: 0,
            },
        });

        expect(rigidbody2).toEqual({
            velocity: {
                x: 200,
                y: 200,
            },
            direction: {
                x: 0,
                y: 1,
            },
        });
    });

    test('Test', () => {
        class MyComponent extends Component {
            myProperty1: number;
            myProperty2: number;

            constructor(myProperty1 = 0, myProperty2 = 0) {
                super();
                this.myProperty1 = myProperty1;
                this.myProperty2 = myProperty2;
            }
        }

        const registry = new Registry();
        const entity = registry.createEntity();

        entity.addComponent(MyComponent, 10, 100);
        console.log(MyComponent);
        console.log(entity.getComponent(MyComponent));
    });
});
