import { expect } from '@jest/globals';

import EntityFollowComponent from '../../src/components/EntityFollowComponent';
import RigidBodyComponent from '../../src/components/RigidBodyComponent';
import SpriteComponent from '../../src/components/SpriteComponent';
import TransformComponent from '../../src/components/TransformComponent';
import Registry from '../../src/ecs/Registry';
import EntityFollowSystem from '../../src/systems/EntityFollowSystem';

describe('Testing Player follow system related functions', () => {
    ////////////////////////////////////////////////////////////////////////////////
    // Player in a corner outside of follow padding
    ////////////////////////////////////////////////////////////////////////////////

    test('Entity should move right if player is in the top right corner', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 600, y: 400 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.x).toBe(50);
        expect(rigidBody?.direction).toEqual({ x: 1, y: 0 });
    });

    test('Entity should move right if player is in the bottom right corner', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 600, y: 600 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.x).toBe(50);
        expect(rigidBody?.direction).toEqual({ x: 1, y: 0 });
    });

    test('Entity should move left if player is in the top left corner', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 400, y: 400 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.x).toBe(-50);
        expect(rigidBody?.direction).toEqual({ x: -1, y: 0 });
    });

    test('Entity should move left if player is in the bottom left corner', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 400, y: 600 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.x).toBe(-50);
        expect(rigidBody?.direction).toEqual({ x: -1, y: 0 });
    });

    ////////////////////////////////////////////////////////////////////////////////
    // Player on same axis
    ////////////////////////////////////////////////////////////////////////////////

    test('Entity should move up if player is aligned in the x axis and below player', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 600 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 500, y: 400 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.y).toBe(-50);
        expect(rigidBody?.direction).toEqual({ x: 0, y: -1 });
    });

    test('Entity should move down if player is aligned in the x axis and above player', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 400 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 500, y: 600 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.y).toBe(50);
        expect(rigidBody?.direction).toEqual({ x: 0, y: 1 });
    });

    test('Entity should move right if player is aligned in the y axis and on the left of the player', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 400, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 600, y: 500 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.x).toBe(50);
        expect(rigidBody?.direction).toEqual({ x: 1, y: 0 });
    });

    test('Entity should move left if player is aligned in the y axis and on the right of the player', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 600, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 400, y: 500 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.x).toBe(-50);
        expect(rigidBody?.direction).toEqual({ x: -1, y: 0 });
    });

    ////////////////////////////////////////////////////////////////////////////////
    // Player on same axis but nearer than min distance
    ////////////////////////////////////////////////////////////////////////////////

    test('Entity should not move up if player is aligned in the x axis and below player and within min follow distance', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 450 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 500, y: 400 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.y).toBe(0);
        expect(rigidBody?.direction).toEqual({ x: 0, y: -1 });
    });

    test('Entity should not move down if player is aligned in the x axis and above player and within min follow distance', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 400 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 500, y: 450 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.y).toBe(0);
        expect(rigidBody?.direction).toEqual({ x: 0, y: 1 });
    });

    test('Entity should not move right if player is aligned in the y axis and on the left of the player and within min follow distance', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 400, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 450, y: 500 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.x).toBe(0);
        expect(rigidBody?.direction).toEqual({ x: 1, y: 0 });
    });

    test('Entity should not move left if player is aligned in the y axis and on the right of the player and within min follow distance', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 450, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 400, y: 500 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.x).toBe(0);
        expect(rigidBody?.direction).toEqual({ x: -1, y: 0 });
    });

    ////////////////////////////////////////////////////////////////////////////////
    // Player in a corner inside follow padding
    ////////////////////////////////////////////////////////////////////////////////

    test('Entity should move up if player is in the top right corner and within follow padding', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 550, y: 450 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.y).toBe(-50);
        expect(rigidBody?.direction).toEqual({ x: 0, y: -1 });
    });

    test('Entity should move down if player is in the bottom right corner and within follow padding', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 550, y: 550 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.y).toBe(50);
        expect(rigidBody?.direction).toEqual({ x: 0, y: 1 });
    });

    test('Entity should move up if player is in the top left corner and within follow padding', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 450, y: 450 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.y).toBe(-50);
        expect(rigidBody?.direction).toEqual({ x: 0, y: -1 });
    });

    test('Entity should move down if player is in the bottom left corner and within follow padding', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 500, y: 500 }, { x: 1, y: 1 }, 0);
        entity.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        entity.addComponent(EntityFollowComponent, 400, 100, 50, { x: 16, y: 16 });

        const player = registry.createEntity();
        player.addComponent(SpriteComponent, 'test', 32, 32);
        player.addComponent(TransformComponent, { x: 450, y: 550 }, { x: 1, y: 1 }, 0);
        player.tag('player');

        const follow = entity.getComponent(EntityFollowComponent);
        follow!.followedEntity = player;

        registry.addSystem(EntityFollowSystem);

        registry.update();

        registry.getSystem(EntityFollowSystem)?.update();

        const rigidBody = entity.getComponent(RigidBodyComponent);

        expect(rigidBody?.velocity.y).toBe(50);
        expect(rigidBody?.direction).toEqual({ x: 0, y: 1 });
    });
});
