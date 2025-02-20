import EntityDestinationComponent from '../components/EntityDestinationComponent';
import System from '../ecs/System';
import { Rectangle } from '../types';

export default class RenderEntityDestinationSystem extends System {
    constructor() {
        super();
        this.requireComponent(EntityDestinationComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle) {
        for (const entity of this.getSystemEntities()) {
            const destination = entity.getComponent(EntityDestinationComponent);

            if (!destination) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            // Bypass rendering if entities are outside the camera view
            const isOutsideCameraView =
                destination.destinationX < camera.x ||
                destination.destinationX > camera.x + camera.width ||
                destination.destinationY < camera.y ||
                destination.destinationY > camera.y + camera.height;

            if (isOutsideCameraView) {
                continue;
            }

            const circleX = destination.destinationX - camera.x;
            const circleY = destination.destinationY - camera.y;

            ctx.beginPath();
            ctx.arc(circleX, circleY, 20, 0, Math.PI * 2);
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }
    }
}
