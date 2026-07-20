import { FIXED_DELTA_TIME, World } from '../../../gravity.js/src';
import { System } from '../../engine';
import { RigidBodyComponent } from '../components';

export default class PhysicsSystem extends System {
    private world: World;
    private entityIdToPhysicsId: Map<number, number>;

    constructor() {
        super();
        super.requireComponent(RigidBodyComponent);

        this.world = new World(9.8);
        this.entityIdToPhysicsId = new Map();
    }

    update(deltaTime: number) {
        // Add entities added in engine but missing from physcis system
        // ...


        // Remove entities present in physics system but removed from engine
        // ...

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
