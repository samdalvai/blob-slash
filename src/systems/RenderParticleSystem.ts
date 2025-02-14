import ParticleComponent from '../components/ParticleComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import { Rectangle } from '../types';

export default class RenderParticleSystem extends System {
    constructor() {
        super();
        this.requireComponent(ParticleComponent);
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle) {
        for (const entity of this.getSystemEntities()) {
            //
        }
    }
}
