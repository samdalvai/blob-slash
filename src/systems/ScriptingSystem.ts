import RigidBodyComponent from '../components/RigidBodyComponent';
import ScriptComponent from '../components/ScriptComponent';
import System from '../ecs/System';

export default class ScriptingSystem extends System {
    constructor() {
        super();
        this.requireComponent(ScriptComponent);
        this.requireComponent(RigidBodyComponent);
    }

    update() {
        for (const entity of this.getSystemEntities()) {
            const script = entity.getComponent(ScriptComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);

            if (!script || !rigidBody) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const currentAction = script.scripts[script.currentActionIndex];

            if (performance.now() - script.actionStart > currentAction.duration) {
                // Action has expired, switch action
                script.actionStart = performance.now();
                script.currentActionIndex = (script.currentActionIndex + 1) % script.scripts.length;
            } else {
                rigidBody.velocity = { ...currentAction.movement };

                if (rigidBody.velocity.x > 0) {
                    rigidBody.direction = { x: 1, y: 0 };
                } else if (rigidBody.velocity.x < 0) {
                    rigidBody.direction = { x: -1, y: 0 };
                } else if (rigidBody.velocity.y > 0) {
                    rigidBody.direction = { x: 0, y: 1 };
                } else if (rigidBody.velocity.y < 0) {
                    rigidBody.direction = { x: 0, y: -1 };
                }
            }
        }
    }
}
