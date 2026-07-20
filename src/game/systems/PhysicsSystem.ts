import { BodiesFactory, FIXED_DELTA_TIME, SETTINGS, World } from '../../../gravity.js/src';
import { System } from '../../engine';
import { BoxColliderComponent, RigidBodyComponent, TransformComponent } from '../components';

export default class PhysicsSystem extends System {
    private world: World;
    private entityIdToBodyId: Map<number, number>;
    private bodyIdToEntityId: Map<number, number>;

    constructor() {
        super();
        super.requireComponent(RigidBodyComponent);
        super.requireComponent(TransformComponent);
        super.requireComponent(BoxColliderComponent);

        this.world = new World(0);
        this.entityIdToBodyId = new Map();
        this.bodyIdToEntityId = new Map();
    }

    update(deltaTime: number) {
        // Add entities added in engine but missing from physcis system
        const rigidBodies = this.world.getBodies();
        const rigidBodiesIds: Set<number> = new Set();
        for (const body of rigidBodies) {
            rigidBodiesIds.add(body.id);
        }

        const entitiesIds: Set<number> = new Set();
        for (const entity of this.getSystemEntities()) {
            const entityId = entity.getId();
            entitiesIds.add(entityId);
            if (!rigidBodiesIds.has(entityId)) {

                const transform = entity.getComponent(TransformComponent);
                const rigidBody = entity.getComponent(RigidBodyComponent);
                const collider = entity.getComponent(BoxColliderComponent);

                if (!transform || !rigidBody || !collider) {
                    throw new Error('Could not find some component(s) of entity with id ' + entityId);
                }

                const body = BodiesFactory.box({
                    width: collider.width,
                    height: collider.height,
                    x: transform.position.x + collider.offset.x,
                    y: transform.position.y + collider.offset.y,
                    mass: 1,
                    canRotate: false,
                });
                this.world.addBody(body);
                this.bodyIdToEntityId.set(body.id, entityId);
                this.entityIdToBodyId.set(entityId, body.id);
            }
        }

        // Remove entities present in physics system but removed from engine
        for (const body of rigidBodies) {
            const bodyId = body.id;
            if (!entitiesIds.has(bodyId)) {
                this.world.removeBody(body);
                const oldEntityId = this.bodyIdToEntityId.get(bodyId);

                if (!oldEntityId) {
                    throw new Error('Could not determine old entity id associated with body with id ' + bodyId);
                }
                this.bodyIdToEntityId.delete(bodyId);
                this.entityIdToBodyId.delete(oldEntityId);
            }
        }

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
