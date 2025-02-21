import { expect } from '@jest/globals';

import RigidBodyComponent from '../../src/components/RigidBodyComponent';
import EntityDestinationSystem from '../../src/systems/EntityDestinationSystem';

describe('Testing EntityDestination system related functions', () => {
    test('Should correctly change entity direction based on velocity', () => {
        const system = new EntityDestinationSystem();
        const rigidBody = new RigidBodyComponent();

        /**
         * Case 1
         * x > 0 && y > 0
         * --------------
         * abs
         * x > y -> move right
         * x < y -> move down
         *
         */
        system.updateRigidBodyDirection(100, 50, rigidBody);
        expect(rigidBody.direction).toEqual({ x: 1, y: 0 });
        system.updateRigidBodyDirection(50, 100, rigidBody);
        expect(rigidBody.direction).toEqual({ x: 0, y: 1 });

        /*
         * Case 2
         * x > 0 && y < 0
         * --------------
         * abs
         * x > y -> move right
         * x < y -> move up
         */
        system.updateRigidBodyDirection(100, -50, rigidBody);
        expect(rigidBody.direction).toEqual({ x: 1, y: 0 });
        system.updateRigidBodyDirection(50, -100, rigidBody);
        expect(rigidBody.direction).toEqual({ x: 0, y: -1 });

        /*
         * Case 3
         * x < 0 && y > 0
         * --------------
         * abs
         * x > y -> move left
         * x < y -> move down
         */
        system.updateRigidBodyDirection(-100, 50, rigidBody);
        expect(rigidBody.direction).toEqual({ x: -1, y: 0 });
        system.updateRigidBodyDirection(-50, 100, rigidBody);
        expect(rigidBody.direction).toEqual({ x: 0, y: 1 });

        /*
         * Case 4
         * x < 0 && y < 0
         * --------------
         * abs
         * x > y -> move left
         * x < y -> move up
         */
        system.updateRigidBodyDirection(-100, -50, rigidBody);
        expect(rigidBody.direction).toEqual({ x: -1, y: 0 });
        system.updateRigidBodyDirection(-50, -100, rigidBody);
        expect(rigidBody.direction).toEqual({ x: 0, y: -1 });
    });
});
