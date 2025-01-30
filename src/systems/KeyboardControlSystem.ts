import KeyboardControlComponent from '../components/KeyboardControlComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import KeyPressedEvent from '../events/KeyPressedEvent';
import KeyReleasedEvent from '../events/KeyReleasedEvent';
import { Direction } from '../types';

export default class KeyboardControlSystem extends System {
    keysPressed: Direction[] = [];

    constructor() {
        super();
        this.requireComponent(KeyboardControlComponent);
        this.requireComponent(SpriteComponent);
        this.requireComponent(RigidBodyComponent);
    }

    subscribeToEvents = (eventBus: EventBus) => {
        eventBus.subscribeToEvent(KeyPressedEvent, this, this.onKeyPressed);
        eventBus.subscribeToEvent(KeyReleasedEvent, this, this.onKeyReleased);
    };

    onKeyPressed = (event: KeyPressedEvent) => {
        switch (event.keyCode) {
            case 'ArrowUp':
            case 'KeyW':
                this.keysPressed.push(Direction.UP);
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keysPressed.push(Direction.RIGHT);
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keysPressed.push(Direction.DOWN);
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.keysPressed.push(Direction.LEFT);
                break;
        }
    };

    onKeyReleased = (event: KeyReleasedEvent) => {
        switch (event.keyCode) {
            case 'ArrowUp':
            case 'KeyW':
                this.keysPressed = this.keysPressed.filter(key => key !== Direction.UP);
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keysPressed = this.keysPressed.filter(key => key !== Direction.RIGHT);
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keysPressed = this.keysPressed.filter(key => key !== Direction.DOWN);
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.keysPressed = this.keysPressed.filter(key => key !== Direction.LEFT);
                break;
        }
    };

    update = () => {
        for (const entity of this.getSystemEntities()) {
            const keyboardControl = entity.getComponent(KeyboardControlComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);

            if (!keyboardControl || !rigidBody) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (this.keysPressed.length == 0) {
                rigidBody.velocity = { x: 0, y: 0 };
            } else {
                this.updateEntityMovement(rigidBody, keyboardControl, this.keysPressed[this.keysPressed.length - 1]);
            }
        }
    };

    updateEntityMovement = (
        rigidBody: RigidBodyComponent,
        keyboardControl: KeyboardControlComponent,
        movementDirection: Direction,
    ) => {
        switch (movementDirection) {
            case Direction.UP:
                rigidBody.velocity.x = 0;
                rigidBody.velocity.y = keyboardControl.upVelocity;
                rigidBody.direction = { x: 0, y: -1 };
                break;
            case Direction.RIGHT:
                rigidBody.velocity.y = 0;
                rigidBody.velocity.x = keyboardControl.rightVelocity;
                rigidBody.direction = { x: 1, y: 0 };
                break;
            case Direction.DOWN:
                rigidBody.velocity.x = 0;
                rigidBody.velocity.y = keyboardControl.downVelocity;
                rigidBody.direction = { x: 0, y: 1 };
                break;
            case Direction.LEFT:
                rigidBody.velocity.y = 0;
                rigidBody.velocity.x = keyboardControl.leftVelocity;
                rigidBody.direction = { x: -1, y: 0 };
                break;
            default:
                break;
        }
    };
}
