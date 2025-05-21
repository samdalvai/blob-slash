import { expect } from '@jest/globals';

import RigidBodyComponent from '../../components/RigidBodyComponent';
import TransformComponent from '../../components/TransformComponent';
import Registry from '../../ecs/Registry';
import { serializeEntities, serializeEntity } from '../../serialization/serialization';
import { EntityMap } from '../../types/map';

describe('Testing serialization related functions', () => {
    test('Should serialize entity with one component to a valid Entity Map', () => {
        const registry = new Registry();
        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 }, 0);

        const expected: EntityMap = {
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
                    name: 'rigidbody',
                    properties: {
                        velocity: { x: 100, y: 100 },
                        direction: { x: 1, y: 0 },
                    },
                },
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
                        name: 'rigidbody',
                        properties: {
                            velocity: { x: 100, y: 100 },
                            direction: { x: 1, y: 0 },
                        },
                    },
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
                        name: 'rigidbody',
                        properties: {
                            velocity: { x: 200, y: 200 },
                            direction: { x: 0, y: 1 },
                        },
                    },
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
});
