import { expect } from '@jest/globals';

import Engine from '../../engine/Engine';
import AssetStore from '../../engine/asset-store/AssetStore';
import Component from '../../engine/ecs/Component';
import Entity from '../../engine/ecs/Entity';
import Registry from '../../engine/ecs/Registry';
import { serializeEntities, serializeEntity, serializeLevel } from '../../engine/serialization/serialization';
import { EntityMap, LevelMap } from '../../engine/types/map';
import RigidBodyComponent from '../../game/components/RigidBodyComponent';
import TransformComponent from '../../game/components/TransformComponent';

describe('Testing serialization related functions', () => {
    test('Should serialize entity with one component to a valid Entity Map', () => {
        const registry = new Registry();
        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 }, 0);

        const expected: EntityMap = {
            components: [
                {
                    name: 'TransformComponent',
                    properties: {
                        position: { x: 100, y: 100 },
                        scale: { x: 1, y: 1 },
                        rotation: 0,
                    },
                },
            ],
        };

        expect(serializeEntity(entity)).toEqual(expected);
    });

    test('Should serialize entity with two components to a valid Entity Map', () => {
        const registry = new Registry();
        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 100, y: 100 }, { x: 1, y: 0 });

        const expected: EntityMap = {
            components: [
                {
                    name: 'TransformComponent',
                    properties: {
                        position: { x: 100, y: 100 },
                        scale: { x: 1, y: 1 },
                        rotation: 0,
                    },
                },
                {
                    name: 'RigidBodyComponent',
                    properties: {
                        velocity: { x: 100, y: 100 },
                        direction: { x: 1, y: 0 },
                    },
                },
            ],
        };

        expect(serializeEntity(entity)).toEqual(expected);
    });

    test('Should serialize entity having tag', () => {
        const registry = new Registry();
        const entity = registry.createEntity();
        entity.tag('test');

        const expected: EntityMap = {
            tag: 'test',
            components: [],
        };

        expect(serializeEntity(entity)).toEqual(expected);
    });

    test('Should serialize entity having group', () => {
        const registry = new Registry();
        const entity = registry.createEntity();
        entity.group('test');

        const expected: EntityMap = {
            group: 'test',
            components: [],
        };

        expect(serializeEntity(entity)).toEqual(expected);
    });

    test('Should serialize entity having tag and group', () => {
        const registry = new Registry();
        const entity = registry.createEntity();
        entity.tag('test');
        entity.group('test');

        const expected: EntityMap = {
            tag: 'test',
            group: 'test',
            components: [],
        };

        expect(serializeEntity(entity)).toEqual(expected);
    });

    test('Should serialize list of entities with one component', () => {
        const registry = new Registry();

        const entity1 = registry.createEntity();
        entity1.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 }, 0);

        const entity2 = registry.createEntity();
        entity2.addComponent(TransformComponent, { x: 200, y: 200 }, { x: 1, y: 1 }, 0);

        const expected: EntityMap[] = [
            {
                components: [
                    {
                        name: 'TransformComponent',
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
                        name: 'TransformComponent',
                        properties: {
                            position: { x: 200, y: 200 },
                            scale: { x: 1, y: 1 },
                            rotation: 0,
                        },
                    },
                ],
            },
        ];

        expect(serializeEntities([entity1, entity2])).toEqual(expected);
    });

    test('Should serialize list of entities with two components', () => {
        const registry = new Registry();

        const entity1 = registry.createEntity();
        entity1.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 }, 0);
        entity1.addComponent(RigidBodyComponent, { x: 100, y: 100 }, { x: 1, y: 0 });

        const entity2 = registry.createEntity();
        entity2.addComponent(TransformComponent, { x: 200, y: 200 }, { x: 1, y: 1 }, 0);
        entity2.addComponent(RigidBodyComponent, { x: 200, y: 200 }, { x: 0, y: 1 });

        const expected: EntityMap[] = [
            {
                components: [
                    {
                        name: 'TransformComponent',
                        properties: {
                            position: { x: 100, y: 100 },
                            scale: { x: 1, y: 1 },
                            rotation: 0,
                        },
                    },
                    {
                        name: 'RigidBodyComponent',
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
                        name: 'TransformComponent',
                        properties: {
                            position: { x: 200, y: 200 },
                            scale: { x: 1, y: 1 },
                            rotation: 0,
                        },
                    },
                    {
                        name: 'RigidBodyComponent',
                        properties: {
                            velocity: { x: 200, y: 200 },
                            direction: { x: 0, y: 1 },
                        },
                    },
                ],
            },
        ];

        expect(serializeEntities([entity1, entity2])).toEqual(expected);
    });

    test('Should serialize list of entities with tag', () => {
        const registry = new Registry();

        const entity1 = registry.createEntity();
        entity1.tag('test1');

        const entity2 = registry.createEntity();
        entity2.tag('test2');

        const expected: EntityMap[] = [
            {
                tag: 'test1',
                components: [],
            },
            {
                tag: 'test2',
                components: [],
            },
        ];

        expect(serializeEntities([entity1, entity2])).toEqual(expected);
    });

    test('Should serialize list of entities with group', () => {
        const registry = new Registry();

        const entity1 = registry.createEntity();
        entity1.group('test1');

        const entity2 = registry.createEntity();
        entity2.group('test2');

        const expected: EntityMap[] = [
            {
                group: 'test1',
                components: [],
            },
            {
                group: 'test2',
                components: [],
            },
        ];

        expect(serializeEntities([entity1, entity2])).toEqual(expected);
    });

    test('Should serialize list of entities with tag and group', () => {
        const registry = new Registry();

        const entity1 = registry.createEntity();
        entity1.tag('test1');
        entity1.group('test1');

        const entity2 = registry.createEntity();
        entity2.tag('test2');
        entity2.group('test2');

        const expected: EntityMap[] = [
            {
                tag: 'test1',
                group: 'test1',
                components: [],
            },
            {
                tag: 'test2',
                group: 'test2',
                components: [],
            },
        ];

        expect(serializeEntities([entity1, entity2])).toEqual(expected);
    });

    test('Should serialize entity component with startTime and override it to 0', () => {
        class MyComponent extends Component {
            myProperty: number;
            startTime: number;

            constructor(myProperty = 0, startTime = 0) {
                super();
                this.myProperty = myProperty;
                this.startTime = startTime;
            }
        }

        const registry = new Registry();
        const entity = registry.createEntity();
        entity.addComponent(MyComponent, 10, 1000);

        const expected: EntityMap = {
            components: [
                {
                    name: 'MyComponent' as any,
                    properties: {
                        myProperty: 10,
                        startTime: 0,
                    },
                },
            ],
        };

        expect(serializeEntity(entity)).toEqual(expected);
    });

    test('Should serialize entity component with followedEntity and override it to null', () => {
        class MyComponent extends Component {
            myProperty: number;
            followedEntity: Entity;

            constructor(myProperty = 0, followedEntity: Entity) {
                super();
                this.myProperty = myProperty;
                this.followedEntity = followedEntity;
            }
        }

        const registry = new Registry();
        const entity = registry.createEntity();
        entity.addComponent(MyComponent, 10, new Entity(2, registry));

        const expected: EntityMap = {
            components: [
                {
                    name: 'MyComponent' as any,
                    properties: {
                        myProperty: 10,
                        followedEntity: null,
                    },
                },
            ],
        };

        expect(serializeEntity(entity)).toEqual(expected);
    });

    test('Should serialize level with one entity', () => {
        const registry = new Registry();
        const assetStore = new AssetStore();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 }, 0);

        const expected: LevelMap = {
            mapWidth: 500,
            mapHeight: 500,
            entities: [
                {
                    components: [
                        {
                            name: 'TransformComponent',
                            properties: {
                                position: { x: 100, y: 100 },
                                scale: { x: 1, y: 1 },
                                rotation: 0,
                            },
                        },
                    ],
                },
            ],
            textures: [],
            sounds: [],
        };

        Engine.mapWidth = 500;
        Engine.mapHeight = 500;

        expect(serializeLevel(registry, assetStore)).toEqual(expected);
    });

    test('Should serialize level with two entities', () => {
        const registry = new Registry();
        const assetStore = new AssetStore();
        
        const entity1 = registry.createEntity();
        entity1.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 }, 0);

        const entity2 = registry.createEntity();
        entity2.addComponent(TransformComponent, { x: 200, y: 200 }, { x: 1, y: 1 }, 0);

        const expected: LevelMap = {
            mapWidth: 500,
            mapHeight: 500,
            entities: [
                {
                    components: [
                        {
                            name: 'TransformComponent',
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
                            name: 'TransformComponent',
                            properties: {
                                position: { x: 200, y: 200 },
                                scale: { x: 1, y: 1 },
                                rotation: 0,
                            },
                        },
                    ],
                },
            ],
            textures: [],
            sounds: [],
        };

        Engine.mapWidth = 500;
        Engine.mapHeight = 500;

        expect(serializeLevel(registry, assetStore)).toEqual(expected);
    });

    test('Should serialize level with one entity where another entity has been killed', () => {
        const registry = new Registry();
        const assetStore = new AssetStore();
        
        const entity1 = registry.createEntity();
        entity1.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 }, 0);

        const entity2 = registry.createEntity();
        entity2.addComponent(TransformComponent, { x: 200, y: 200 }, { x: 1, y: 1 }, 0);

        entity1.kill();
        registry.update();

        const expected: LevelMap = {
            mapWidth: 500,
            mapHeight: 500,
            entities: [
                {
                    components: [
                        {
                            name: 'TransformComponent',
                            properties: {
                                position: { x: 200, y: 200 },
                                scale: { x: 1, y: 1 },
                                rotation: 0,
                            },
                        },
                    ],
                },
            ],
            textures: [],
            sounds: [],
        };

        Engine.mapWidth = 500;
        Engine.mapHeight = 500;

        expect(serializeLevel(registry, assetStore)).toEqual(expected);
    });
});
