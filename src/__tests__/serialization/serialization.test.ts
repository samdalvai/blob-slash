import { expect } from '@jest/globals';

import RigidBodyComponent from '../../components/RigidBodyComponent';
import TransformComponent from '../../components/TransformComponent';
import Registry from '../../ecs/Registry';
import { serializeEntity } from '../../serialization/serialization';
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
});
