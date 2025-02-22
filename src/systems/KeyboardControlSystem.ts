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

            if (this.keysPressed.length == 0) {
                rigidBody.velocity = { x: 0, y: 0 };
            } else {
                const velocity = this.getVelocity(keyboardControl.velocity);
                rigidBody.velocity = velocity;

                if (velocity.x < 0) {
                    rigidBody.direction = { x: -1, y: 0 };
                } else if (velocity.x > 0) {
                    rigidBody.direction = { x: 1, y: 0 };
                } else if (velocity.y < 0) {
                    rigidBody.direction = { x: 0, y: -1 };
                } else if (velocity.y > 0) {
                    rigidBody.direction = { x: 0, y: 1 };
                }
            }
        }
    };

    getVelocity = (velocity: number) => {
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

        let x = 0;
        let y = 0;

        const recentKeys = this.keysPressed.slice(-2);

        recentKeys.forEach(key => {
            if (keyMap[key]) {
                x += keyMap[key].x;
                y += keyMap[key].y;
            }
        });

        if (x !== 0 && y !== 0) {
            const magnitude = Math.sqrt(x ** 2 + y ** 2);
            if (magnitude === 0) return { x, y };
            return { x: (x / magnitude) * velocity, y: (y / magnitude) * velocity };
        }

        return { x, y };
    };
}
