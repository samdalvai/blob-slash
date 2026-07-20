import { BodiesFactory, FIXED_DELTA_TIME, Force, RigidBody, SETTINGS, Vec2, World } from '../../../gravity.js/src';
import { EventBus, Registry, System } from '../../engine';
import { BoxColliderComponent, PlayerControlComponent, RigidBodyComponent, TransformComponent } from '../components';
import { KeyPressedEvent } from '../events';

export default class PhysicsSystem extends System {
    private registry: Registry;
    private world: World;
    private entityIdToBodyId: Map<number, number>;
    private bodyIdToEntityId: Map<number, number>;

    private accumulator = 0;

    constructor(registry: Registry) {
        super();
        super.requireComponent(RigidBodyComponent);
        super.requireComponent(TransformComponent);
        super.requireComponent(BoxColliderComponent);

        this.world = new World(0);
        this.registry = registry;

        this.entityIdToBodyId = new Map();
        this.bodyIdToEntityId = new Map();
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(KeyPressedEvent, this, this.onKeyPressed);
    }

    onKeyPressed = (event: KeyPressedEvent) => {
        const player = this.registry.getEntityByTag('player');

        if (!player) {
            console.warn('Player entity not found');
            return;
        }

        const playerControl = player.getComponent(PlayerControlComponent);

        if (!playerControl) {
            throw new Error('Could not find some component(s) of entity with id ' + player.getId());
        }

        const rigidBodies = this.world.getBodies();
        const playerRigidBodyId = this.entityIdToBodyId.get(player.getId());

        if (playerRigidBodyId === undefined) {
            throw new Error('Player is not registered in physics system');
        }

        let playerRigidBody = null;

        for (const body of rigidBodies) {
            if (body.id === playerRigidBodyId) {
                playerRigidBody = body;
                break;
            }
        }

        if (playerRigidBody === null) {
            throw new Error('Player is not registered in physics system');
        }

        switch (event.keyCode) {
            case 'ArrowLeft':
                playerRigidBody.applyImpulseLinear(new Vec2(-50, 0));
                console.log('Arrow left');
                break;
            case 'ArrowRight':
                playerRigidBody.applyImpulseLinear(new Vec2(50, 0));
                console.log('Arrow right');
                break;
            case 'ArrowDown':
                playerRigidBody.applyImpulseLinear(new Vec2(0, -50));
                console.log('Arrow down');
                break;
            case 'ArrowUp':
                playerRigidBody.applyImpulseLinear(new Vec2(0, 50));
                console.log('Arrow up');
                break;
        }
    };

    update(deltaTime: number) {
        // Add entities added in engine but missing from physcis system
        const rigidBodies = this.world.getBodies();
        const rigidBodiesById = new Map<number, RigidBody>();

        const systemEntities = this.getSystemEntities();
        const systemEntitiesIds = new Set<number>();

        for (const entity of systemEntities) {
            systemEntitiesIds.add(entity.getId());

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
                    velocity: new Vec2(0, 0),
                });

                this.world.addBody(body);

                this.bodyIdToEntityId.set(body.id, entityId);
                this.entityIdToBodyId.set(entityId, body.id);
            }
        }

        // Remove entities present in physics system but removed from engine
        for (const body of rigidBodies) {
            rigidBodiesById.set(body.id, body);
            const bodyId = body.id;
            const entityId = this.bodyIdToEntityId.get(bodyId);
            
            const dragForce = Force.resistance.generateDragForce(body, 0.01, SETTINGS.dt);
            body.addForce(dragForce);

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

            const body = rigidBodiesById.get(bodyId);

            if (body === undefined) {
                throw new Error('Could not retrieve body with id ' + bodyId);
            }

            const position = body.position;
            const velocity = body.velocity;

            transform.position.x = position.x;
            transform.position.y = position.y;
            rigidBody.velocity.x = velocity.x;
            rigidBody.velocity.y = velocity.y;
        }
    }
}
