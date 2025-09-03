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

            // Compute target camera position
            const targetX = Math.floor(transform.position.x - camera.width / 2);
            const targetY = Math.floor(transform.position.y - camera.height / 2);

            // If the map is smaller than the camera, center the map
            const minX = Engine.mapWidth < camera.width ? -(camera.width - Engine.mapWidth) / 2 : 0;
            const minY = Engine.mapHeight < camera.height ? -(camera.height - Engine.mapHeight) / 2 : 0;

            const maxX = Math.max(0, Engine.mapWidth - camera.width);
            const maxY = Math.max(0, Engine.mapHeight - camera.height);

            // Clamp camera position
            camera.x = Math.round(Math.max(minX, Math.min(targetX, maxX)));
            camera.y = Math.round(Math.max(minY, Math.min(targetY, maxY)));

            // Update world mouse position
            Engine.mousePositionWorld.x = Engine.mousePositionScreen.x + camera.x;
            Engine.mousePositionWorld.y = Engine.mousePositionScreen.y + camera.y;
        }
    }
}
