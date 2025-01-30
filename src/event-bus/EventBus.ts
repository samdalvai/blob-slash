import GameEvent from './GameEvent';

interface IEventCallback {
    execute(event: GameEvent): void;
}

class EventCallback<TOwner, TEvent extends GameEvent> implements IEventCallback {
    private ownerInstance: TOwner;
    private callbackFunction: (event: TEvent) => void;

    constructor(ownerInstance: TOwner, callbackFunction: (event: TEvent) => void) {
        this.ownerInstance = ownerInstance;
        this.callbackFunction = callbackFunction;
    }

    execute(event: GameEvent): void {
        this.callbackFunction.call(this.ownerInstance, event as TEvent);
    }
}

export default class EventBus {
    private subscribers: Map<string, IEventCallback[]>;

    constructor() {
        this.subscribers = new Map();
        console.log('EventBus constructor called!');
    }

    reset(): void {
        this.subscribers.clear();
    }

    subscribeToEvent<TOwner, TEvent extends GameEvent>(
        eventType: new (...args: any[]) => TEvent,
        ownerInstance: TOwner,
        callbackFunction: (event: TEvent) => void,
    ): void {
        const eventTypeName = eventType.name;
        if (!this.subscribers.has(eventTypeName)) {
            this.subscribers.set(eventTypeName, []);
        }
        const subscriber = new EventCallback(ownerInstance, callbackFunction);
        this.subscribers.get(eventTypeName)?.push(subscriber);
    }

    emitEvent<TEvent extends GameEvent>(
        eventType: new (...args: any[]) => TEvent,
        ...args: ConstructorParameters<typeof eventType>
    ): void {
        const eventTypeName = eventType.name;
        const handlers = this.subscribers.get(eventTypeName);
        if (handlers) {
            const eventInstance = new eventType(...args);
            handlers.forEach(handler => handler.execute(eventInstance));
        }
    }
}
