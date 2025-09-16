import Engine from '../../engine/Engine';
import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import CameraFollowComponent from '../components/CameraFollowComponent';
import TransformComponent from '../components/TransformComponent';

export default class CameraMovementSystem extends System {
    constructor() {
        super();
        this.requireComponent(CameraFollowComponent);
        this.requireComponent(TransformComponent);
    }

    update(camera: Rectangle) {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);

            if (!transform) {
                throw new Error('Could not find transform component of entity with id ' + entity.getId());
            }

            if (transform.position.x + camera.width / 2 < Engine.mapWidth) {
                camera.x = Math.floor(transform.position.x - camera.width / 2);
            }

            if (transform.position.y + camera.height / 2 < Engine.mapHeight) {
                camera.y = Math.floor(transform.position.y - camera.height / 2);
            }

            camera.x = this.clampOrCenter(camera.x, Engine.mapWidth, camera.width);
            camera.y = this.clampOrCenter(camera.y, Engine.mapHeight, camera.height);

            Engine.mousePositionWorld.x = Engine.mousePositionScreen.x + camera.x;
            Engine.mousePositionWorld.y = Engine.mousePositionScreen.y + camera.y;
        }
    }

    clampOrCenter = (cameraPosition: number, mapSize: number, cameraSize: number): number => {
        if (mapSize < cameraSize) {
            // Center map if smaller than camera
            return Math.round(-(cameraSize - mapSize) / 2);
        }
        // Clamps the camera's position so it stays within the map boundaries.
        return Math.max(0, Math.min(cameraPosition, mapSize - cameraSize));
    };
}
