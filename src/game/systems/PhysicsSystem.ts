import { FIXED_DELTA_TIME, World } from '../../../gravity.js/src';
import { System } from '../../engine';
import { RigidBodyComponent } from '../components';

export default class PhysicsSystem extends System {
    private world: World;

    constructor() {
        super();
        super.requireComponent(RigidBodyComponent);

        this.world = new World(9.8);
    }

    update(deltaTime: number) {
        // Update physics
        let accumulator = 0;
        this.world.update(deltaTime);
        while (accumulator >= FIXED_DELTA_TIME) {
            this.world.update(deltaTime);
            accumulator -= FIXED_DELTA_TIME;
        }

        // Synchronize entities RigidBody
    }
}
