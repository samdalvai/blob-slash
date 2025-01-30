import { expect } from '@jest/globals';

import RigidBodyComponent from '../../src/components/RigidBodyComponent';
import TransformComponent from '../../src/components/TransformComponent';
import Registry from '../../src/ecs/Registry';
import Game from '../../src/game/Game';
import MovementSystem from '../../src/systems/MovementSystem';

describe('Testing Movement system related functions', () => {
    beforeEach(() => {
        Game.mapWidth = 1000;
        Game.mapHeight = 1000;
    });

    test('Entity having horizontal velocity should change his position', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 50, y: 0 });

        registry.addSystem(MovementSystem);

        registry.update();

        const deltaTime = 1;

        registry.getSystem(MovementSystem)?.update(deltaTime);

        const transform = entity.getComponent(TransformComponent);

        expect(transform).not.toBe(undefined);
        expect(transform?.position.x).toBe(150);
        expect(transform?.position.y).toBe(100);
    });

    test('Entity having vertical velocity should change his position', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 50 });

        registry.addSystem(MovementSystem);

        registry.update();

        const deltaTime = 1;

        registry.getSystem(MovementSystem)?.update(deltaTime);

        const transform = entity.getComponent(TransformComponent);

        expect(transform).not.toBe(undefined);
        expect(transform?.position.x).toBe(100);
        expect(transform?.position.y).toBe(150);
    });

    test('Entity having diagonal velocity should change his position', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 50, y: 50 });

        registry.addSystem(MovementSystem);

        registry.update();

        const deltaTime = 1;

        registry.getSystem(MovementSystem)?.update(deltaTime);

        const transform = entity.getComponent(TransformComponent);

        expect(transform).not.toBe(undefined);
        expect(transform?.position.x).toBe(150);
        expect(transform?.position.y).toBe(150);
    });

    test('Entity moving outside map borders exceeding culling margin of 100 should be killed', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 950, y: 100 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 200, y: 0 });

        registry.addSystem(MovementSystem);

        registry.update();

        const deltaTime = 1;

        registry.getSystem(MovementSystem)?.update(deltaTime);

        const transform = entity.getComponent(TransformComponent);

        expect(transform).not.toBe(undefined);
        expect(transform?.position.x).toBe(1150);
        expect(transform?.position.y).toBe(100);

        registry.update();

        expect(entity.getComponent(TransformComponent)).toBe(undefined);
        expect(entity.getComponent(RigidBodyComponent)).toBe(undefined);
        expect(registry.getSystem(MovementSystem)?.getSystemEntities().length).toBe(0);
    });
});
