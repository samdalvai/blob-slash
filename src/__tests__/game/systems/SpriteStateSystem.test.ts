import { expect } from '@jest/globals';

import RigidBodyComponent from '../../../game/components/RigidBodyComponent';
import SpriteComponent from '../../../game/components/SpriteComponent';
import SpriteStateSystem from '../../../game/systems/SpriteStateSystem';

describe('Testing SpriteState system related functions', () => {
    const system = new SpriteStateSystem();

    test('Still entity facing up should show idle sprite facing up (1st row)', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 0 }, { x: 0, y: -1 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.row).toBe(0);
        expect(sprite.column).toBe(0);
    });

    test('Still entity facing right should show idle sprite facing right (2nd row)', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 0 }, { x: 1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.row).toBe(1);
        expect(sprite.column).toBe(0);
    });

    test('Still entity facing down should show idle sprite facing down (3rd row)', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 0 }, { x: 0, y: 1 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.row).toBe(2);
        expect(sprite.column).toBe(0);
    });

    test('Still entity facing left should show idle sprite facing left (4th row)', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 0 }, { x: -1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.row).toBe(3);
        expect(sprite.column).toBe(0);
    });

    test('Moving entity facing up should show moving sprite facing up (5th row)', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: 0, y: -100 }, { x: 0, y: -1 });
        console.log('sprite: ', sprite);

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.row).toBe(4);
        expect(sprite.column).toBe(0);
    });

    test('Moving entity facing right should show moving sprite facing right (6th row)', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: 100, y: 0 }, { x: 1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.row).toBe(5);
        expect(sprite.column).toBe(0);
    });

    test('Moving entity facing down should show moving sprite facing down (7th row)', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 100 }, { x: 0, y: 1 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.row).toBe(6);
        expect(sprite.column).toBe(0);
    });

    test('Moving entity facing left should show moving sprite facing left (8th row)', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: -100, y: 0 }, { x: -1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, false);
        expect(sprite.row).toBe(7);
        expect(sprite.column).toBe(0);
    });

    test('Hurt entity facing up should show moving sprite facing up (9th row), regardless of movement', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: 0, y: -100 }, { x: 0, y: -1 });

        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.row).toBe(8);
        expect(sprite.column).toBe(0);

        rigidBody.velocity.x = 0;
        rigidBody.velocity.y = 0;
        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.row).toBe(8);
        expect(sprite.column).toBe(0);
    });

    test('Hurt entity facing right should show moving sprite facing right (10th row), regardless of movement', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: 100, y: 0 }, { x: 1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.row).toBe(9);
        expect(sprite.column).toBe(0);

        rigidBody.velocity.x = 0;
        rigidBody.velocity.y = 0;
        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.row).toBe(9);
        expect(sprite.column).toBe(0);
    });

    test('Hurt entity facing down should show moving sprite facing down (11th row), regardless of movement', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: 0, y: 100 }, { x: 0, y: 1 });

        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.row).toBe(10);
        expect(sprite.column).toBe(0);

        rigidBody.velocity.x = 0;
        rigidBody.velocity.y = 0;
        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.row).toBe(10);
        expect(sprite.column).toBe(0);
    });

    test('Hurt entity facing left should show moving sprite facing left (12th row), regardless of movement', () => {
        const sprite = new SpriteComponent('test', 32, 32);
        const rigidBody = new RigidBodyComponent({ x: -100, y: 0 }, { x: -1, y: 0 });

        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.row).toBe(11);
        expect(sprite.column).toBe(0);

        rigidBody.velocity.x = 0;
        rigidBody.velocity.y = 0;
        system.updateSpriteState(sprite, rigidBody, true);
        expect(sprite.row).toBe(11);
        expect(sprite.column).toBe(0);
    });
});
