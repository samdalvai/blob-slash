import CameraFollowComponent from '../components/CameraFollowComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import Game from '../game/Game';
import { Rectangle } from '../types';

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

            // Keep camera rectangle view inside the screen limits
            camera.x = camera.x < 0 ? 0 : camera.x;
            camera.y = camera.y < 0 ? 0 : camera.y;
            camera.x = camera.x > camera.width ? camera.width : camera.x;
            camera.y = camera.y > camera.height ? camera.height : camera.y;
        }
    }
}
