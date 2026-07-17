import { describe, expect, test } from '@jest/globals';

import Engine from '../../../engine/Engine';
import Registry from '../../../engine/ecs/Registry';
import { Camera } from '../../../engine/types/utils';
import CameraFollowComponent from '../../../game/components/CameraFollowComponent';
import TransformComponent from '../../../game/components/TransformComponent';
import CameraMovementSystem from '../../../game/systems/CameraMovementSystem';

describe('CameraMovementSystem', () => {
    test('follows a centre-anchored transform, clamps to the map, and updates the Y-up pointer position', () => {
        Engine.mapWidth = 1000;
        Engine.mapHeight = 800;
        Engine.mousePositionScreen = { x: 50, y: 50 };

        const registry = new Registry();
        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 950, y: 770 });
        entity.addComponent(CameraFollowComponent);
        registry.addSystem(CameraMovementSystem);
        registry.update();

        const camera: Camera = {
            center: { x: 0, y: 0 },
            viewportWidth: 200,
            viewportHeight: 100,
        };

        registry.getSystem(CameraMovementSystem)?.update(camera);

        expect(camera.center).toEqual({ x: 900, y: 750 });
        expect(Engine.mousePositionWorld).toEqual({ x: 850, y: 750 });
    });
});
