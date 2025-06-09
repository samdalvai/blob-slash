import CameraFollowComponent from '../components/CameraFollowComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import Game from '../game/Game';
import { Rectangle } from '../types/utils';

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

            Game.mousePositionWorld.x = Game.mousePositionScreen.x + camera.x;
            Game.mousePositionWorld.y = Game.mousePositionScreen.y + camera.y;
        }
    }
}
