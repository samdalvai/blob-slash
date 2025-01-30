import { expect } from '@jest/globals';

import EventBus from '../../src/event-bus/EventBus';
import GameEvent from '../../src/event-bus/GameEvent';

describe('Testing EventBus related functions', () => {
    test('Class instance should subscribe to custom event with a callback', () => {
        const eventBus = new EventBus();
        class MyEvent extends GameEvent {}

        class MyClass {
            value = 0;

            myCallBack() {
                this.value = 1;
            }
        }

        const myClassInstance = new MyClass();

        eventBus.subscribeToEvent(MyEvent, myClassInstance, myClassInstance.myCallBack);
        eventBus.emitEvent(MyEvent);

        expect(myClassInstance.value).toBe(1);
    });

    test('Mutliple class instances should subscribe to custom event with a callback', () => {
        const eventBus = new EventBus();
        class MyEvent extends GameEvent {}

        class MyClass {
            value = 0;

            myCallBack() {
                this.value = 1;
            }
        }

        const myClassInstance1 = new MyClass();
        const myClassInstance2 = new MyClass();

        eventBus.subscribeToEvent(MyEvent, myClassInstance1, myClassInstance1.myCallBack);
        eventBus.subscribeToEvent(MyEvent, myClassInstance2, myClassInstance1.myCallBack);

        eventBus.emitEvent(MyEvent);

        expect(myClassInstance1.value).toBe(1);
        expect(myClassInstance2.value).toBe(1);
    });

    test('Mutliple class instances should subscribe to custom event with different callbacks', () => {
        const eventBus = new EventBus();
        class MyEvent extends GameEvent {}

        class MyClass {
            value = 0;

            myCallBack1() {
                this.value = 1;
            }

            myCallBack2() {
                this.value = 2;
            }
        }

        const myClassInstance1 = new MyClass();
        const myClassInstance2 = new MyClass();

        eventBus.subscribeToEvent(MyEvent, myClassInstance1, myClassInstance1.myCallBack1);
        eventBus.subscribeToEvent(MyEvent, myClassInstance2, myClassInstance1.myCallBack2);

        eventBus.emitEvent(MyEvent);

        expect(myClassInstance1.value).toBe(1);
        expect(myClassInstance2.value).toBe(2);
    });

    test('Should clear subscribers to event emission', () => {
        const eventBus = new EventBus();
        class MyEvent extends GameEvent {}

        class MyClass {
            value = 0;

            myCallBack() {
                this.value = 1;
            }
        }

        const myClassInstance = new MyClass();

        eventBus.subscribeToEvent(MyEvent, myClassInstance, myClassInstance.myCallBack);
        eventBus.reset();
        eventBus.emitEvent(MyEvent);

        expect(myClassInstance.value).toBe(0);
    });

    test('Should handle callback with event having parameters', () => {
        const eventBus = new EventBus();
        class MyEvent extends GameEvent {
            value: number;

            constructor(value: number) {
                super();
                this.value = value;
            }
        }

        class MyClass {
            value = 0;

            myCallBack(event: MyEvent) {
                this.value = event.value;
            }
        }

        const myClassInstance = new MyClass();

        eventBus.subscribeToEvent(MyEvent, myClassInstance, myClassInstance.myCallBack);
        eventBus.emitEvent(MyEvent, 1);

        expect(myClassInstance.value).toBe(1);
    });
});
