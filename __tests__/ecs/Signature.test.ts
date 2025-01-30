import { expect } from '@jest/globals';

import Signature from '../../src/ecs/Signature';

describe('Testing Signature related functions', () => {
    test('Should correctly set one bit of a signature', () => {
        const signature = new Signature();

        signature.set(0);
        expect(signature.test(0)).toBe(true);
        expect(signature.test(1)).toBe(false);
    });

    test('Should correctly set two bits of a signature', () => {
        const signature = new Signature();

        signature.set(0);
        signature.set(1);
        expect(signature.test(0)).toBe(true);
        expect(signature.test(1)).toBe(true);
    });

    test('Should correctly reset a single bit of a signature', () => {
        const signature = new Signature();

        signature.set(0);
        signature.set(1);
        signature.remove(1);
        expect(signature.test(0)).toBe(true);
        expect(signature.test(1)).toBe(false);
    });

    test('Should correctly reset all bits of a signature', () => {
        const signature = new Signature();

        signature.set(0);
        signature.set(1);
        signature.reset();
        expect(signature.test(0)).toBe(false);
        expect(signature.test(1)).toBe(false);
    });
});
