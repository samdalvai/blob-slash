import OriginalEntity from '../src_old/engine/ecs/Entity';
import OriginalRegistry from '../src_old/engine/ecs/Registry';
import OriginalSystem from '../src_old/engine/ecs/System';

import ModifiedEntity from '../src/engine/ecs/Entity';
import ModifiedRegistry from '../src/engine/ecs/Registry';
import ModifiedSystem from '../src/engine/ecs/System';

const ENTITY_COUNT = 10_000;

type BenchmarkContext<TEntity, TSystem extends SystemLike<TEntity>> = {
    entities: TEntity[];
    nextEntityIndex: number;
    system: TSystem;
};

type SystemLike<TEntity> = {
    addEntityToSystem(entity: TEntity): void;
    getSystemEntities(): TEntity[];
    removeEntityFromSystem(entity: TEntity): void;
};

const createOriginalContext = (): BenchmarkContext<OriginalEntity, OriginalSystem> => {
    const registry = new OriginalRegistry();
    const system = new OriginalSystem();
    const entities: OriginalEntity[] = [];

    for (let i = 0; i < ENTITY_COUNT; i++) {
        const entity = new OriginalEntity(i, registry);
        entities.push(entity);
        system.addEntityToSystem(entity);
    }

    return {
        entities,
        nextEntityIndex: 0,
        system,
    };
};

const createModifiedContext = (): BenchmarkContext<ModifiedEntity, ModifiedSystem> => {
    const registry = new ModifiedRegistry();
    const system = new ModifiedSystem();
    const entities: ModifiedEntity[] = [];

    for (let i = 0; i < ENTITY_COUNT; i++) {
        const entity = new ModifiedEntity(i, registry);
        entities.push(entity);
        system.addEntityToSystem(entity);
    }

    return {
        entities,
        nextEntityIndex: 0,
        system,
    };
};

const runRemoveEntityBenchmark = <TEntity, TSystem extends SystemLike<TEntity>>(
    context: BenchmarkContext<TEntity, TSystem>,
) => {
    const entity = context.entities[context.nextEntityIndex];
    context.nextEntityIndex = (context.nextEntityIndex + 1) % context.entities.length;

    context.system.removeEntityFromSystem(entity);
    context.system.addEntityToSystem(entity);

    return context.system.getSystemEntities().length;
};

const originalContext = createOriginalContext();
const modifiedContext = createModifiedContext();

export function runOriginal() {
    return runRemoveEntityBenchmark(originalContext);
}

export function runModified() {
    return runRemoveEntityBenchmark(modifiedContext);
}
