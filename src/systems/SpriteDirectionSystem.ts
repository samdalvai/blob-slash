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
                sprite.srcRect.y = sprite.height * 0;
            } else if (rigidBody.direction.x > 0) {
                sprite.srcRect.y = sprite.height * 1;
            } else if (rigidBody.direction.y > 0) {
                sprite.srcRect.y = sprite.height * 2;
            } else if (rigidBody.direction.x < 0) {
                sprite.srcRect.y = sprite.height * 3;
            }
        }
    }
}
