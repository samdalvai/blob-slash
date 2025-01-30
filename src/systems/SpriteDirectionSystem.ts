import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import SpriteDirectionComponent from '../components/SpriteDirectionComponent';
import System from '../ecs/System';

export default class SpriteDirectionSystem extends System {
    constructor() {
        super();
        this.requireComponent(SpriteDirectionComponent);
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

            if (rigidBody.direction.y < 0) {
                sprite.srcRect.y = rigidBody.velocity.y < 0 ? sprite.height * 4 : sprite.height * 0;
            } else if (rigidBody.direction.x > 0) {
                sprite.srcRect.y = rigidBody.velocity.x > 0 ? sprite.height * 5 : sprite.height * 1;
            } else if (rigidBody.direction.y > 0) {
                sprite.srcRect.y = rigidBody.velocity.y > 0 ? sprite.height * 6 : sprite.height * 2;
            } else if (rigidBody.direction.x < 0) {
                sprite.srcRect.y = rigidBody.velocity.x < 0 ? sprite.height * 7 : sprite.height * 3;
            }
        }
    }
}
