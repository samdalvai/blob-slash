import OriginalComponent from '../src_old/engine/ecs/Component';
import { createComponentCatalog as createOriginalComponentCatalog } from '../src_old/engine/ecs/ComponentCatalog';
import OriginalRegistry from '../src_old/engine/ecs/Registry';
import OriginalSystem from '../src_old/engine/ecs/System';

import ModifiedComponent from '../src/engine/ecs/Component';
import { createComponentCatalog as createModifiedComponentCatalog } from '../src/engine/ecs/ComponentCatalog';
import ModifiedRegistry from '../src/engine/ecs/Registry';
import ModifiedSystem from '../src/engine/ecs/System';

type Vector = {
    x: number;
    y: number;
};

const ENTITY_COUNT = 160;
const MUTATION_COUNT = 40;
const DUPLICATE_COUNT = 16;
const KILL_COUNT = 56;

class OriginalPositionComponent extends OriginalComponent {
    position: Vector;

    constructor(position = { x: 0, y: 0 }) {
        super();
        this.position = position;
    }
}

class OriginalVelocityComponent extends OriginalComponent {
    velocity: Vector;

    constructor(velocity = { x: 0, y: 0 }) {
        super();
        this.velocity = velocity;
    }
}

class OriginalRenderableComponent extends OriginalComponent {
    assetId: string;
    zIndex: number;

    constructor(assetId = 'default', zIndex = 0) {
        super();
        this.assetId = assetId;
        this.zIndex = zIndex;
    }
}

class OriginalHealthComponent extends OriginalComponent {
    current: number;
    max: number;

    constructor(current = 100, max = 100) {
        super();
        this.current = current;
        this.max = max;
    }
}

class OriginalPositionSystem extends OriginalSystem {
    constructor() {
        super();
        this.requireComponent(OriginalPositionComponent);
    }
}

class OriginalMovementSystem extends OriginalSystem {
    constructor() {
        super();
        this.requireComponent(OriginalPositionComponent);
        this.requireComponent(OriginalVelocityComponent);
    }
}

class OriginalRenderSystem extends OriginalSystem {
    constructor() {
        super();
        this.requireComponent(OriginalPositionComponent);
        this.requireComponent(OriginalRenderableComponent);
    }
}

class OriginalHealthSystem extends OriginalSystem {
    constructor() {
        super();
        this.requireComponent(OriginalHealthComponent);
    }
}

class ModifiedPositionComponent extends ModifiedComponent {
    position: Vector;

    constructor(position = { x: 0, y: 0 }) {
        super();
        this.position = position;
    }
}

class ModifiedVelocityComponent extends ModifiedComponent {
    velocity: Vector;

    constructor(velocity = { x: 0, y: 0 }) {
        super();
        this.velocity = velocity;
    }
}

class ModifiedRenderableComponent extends ModifiedComponent {
    assetId: string;
    zIndex: number;

    constructor(assetId = 'default', zIndex = 0) {
        super();
        this.assetId = assetId;
        this.zIndex = zIndex;
    }
}

class ModifiedHealthComponent extends ModifiedComponent {
    current: number;
    max: number;

    constructor(current = 100, max = 100) {
        super();
        this.current = current;
        this.max = max;
    }
}

class ModifiedPositionSystem extends ModifiedSystem {
    constructor() {
        super();
        this.requireComponent(ModifiedPositionComponent);
    }
}

class ModifiedMovementSystem extends ModifiedSystem {
    constructor() {
        super();
        this.requireComponent(ModifiedPositionComponent);
        this.requireComponent(ModifiedVelocityComponent);
    }
}

class ModifiedRenderSystem extends ModifiedSystem {
    constructor() {
        super();
        this.requireComponent(ModifiedPositionComponent);
        this.requireComponent(ModifiedRenderableComponent);
    }
}

class ModifiedHealthSystem extends ModifiedSystem {
    constructor() {
        super();
        this.requireComponent(ModifiedHealthComponent);
    }
}

type EngineBindings = {
    RegistryClass: new () => any;
    PositionComponent: any;
    VelocityComponent: any;
    RenderableComponent: any;
    HealthComponent: any;
    PositionSystem: any;
    MovementSystem: any;
    RenderSystem: any;
    HealthSystem: any;
    componentCatalog: any;
};

const originalBindings: EngineBindings = {
    RegistryClass: OriginalRegistry,
    PositionComponent: OriginalPositionComponent,
    VelocityComponent: OriginalVelocityComponent,
    RenderableComponent: OriginalRenderableComponent,
    HealthComponent: OriginalHealthComponent,
    PositionSystem: OriginalPositionSystem,
    MovementSystem: OriginalMovementSystem,
    RenderSystem: OriginalRenderSystem,
    HealthSystem: OriginalHealthSystem,
    componentCatalog: createOriginalComponentCatalog([
        {
            name: 'PositionComponent',
            constructor: OriginalPositionComponent,
            clone: (component: OriginalPositionComponent) => [{ ...component.position }],
        },
        {
            name: 'VelocityComponent',
            constructor: OriginalVelocityComponent,
            clone: (component: OriginalVelocityComponent) => [{ ...component.velocity }],
        },
        {
            name: 'RenderableComponent',
            constructor: OriginalRenderableComponent,
            clone: (component: OriginalRenderableComponent) => [component.assetId, component.zIndex],
        },
        {
            name: 'HealthComponent',
            constructor: OriginalHealthComponent,
            clone: (component: OriginalHealthComponent) => [component.current, component.max],
        },
    ]),
};

const modifiedBindings: EngineBindings = {
    RegistryClass: ModifiedRegistry,
    PositionComponent: ModifiedPositionComponent,
    VelocityComponent: ModifiedVelocityComponent,
    RenderableComponent: ModifiedRenderableComponent,
    HealthComponent: ModifiedHealthComponent,
    PositionSystem: ModifiedPositionSystem,
    MovementSystem: ModifiedMovementSystem,
    RenderSystem: ModifiedRenderSystem,
    HealthSystem: ModifiedHealthSystem,
    componentCatalog: createModifiedComponentCatalog([
        {
            name: 'PositionComponent',
            constructor: ModifiedPositionComponent,
            clone: (component: ModifiedPositionComponent) => [{ ...component.position }],
        },
        {
            name: 'VelocityComponent',
            constructor: ModifiedVelocityComponent,
            clone: (component: ModifiedVelocityComponent) => [{ ...component.velocity }],
        },
        {
            name: 'RenderableComponent',
            constructor: ModifiedRenderableComponent,
            clone: (component: ModifiedRenderableComponent) => [component.assetId, component.zIndex],
        },
        {
            name: 'HealthComponent',
            constructor: ModifiedHealthComponent,
            clone: (component: ModifiedHealthComponent) => [component.current, component.max],
        },
    ]),
};

const countEntities = (entities: Iterable<unknown>) => {
    let count = 0;

    for (const _entity of entities) {
        count++;
    }

    return count;
};

const runEngineBenchmark = (bindings: EngineBindings) => {
    const registry = new bindings.RegistryClass();
    const entities: any[] = [];
    let checksum = 0;

    registry.addSystem(bindings.PositionSystem);
    registry.addSystem(bindings.MovementSystem);
    registry.addSystem(bindings.RenderSystem);
    registry.addSystem(bindings.HealthSystem);

    checksum += registry.hasSystem(bindings.PositionSystem) ? 1 : 0;
    checksum += registry.hasSystem(bindings.MovementSystem) ? 1 : 0;
    checksum += registry.hasSystem(bindings.RenderSystem) ? 1 : 0;
    checksum += registry.hasSystem(bindings.HealthSystem) ? 1 : 0;

    for (let i = 0; i < ENTITY_COUNT; i++) {
        const entity = registry.createEntity();
        entities.push(entity);

        entity.addComponent(bindings.PositionComponent, { x: i, y: i * 2 });

        if (i % 2 === 0) {
            entity.addComponent(bindings.VelocityComponent, { x: 1 + (i % 5), y: i % 3 });
        }

        if (i % 3 === 0) {
            entity.addComponent(bindings.RenderableComponent, `sprite-${i % 8}`, i % 10);
        }

        if (i % 4 === 0) {
            entity.addComponent(bindings.HealthComponent, 75 + (i % 25), 100);
        }

        if (i === 0) {
            entity.tag('player');
        }

        entity.group(i % 5 === 0 ? 'bosses' : 'actors');
    }

    registry.update();

    const positionSystem = registry.getSystem(bindings.PositionSystem);
    const movementSystem = registry.getSystem(bindings.MovementSystem);
    const renderSystem = registry.getSystem(bindings.RenderSystem);
    const healthSystem = registry.getSystem(bindings.HealthSystem);

    checksum += positionSystem.getSystemEntities().length;
    checksum += movementSystem.getSystemEntities().length;
    checksum += renderSystem.getSystemEntities().length;
    checksum += healthSystem.getSystemEntities().length;
    checksum += registry.getEntityByTag('player')?.getId() ?? 0;
    checksum += registry.getEntitiesByGroup('actors').length;
    checksum += registry.getEntitiesByGroup('bosses').length;

    for (let i = 0; i < ENTITY_COUNT; i++) {
        const entity = entities[i];

        if (entity.hasComponent(bindings.PositionComponent)) {
            const position = entity.getComponent(bindings.PositionComponent);
            position.position.x += i % 7;
            position.position.y -= i % 5;
            checksum += position.position.x + position.position.y;
        }

        if (entity.hasComponent(bindings.HealthComponent)) {
            const health = entity.getComponent(bindings.HealthComponent);
            health.current -= i % 3;
            checksum += health.current;
        }

        if (i % 11 === 0) {
            checksum += entity.getComponents().length;
        }
    }

    for (let i = 0; i < MUTATION_COUNT; i++) {
        const entityWithVelocity = entities[i * 2];
        entityWithVelocity.removeComponent(bindings.VelocityComponent);
        entityWithVelocity.removeFromSystem(bindings.MovementSystem);

        const entityWithoutVelocity = entities[i * 2 + 1];
        entityWithoutVelocity.addComponent(bindings.VelocityComponent, { x: 3, y: 2 });
        entityWithoutVelocity.addToSystem(bindings.MovementSystem);

        const renderedEntity = entities[i * 3];
        renderedEntity.removeComponent(bindings.RenderableComponent);
        renderedEntity.removeFromSystem(bindings.RenderSystem);
    }

    checksum += movementSystem.getSystemEntities().length;
    checksum += renderSystem.getSystemEntities().length;

    for (let i = 0; i < DUPLICATE_COUNT; i++) {
        const duplicatedEntity = entities[i].duplicate(bindings.componentCatalog);
        entities.push(duplicatedEntity);
        checksum += duplicatedEntity.getComponents().length;
    }

    registry.update();

    checksum += positionSystem.getSystemEntities().length;
    checksum += movementSystem.getSystemEntities().length;
    checksum += renderSystem.getSystemEntities().length;
    checksum += healthSystem.getSystemEntities().length;

    for (let i = 0; i < KILL_COUNT; i++) {
        entities[i].kill();
    }

    registry.update();

    checksum += countEntities(registry.getAllEntities());
    checksum += positionSystem.getSystemEntities().length;
    checksum += movementSystem.getSystemEntities().length;
    checksum += renderSystem.getSystemEntities().length;
    checksum += healthSystem.getSystemEntities().length;

    registry.removeSystem(bindings.HealthSystem);
    checksum += registry.hasSystem(bindings.HealthSystem) ? 1000 : 1;
    registry.addSystem(bindings.HealthSystem);
    checksum += registry.hasSystem(bindings.HealthSystem) ? 1 : 0;

    registry.clear();
    checksum += countEntities(registry.getAllEntities());

    return checksum;
};

export function runOriginal() {
    return runEngineBenchmark(originalBindings);
}

export function runModified() {
    return runEngineBenchmark(modifiedBindings);
}
