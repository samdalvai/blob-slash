import { expect } from '@jest/globals';

import RigidBodyComponent from '../../src/components/RigidBodyComponent';
import SpriteComponent from '../../src/components/SpriteComponent';
import SpriteStateSystem from '../../src/systems/SpriteStateSystem';

describe('Testing SpriteState system related functions', () => {
    const system = new SpriteStateSystem();

    test('Still entity facing up should show idle sprite facing up (1st row)', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 0 }, { x: 0, y: -1 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.srcRect).toEqual({ x: 0, y: 0, width: 32, height: 32 });
    });

    test('Still entity facing right should show idle sprite facing right (2nd row)', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 0 }, { x: 1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.srcRect).toEqual({ x: 0, y: 32, width: 32, height: 32 });
    });

    test('Still entity facing down should show idle sprite facing down (3rd row)', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 0 }, { x: 0, y: 1 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.srcRect).toEqual({ x: 0, y: 64, width: 32, height: 32 });
    });

    test('Still entity facing left should show idle sprite facing left (4th row)', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 0 }, { x: -1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.srcRect).toEqual({ x: 0, y: 96, width: 32, height: 32 });
    });

    test('Moving entity facing up should show moving sprite facing up (1st row)', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: 0, y: -100 }, { x: 0, y: -1 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.srcRect).toEqual({ x: 0, y: 128, width: 32, height: 32 });
    });

    test('Moving entity facing right should show moving sprite facing right (2nd row)', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: 100, y: 0 }, { x: 1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.srcRect).toEqual({ x: 0, y: 160, width: 32, height: 32 });
    });

    test('Moving entity facing down should show moving sprite facing down (3rd row)', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 100 }, { x: 0, y: 1 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.srcRect).toEqual({ x: 0, y: 192, width: 32, height: 32 });
    });

    test('Moving entity facing left should show moving sprite facing left (4th row)', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: -100, y: 0 }, { x: -1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.srcRect).toEqual({ x: 0, y: 224, width: 32, height: 32 });
    });

    test('Hurt entity facing up should show moving sprite facing up (1st row), regardless of movement', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: 0, y: -100 }, { x: 0, y: -1 });

        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.srcRect).toEqual({ x: 0, y: 256, width: 32, height: 32 });

        rigidBody.velocity.x = 0;
        rigidBody.velocity.y = 0;
        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.srcRect).toEqual({ x: 0, y: 256, width: 32, height: 32 });
    });

    test('Hurt entity facing right should show moving sprite facing right (2nd row), regardless of movement', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: 100, y: 0 }, { x: 1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.srcRect).toEqual({ x: 0, y: 288, width: 32, height: 32 });

        rigidBody.velocity.x = 0;
        rigidBody.velocity.y = 0;
        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.srcRect).toEqual({ x: 0, y: 288, width: 32, height: 32 });
    });

    test('Hurt entity facing down should show moving sprite facing down (3rd row), regardless of movement', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 100 }, { x: 0, y: 1 });

        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.srcRect).toEqual({ x: 0, y: 320, width: 32, height: 32 });

        rigidBody.velocity.x = 0;
        rigidBody.velocity.y = 0;
        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.srcRect).toEqual({ x: 0, y: 320, width: 32, height: 32 });
    });

    test('Hurt entity facing left should show moving sprite facing left (4th row), regardless of movement', () => {
        const sprite = new SpriteComponent('test', 32, 32, 0, 0, 0);
        const rigidBody = new RigidBodyComponent({ x: -100, y: 0 }, { x: -1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.srcRect).toEqual({ x: 0, y: 352, width: 32, height: 32 });

        rigidBody.velocity.x = 0;
        rigidBody.velocity.y = 0;
        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.srcRect).toEqual({ x: 0, y: 352, width: 32, height: 32 });
    });
});
