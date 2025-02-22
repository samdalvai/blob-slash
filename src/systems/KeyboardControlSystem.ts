import KeyboardControlComponent from '../components/KeyboardControlComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import KeyPressedEvent from '../events/KeyPressedEvent';
import KeyReleasedEvent from '../events/KeyReleasedEvent';

export default class KeyboardControlSystem extends System {
    keysPressed: string[] = [];

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
        const validKeys = ['ArrowUp', 'KeyW', 'ArrowRight', 'KeyD', 'ArrowDown', 'KeyS', 'ArrowLeft', 'KeyA'];
        if (validKeys.includes(event.keyCode) && !this.keysPressed.includes(event.keyCode)) {
            this.keysPressed.push(event.keyCode);
        }
    };

    onKeyReleased = (event: KeyReleasedEvent) => {
        this.keysPressed = this.keysPressed.filter(key => key !== event.keyCode);
    };

    update = () => {
        for (const entity of this.getSystemEntities()) {
            const keyboardControl = entity.getComponent(KeyboardControlComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);

            if (!keyboardControl || !rigidBody) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            console.log(this.keysPressed);

            if (this.keysPressed.length == 0) {
                rigidBody.velocity = { x: 0, y: 0 };
            } else {
                console.log('direction: ', this.getMovementDirection(keyboardControl.velocity));

                rigidBody.velocity = this.getMovementDirection(keyboardControl.velocity);
                //this.updateEntityMovement(rigidBody, keyboardControl, this.keysPressed[this.keysPressed.length - 1]);
            }
        }
    };

    getMovementDirection = (velocity: number) => {
        const keyMap: { [key: string]: { x: number; y: number } } = {
            ArrowUp: { x: 0, y: -velocity },
            KeyW: { x: 0, y: -velocity },
            ArrowDown: { x: 0, y: velocity },
            KeyS: { x: 0, y: velocity },
            ArrowLeft: { x: -velocity, y: 0 },
            KeyA: { x: -velocity, y: 0 },
            ArrowRight: { x: velocity, y: 0 },
            KeyD: { x: velocity, y: 0 },
        };

        let x = 0,
            y = 0;

        const recentKeys = this.keysPressed.slice(-2);

        recentKeys.forEach(key => {
            if (keyMap[key]) {
                x += keyMap[key].x;
                y += keyMap[key].y;
            }
        });

        return { x, y };
    };

    // updateEntityMovement = (
    //     rigidBody: RigidBodyComponent,
    //     keyboardControl: KeyboardControlComponent,
    //     movementDirection: Direction,
    // ) => {
    //     switch (movementDirection) {
    //         case Direction.UP:
    //             rigidBody.velocity.x = 0;
    //             rigidBody.velocity.y = -1 * keyboardControl.velocity;
    //             rigidBody.direction = { x: 0, y: -1 };
    //             break;
    //         case Direction.RIGHT:
    //             rigidBody.velocity.y = 0;
    //             rigidBody.velocity.x = keyboardControl.velocity;
    //             rigidBody.direction = { x: 1, y: 0 };
    //             break;
    //         case Direction.DOWN:
    //             rigidBody.velocity.x = 0;
    //             rigidBody.velocity.y = keyboardControl.velocity;
    //             rigidBody.direction = { x: 0, y: 1 };
    //             break;
    //         case Direction.LEFT:
    //             rigidBody.velocity.y = 0;
    //             rigidBody.velocity.x = -1 * keyboardControl.velocity;
    //             rigidBody.direction = { x: -1, y: 0 };
    //             break;
    //         default:
    //             break;
    //     }
    // };
}
