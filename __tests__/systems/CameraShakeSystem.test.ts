import { expect } from '@jest/globals';

import CameraShakeEvent from '../../src/events/CameraShakeEvent';
import CameraShakeSystem from '../../src/systems/CameraShakeSystem';

describe('Testing Camera Shake system related functions', () => {
    test('If there is an ongoing shake which will last less than the new one, the new shake should override the current one', () => {
        const cameraShake1 = new CameraShakeEvent(1000);

        const cameraShakeSystem = new CameraShakeSystem();
        cameraShakeSystem.onCameraShake(cameraShake1, 500);

        const cameraShake2 = new CameraShakeEvent(2000);
        cameraShakeSystem.onCameraShake(cameraShake2, 1000);

        expect(cameraShakeSystem.shaking).toBe(true);
        expect(cameraShakeSystem.shakeDuration).toBe(2000);
        expect(cameraShakeSystem.shakeStartTime).toBe(1000);
    });

    test('If there is an ongoing shake which will last more than the new one, the new shake should be skipped', () => {
        const cameraShake1 = new CameraShakeEvent(2000);

        const cameraShakeSystem = new CameraShakeSystem();
        cameraShakeSystem.onCameraShake(cameraShake1, 500);

        const cameraShake2 = new CameraShakeEvent(1000);
        cameraShakeSystem.onCameraShake(cameraShake2, 1000);

        expect(cameraShakeSystem.shaking).toBe(true);
        expect(cameraShakeSystem.shakeDuration).toBe(2000);
        expect(cameraShakeSystem.shakeStartTime).toBe(500);
    });
});
