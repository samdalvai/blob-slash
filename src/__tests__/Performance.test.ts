import LifetimeComponent from '../components/LifetimeComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../engine/ecs/Registry';
import LifetimeSystem from '../game/systems/LifeTimeSystem';
import MovementSystem from '../game/systems/MovementSystem';

describe('Testing performance related functions', () => {
    test('A test on performance', () => {
        const timeAdd: number[] = [];
        const timeUpdate: number[] = [];
        const timeDelete: number[] = [];
        const timesTotal: number[] = [];

        for (let x = 0; x < 10; x++) {
            const start = performance.now();
            const registry = new Registry();
            registry.addSystem(MovementSystem);
            registry.addSystem(LifetimeSystem);

            for (let i = 0; i < 10000; i++) {
                const entity = registry.createEntity();
                entity.addComponent(RigidBodyComponent, { x: 10, y: 10 });
                entity.addComponent(TransformComponent, { x: 100, y: 100 });
                // entity.addComponent(LifetimeComponent, 10000);
            }

            registry.update();

            timeAdd.push(performance.now() - start);
            const startUpdate = performance.now();

            const movementSystem = registry.getSystem(MovementSystem);
            // const lifetimeSystm = registry.getSystem(LifetimeSystem);

            movementSystem?.update(10);
            // lifetimeSystm?.update();
            timeUpdate.push(performance.now() - startUpdate);

            const startDelete = performance.now();

            movementSystem?.getSystemEntities().forEach(entity => entity.kill());
            registry.update();

            timeDelete.push(performance.now() - startDelete);

            timesTotal.push(performance.now() - start);

            expect(movementSystem?.getSystemEntities().length).toBe(0);
        }

        let sum = 0;
        for (let x = 0; x < timeAdd.length; x++) {
            sum += timeAdd[x];
        }
        console.log('Time for adding entitites: ' + sum / timeAdd.length + ' ms');

        sum = 0;
        for (let x = 0; x < timeAdd.length; x++) {
            sum += timeUpdate[x];
        }
        console.log('Time for updating entitites: ' + sum / timeUpdate.length + ' ms');

        sum = 0;
        for (let x = 0; x < timeDelete.length; x++) {
            sum += timeDelete[x];
        }
        console.log('Time for deleting entitites: ' + sum / timeDelete.length + ' ms');

        sum = 0;
        for (let x = 0; x < timesTotal.length; x++) {
            sum += timesTotal[x];
        }
        console.log('Total time: ' + sum / timesTotal.length + ' ms');
    });
});
