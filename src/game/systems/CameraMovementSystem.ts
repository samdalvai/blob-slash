import { Camera, clampCameraCenter, Engine, screenToWorld, System } from '../../engine';
import CameraFollowComponent from '../components/CameraFollowComponent';
import TransformComponent from '../components/TransformComponent';

export default class CameraMovementSystem extends System {
    constructor() {
        super();
        this.requireComponent(CameraFollowComponent);
        this.requireComponent(TransformComponent);
    }

    update(camera: Camera) {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);

            if (!transform) {
                throw new Error('Could not find transform component of entity with id ' + entity.getId());
            }

            // A v2 transform position is already the entity centre.
            camera.center = clampCameraCenter(
                {
                    ...camera,
                    center: { x: Math.floor(transform.position.x), y: Math.floor(transform.position.y) },
                },
                { width: Engine.mapWidth, height: Engine.mapHeight },
            );

            Engine.mousePositionWorld = screenToWorld(Engine.mousePositionScreen, camera);
        }
    }
}
