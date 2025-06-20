import CameraFollowComponent from '../components/CameraFollowComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../../engine/ecs/System';
import Game from '../Game';
import { Rectangle } from '../../engine/types/utils';
import Engine from '../../engine/Engine';

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

            if (transform.position.x + camera.width / 2 < Game.mapWidth) {
                camera.x = Math.floor(transform.position.x - camera.width / 2);
            }

            if (transform.position.y + camera.height / 2 < Game.mapHeight) {
                camera.y = Math.floor(transform.position.y - camera.height / 2);
            }

            // Clamps the camera's position so it stays within the map boundaries.
            camera.x = Math.max(0, Math.min(camera.x, Game.mapWidth - camera.width));
            camera.y = Math.max(0, Math.min(camera.y, Game.mapHeight - camera.height));

            Engine.mousePositionWorld.x = Engine.mousePositionScreen.x + camera.x;
            Engine.mousePositionWorld.y = Engine.mousePositionScreen.y + camera.y;
        }
    }
}
