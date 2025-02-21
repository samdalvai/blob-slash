import { expect } from '@jest/globals';

import RigidBodyComponent from '../../src/components/RigidBodyComponent';
import EntityDestinationSystem from '../../src/systems/EntityDestinationSystem';

describe('Testing EntityDestination system related functions', () => {
    test('Should correctly change entity direction based on velocity', () => {
        const system = new EntityDestinationSystem();

        const rigidBody = new RigidBodyComponent();

        system.updateRigidBodyDirection(0, 0, rigidBody);
        expect(rigidBody.direction).toEqual({ x: 0, y: 0 });
    });
});
