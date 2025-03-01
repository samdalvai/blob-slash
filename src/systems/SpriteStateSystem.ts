import HealthComponent from '../components/HealthComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import SpriteStateComponent from '../components/SpriteStateComponent';
import System from '../ecs/System';

export default class SpriteStateSystem extends System {
    constructor() {
        super();
        this.requireComponent(SpriteStateComponent);
        this.requireComponent(SpriteComponent);
        this.requireComponent(RigidBodyComponent);
    }

    update() {
        for (const entity of this.getSystemEntities()) {
            const sprite = entity.getComponent(SpriteComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);

            if (!sprite || !rigidBody) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            let isHurt = false;

            if (entity.hasComponent(HealthComponent)) {
                const health = entity.getComponent(HealthComponent);

                if (!health) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                if (health.lastDamageTime !== 0 && performance.now() - health.lastDamageTime <= 500) {
                    isHurt = true;
                }
            }

            this.updateSpriteState(sprite, rigidBody, isHurt);
        }
    }

    updateSpriteState = (sprite: SpriteComponent, rigidBody: RigidBodyComponent, isHurt: boolean) => {
        let directionOffset = 0;

        if (rigidBody.direction.y < 0) {
            directionOffset = 0;
        } else if (rigidBody.direction.x > 0) {
            directionOffset = 1;
        } else if (rigidBody.direction.y > 0) {
            directionOffset = 2;
        } else if (rigidBody.direction.x < 0) {
            directionOffset = 3;
        }

        const isMoving = Math.abs(rigidBody.velocity.x) > 0 || Math.abs(rigidBody.velocity.y) > 0;
        const movementOffset = isMoving ? 4 : 0;
        const hurtOffset = isHurt ? (isMoving ? 4 : 8) : 0;

        const totalOffset = directionOffset + movementOffset + hurtOffset;

        sprite.srcRect.y = totalOffset * sprite.height;
    };
}
