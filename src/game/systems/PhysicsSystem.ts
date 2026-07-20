import { BodiesFactory, FIXED_DELTA_TIME, RigidBody, SETTINGS, Vec2, World } from '../../../gravity.js/src';
import { System } from '../../engine';
import { BoxColliderComponent, RigidBodyComponent, TransformComponent } from '../components';

export default class PhysicsSystem extends System {
    private world: World;
    private entityIdToBodyId: Map<number, number>;
    private bodyIdToEntityId: Map<number, number>;

    private accumulator = 0;

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
        const systemEntities = this.getSystemEntities();
        const systemEntitiesIds = new Set<number>();

        for (const entity of systemEntities) {
            systemEntitiesIds.add(entity.getId());
        }

        for (const entity of systemEntities) {
            const entityId = entity.getId();
            if (!this.entityIdToBodyId.has(entityId)) {
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
                    velocity: new Vec2(100, 100),
                });
                this.world.addBody(body);

                this.bodyIdToEntityId.set(body.id, entityId);
                this.entityIdToBodyId.set(entityId, body.id);
            }
        }

        // Remove entities present in physics system but removed from engine
        for (const body of rigidBodies) {
            const bodyId = body.id;
            const entityId = this.bodyIdToEntityId.get(bodyId);

            if (entityId === undefined) {
                throw new Error('Could not determine entity id associated to body with id ' + bodyId);
            }

            if (!systemEntitiesIds.has(entityId)) {
                this.world.removeBody(body);
                this.bodyIdToEntityId.delete(bodyId);
                this.entityIdToBodyId.delete(entityId);
            }
        }

        // Update physics
        this.accumulator += deltaTime;
        this.world.update(deltaTime);
        while (this.accumulator >= FIXED_DELTA_TIME) {
            this.world.update(deltaTime);
            this.accumulator -= FIXED_DELTA_TIME;
        }

        for (const entity of this.getSystemEntities()) {
            const entityId = entity.getId();
            const transform = entity.getComponent(TransformComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);
            const collider = entity.getComponent(BoxColliderComponent);

            if (!transform || !rigidBody || !collider) {
                throw new Error('Could not find some component(s) of entity with id ' + entityId);
            }

            const bodyId = this.entityIdToBodyId.get(entityId);

            if (bodyId === undefined) {
                throw new Error('Could not determine body id associated with entity with id ' + entityId);
            }

            // TODO: update components based on physics
        }
    }
}
